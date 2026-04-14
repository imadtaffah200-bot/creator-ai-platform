FROM python:3.11.9-slim

WORKDIR /app

# تثبيت dependencies
COPY backend/requirements.txt .

RUN apt-get update && apt-get install -y ffmpeg && \
    pip install --no-cache-dir -r requirements.txt

# نسخ backend
COPY backend ./backend

WORKDIR /app/backend

# تشغيل FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]