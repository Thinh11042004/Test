FROM python:3.12-slim
WORKDIR /repo/apps/ai-service
COPY apps/ai-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/ai-service/src ./src
EXPOSE 8000
CMD ["python","-m","uvicorn","src.main:app","--host","0.0.0.0","--port","8000","--reload"]
