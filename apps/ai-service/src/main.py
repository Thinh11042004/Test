import json
import os
from typing import Any, Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="AI Service - HRMS",
    description="AI-powered HR and Recruitment Management Service",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Health Check Endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and monitoring"""
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": "2.0.0"
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "AI Service - HRMS",
        "version": "2.0.0",
        "status": "running"
    }


class CandidateSummaryRequest(BaseModel):
    candidate: Dict[str, Any]
    job: Optional[Dict[str, Any]] = None
    narrative_focus: str = Field(default="career", alias="narrativeFocus")
    language: str = Field(default="vi")

    class Config:
        populate_by_name = True


class MatchRequest(BaseModel):
    job: Dict[str, Any]
    candidate: Dict[str, Any]
    matched_skills: List[str] = Field(default_factory=list, alias="matchedSkills")
    missing_skills: List[str] = Field(default_factory=list, alias="missingSkills")
    match_score: Optional[int] = Field(default=None, alias="matchScore")

    class Config:
        populate_by_name = True


class InterviewFeedbackRequest(BaseModel):
    interview: Dict[str, Any]
    notes: Optional[str] = None
    focus_points: List[str] = Field(default_factory=list, alias="focusPoints")

    class Config:
        populate_by_name = True


class ResumeParseRequest(BaseModel):
    candidate: Optional[Dict[str, Any]] = None
    resume_text: str = Field(..., alias="resumeText")
    language: str = Field(default="vi")

    class Config:
        populate_by_name = True


class OpenRouterClient:
    def __init__(self) -> None:
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
        self.model = os.getenv("OPENROUTER_MODEL", "openrouter/anthropic/claude-3.5-sonnet")
        self.title = os.getenv("OPENROUTER_TITLE", "NovaPeople AI Service")
        self.referrer = os.getenv("OPENROUTER_REFERRER", "https://novapeople.example")

    async def chat(self, messages: List[Dict[str, str]], temperature: float = 0.25, max_tokens: int = 800) -> str:
        if not self.api_key:
            raise HTTPException(status_code=503, detail="OPENROUTER_API_KEY is not configured")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": self.referrer,
            "X-Title": self.title
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }

        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=10.0)) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )

        if response.status_code >= 400:
            detail = response.json().get("error", {}).get("message") if response.content else response.text
            raise HTTPException(status_code=response.status_code, detail=detail or "OpenRouter request failed")

        data = response.json()
        try:
            return data["choices"][0]["message"]["content"].strip()
        except (KeyError, IndexError):
            raise HTTPException(status_code=502, detail="Malformed response from OpenRouter")


openrouter_client = OpenRouterClient()


def build_candidate_summary_prompt(request: CandidateSummaryRequest) -> List[Dict[str, str]]:
    candidate = request.candidate
    job = request.job
    focus = request.narrative_focus

    system_prompt = (
        "You are NovaPeople's HR Copilot. Craft concise insights for HR managers using Vietnamese with localized tone. "
        "Focus on practical actions, highlight momentum, and flag any risks objectively."
    )

    candidate_points = [
        f"Tên ứng viên: {candidate.get('name') or candidate.get('fullName')}",
        f"Vai trò hiện tại mong muốn: {candidate.get('desiredRole') or candidate.get('headline')}",
        f"Kinh nghiệm: {candidate.get('experienceYears') or candidate.get('totalExperienceYears')} năm",
        f"Kỹ năng cốt lõi: {', '.join(candidate.get('skills', [])[:6])}",
        f"Điểm nổi bật CV: {', '.join(candidate.get('resumeHighlights', [])[:3]) or 'Chưa cung cấp'}"
    ]

    if job:
        candidate_points.append(f"Ứng tuyển vào: {job.get('title')} (phòng {job.get('department')})")
        candidate_points.append(f"Yêu cầu bắt buộc: {', '.join(job.get('requiredSkills', [])[:5])}")

    user_prompt = (
        "\n".join(candidate_points)
        + "\n\nYêu cầu:"
        + "\n- Tạo bản tóm tắt "
        + ("thúc đẩy câu chuyện phát triển nghề nghiệp" if focus == 'career' else "đánh giá độ phù hợp văn hoá" if focus == 'culture' else "đào sâu kỹ năng chủ chốt")
        + "\n- Đề xuất hành động tiếp theo trong 30 ngày"
        + "\n- Gợi ý chương trình đào tạo phù hợp"
    )

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]


def build_match_prompt(request: MatchRequest) -> List[Dict[str, str]]:
    job = request.job
    candidate = request.candidate

    system_prompt = (
        "Bạn là chuyên gia tuyển dụng tại NovaPeople. So sánh ứng viên và JD bằng giọng phân tích súc tích, "
        "đưa ra quyết định với khuyến nghị cụ thể."
    )

    user_prompt = (
        f"JD: {job.get('title')} - cấp độ {job.get('level')} tại {job.get('department')}\n"
        f"Kỹ năng bắt buộc: {', '.join(job.get('requiredSkills', [])[:8])}\n"
        f"Kỹ năng nice-to-have: {', '.join(job.get('niceToHaveSkills', [])[:5])}\n\n"
        f"Ứng viên: {candidate.get('name')} ({candidate.get('headline')})\n"
        f"Kỹ năng ứng viên: {', '.join(candidate.get('skills', [])[:10])}\n"
        f"Kinh nghiệm: {candidate.get('experienceYears') or candidate.get('totalExperienceYears')} năm\n"
        f"Kỹ năng trùng khớp: {', '.join(request.matched_skills) or 'Chưa có dữ liệu'}\n"
        f"Thiếu hụt: {', '.join(request.missing_skills) or 'Không đáng kể'}\n"
        f"Điểm matching sơ bộ: {request.match_score or 'Chưa tính'}"
        "\n\nNhiệm vụ:\n"
        "1. Đánh giá tổng quan độ phù hợp (tối đa 3 câu).\n"
        "2. Đề xuất 2 bước tiếp theo ưu tiên.\n"
        "3. Gợi ý câu hỏi phỏng vấn đào sâu."
    )

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]


def build_interview_prompt(request: InterviewFeedbackRequest) -> List[Dict[str, str]]:
    interview = request.interview

    system_prompt = (
        "Bạn là trợ lý phỏng vấn hỗ trợ ghi biên bản và đề xuất hành động tiếp theo."
    )

    notes = request.notes or ""
    focus = "\n".join(f"- {point}" for point in request.focus_points)

    user_prompt = (
        f"Ứng viên: {interview.get('candidate', {}).get('name')}\n"
        f"Vòng phỏng vấn: {interview.get('stage')}\n"
        f"Người phỏng vấn: {', '.join(interview.get('interviewers', []))}\n"
        f"Ghi chú: {notes}\n"
        f"Điểm cần quan sát thêm:\n{focus or '- Không có'}\n\n"
        "Hãy tổng hợp 3 mục:\n1. Tóm tắt hành vi nổi bật\n2. Rủi ro/điểm cần bổ sung dữ liệu\n3. Hành động khuyến nghị trong 7 ngày"
    )

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]


def build_resume_prompt(request: ResumeParseRequest) -> List[Dict[str, str]]:
    candidate = request.candidate or {}

    system_prompt = (
        "Bạn là bot đọc CV. Xuất dữ liệu JSON với các khóa: summary, skills, highlights (tối đa 5), risks (tối đa 3)."
    )

    user_prompt = (
        f"Ứng viên: {candidate.get('name') or 'Chưa xác định'}\n"
        f"CV:\n{request.resume_text}\n"
        "Hãy trả về JSON theo yêu cầu."
    )

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]


@app.get("/")
async def root():
    return {"message": "AI Service is running", "status": "healthy"}


@app.get("/health")
async def health_check():
    status = "healthy" if openrouter_client.api_key else "degraded"
    return {"status": status, "service": "ai-service"}


@app.post("/ai/candidate-summary")
async def candidate_summary(request: CandidateSummaryRequest):
    prompt = build_candidate_summary_prompt(request)
    content = await openrouter_client.chat(prompt, temperature=0.3, max_tokens=600)
    return {"summary": content, "focus": request.narrative_focus}


@app.post("/ai/match")
async def candidate_match(request: MatchRequest):
    prompt = build_match_prompt(request)
    content = await openrouter_client.chat(prompt, temperature=0.2, max_tokens=700)
    return {"analysis": content}


@app.post("/ai/interview-feedback")
async def interview_feedback(request: InterviewFeedbackRequest):
    prompt = build_interview_prompt(request)
    content = await openrouter_client.chat(prompt, temperature=0.35, max_tokens=500)
    return {"feedback": content}


@app.post("/ai/parse-resume")
async def parse_resume(request: ResumeParseRequest):
    prompt = build_resume_prompt(request)
    content = await openrouter_client.chat(prompt, temperature=0.1, max_tokens=400)

    try:
        parsed = json.loads(content)
    except Exception:
        parsed = {
            "summary": content,
            "skills": [],
            "highlights": [],
            "risks": []
        }

    return parsed
