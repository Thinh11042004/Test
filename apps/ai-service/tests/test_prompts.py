from src.main import (
    CandidateSummaryRequest,
    MatchRequest,
    ResumeParseRequest,
    build_candidate_summary_prompt,
    build_match_prompt,
    build_resume_prompt,
)


def test_candidate_summary_prompt_includes_candidate_and_job_details():
    request = CandidateSummaryRequest(
        candidate={
            "name": "Lan Nguyen",
            "desiredRole": "Senior Product Manager",
            "experienceYears": 6,
            "skills": ["Product Strategy", "OKRs", "Stakeholder Management"],
            "resumeHighlights": ["Scale up ARR", "Lead product launch"],
        },
        job={
            "title": "Head of Product",
            "department": "Product",
            "requiredSkills": ["Leadership", "Product Discovery"],
        },
        narrativeFocus="career",
    )

    prompt = build_candidate_summary_prompt(request)

    assert prompt[0]["role"] == "system"
    assert "Lan Nguyen" in prompt[1]["content"]
    assert "Ứng tuyển vào" in prompt[1]["content"]
    assert "Tạo bản tóm tắt" in prompt[1]["content"]


def test_match_prompt_highlights_matching_information():
    request = MatchRequest(
        job={
            "title": "Senior Backend Engineer",
            "level": "Senior",
            "department": "Engineering",
            "requiredSkills": ["Python", "FastAPI"],
            "niceToHaveSkills": ["AWS", "Postgres"],
        },
        candidate={
            "name": "Minh Tran",
            "headline": "Backend Engineer",
            "skills": ["Python", "FastAPI", "Docker"],
            "experienceYears": 5,
        },
        matched_skills=["Python", "FastAPI"],
        missing_skills=["AWS"],
        match_score=82,
    )

    prompt = build_match_prompt(request)

    assert prompt[0]["role"] == "system"
    assert "Senior Backend Engineer" in prompt[1]["content"]
    assert "Kỹ năng trùng khớp" in prompt[1]["content"]
    assert "Thiếu hụt" in prompt[1]["content"]


def test_resume_prompt_requests_structured_json():
    request = ResumeParseRequest(
        candidate={"name": "An Pham"},
        resume_text="Kinh nghiệm 8 năm trong lĩnh vực data"
    )

    prompt = build_resume_prompt(request)

    assert prompt[0]["role"] == "system"
    assert "Ứng viên: An Pham" in prompt[1]["content"]
    assert "Hãy trả về JSON" in prompt[1]["content"]