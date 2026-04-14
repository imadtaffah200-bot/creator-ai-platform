#!/usr/bin/env bash
set -e
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  echo "[i] تم إنشاء ملف .env من .env.example — عدّل المفاتيح قبل التشغيل الكامل."
fi

export $(grep -v '^#' "$ROOT_DIR/.env" | xargs -d '\n' 2>/dev/null || true)

cd "$ROOT_DIR/backend"
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/creator-ai-backend.log 2>&1 &
BACK_PID=$!
cd "$ROOT_DIR/frontend"
npm install
nohup npm run dev -- --host 0.0.0.0 --port 5173 > /tmp/creator-ai-frontend.log 2>&1 &
FRONT_PID=$!

echo "Backend PID: $BACK_PID"
echo "Frontend PID: $FRONT_PID"
echo "واجهة الويب: http://localhost:5173"
echo "API: http://localhost:8000"
echo "سجل الـ Backend: /tmp/creator-ai-backend.log"
echo "سجل الـ Frontend: /tmp/creator-ai-frontend.log"
wait
