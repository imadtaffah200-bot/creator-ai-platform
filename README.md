# منصة Creator AI Platform

منصة SaaS عربية بالكامل لصنّاع المحتوى العرب، مبنية بواجهة RTL حديثة، وتدعم توليد الأفكار، السكربت، الصور، الفيديو، الصوت، الأفاتار، تحليل الترندات، إدارة المشاريع، ولوحة تحكم Analytics.

## المزايا

- مولد أفكار Viral مبني على الترندات الحية
- مولد سكربت عربي احترافي مع Hook + Storytelling + CTA
- دعم اللهجات العربية (مصري، خليجي، مغربي، فصحى...)
- توليد صور AI بأنماط: واقعي / كرتوني / سينمائي
- إنشاء فيديو جاهز للنشر مع Subtitles وموسيقى وانتقالات
- توليد صوت عربي واقعي
- AI Avatar مع Lip Sync
- تحليل TikTok / YouTube / Instagram + هاشتاغات + أوقات نشر
- مساعد ذكي داخلي لتحسين السكربت
- نظام مشاريع متكامل مع حفظ وتعديل وتنزيل الملفات
- Viral Score + توصيات ذكية + Thumbnail Generator
- استخراج سكربت من فيديو
- لوحة تحكم Analytics

## التقنيات

### Frontend
- React + Vite + TypeScript
- TailwindCSS
- RTL + Dark Mode

### Backend
- FastAPI
- SQLite + SQLAlchemy
- JWT Authentication
- MoviePy + Pillow + FFmpeg

### AI Integrations
- OpenAI Chat / Images / TTS / Transcription
- fal.ai Avatar / optional Image-to-Video animation
- YouTube Data API
- Google Trends RSS
- Optional Apify for TikTok / Instagram scraping

## هيكل المشروع

```bash
creator-ai-platform/
├── frontend/
├── backend/
├── public/
├── assets/
├── components/
├── pages/
├── styles/
├── utils/
├── .env.example
├── README.md
└── start.sh
```

## المتطلبات

- Node.js 20+
- Python 3.11+
- FFmpeg مثبت على النظام

## إعداد المشروع

انسخ ملف البيئة:

```bash
cp .env.example .env
```

ثم عبّئ المفاتيح التالية على الأقل:

- `OPENAI_API_KEY`
- `YOUTUBE_API_KEY`

اختياري لكنه يفعّل ميزات إضافية:

- `FAL_KEY` لتوليد Avatar وتحريك الصور إلى فيديو
- `APIFY_TOKEN` + Actor IDs لتحليل TikTok / Instagram

## التشغيل السريع

```bash
chmod +x start.sh
./start.sh
```

أو يدويًا:

### تشغيل الـ Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### تشغيل الـ Frontend

```bash
cd frontend
npm install
npm run dev
```

- الواجهة: `http://localhost:5173`
- الـ API: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`

## كيف تعمل الميزات

### 1) توليد الأفكار
من صفحة لوحة التحكم، اختر المجال والمنصة واللهجة، وسيتم سحب بيانات الترندات الحية ثم توليد أفكار Viral عبر الذكاء الاصطناعي.

### 2) توليد السكربت
أدخل الفكرة، اختر اللهجة ونبرة المحتوى وطوله، وسيتم إنشاء سكربت جاهز للتصوير مع Hook + Storytelling + CTA.

### 3) الصور
يمكنك توليد صور من السكربت أو من وصف مخصص، واختيار النمط البصري والدقة.

### 4) الفيديو
يتم تحويل الصور + السكربت + التعليق الصوتي إلى فيديو عمودي جاهز للنشر، مع Subtitles وانتقالات وموسيقى. لو تم ضبط `FAL_VIDEO_MODEL` سيحاول النظام تحريك الصور أولاً ثم دمجها، وإلا يتم بناء فيديو احترافي محليًا عبر MoviePy.

### 5) الصوت
تحويل النص إلى صوت عربي عبر OpenAI TTS، مع اختيار الصوت والجنس والنبرة.

### 6) AI Avatar
يرسل النظام صورة الأفاتار والنص إلى fal.ai لإنشاء فيديو Talking Avatar مع Lip Sync.

### 7) الترندات
- YouTube عبر YouTube Data API
- Google Trends RSS
- TikTok/Instagram عبر Apify (اختياري)

### 8) استخراج سكربت من فيديو
ارفع فيديو، وسيتم استخراج الصوت ثم تفريغه نصيًا عبر OpenAI Whisper.

## ملاحظات إنتاجية

- لا يوجد بيانات تجريبية أو Mock Data داخل التطبيق.
- كل التكاملات حقيقية، لكنها تعتمد على مفاتيح API الصحيحة.
- عند غياب مزوّد اختياري مثل Apify أو fal، سيستمر التطبيق في العمل مع إظهار سبب عدم تفعيل الميزة الاختيارية.
- ملفات الوسائط الناتجة تحفظ داخل `backend/storage/` ويتم تقديمها كملفات ثابتة.

## أمان

- JWT Auth
- Hashing لكلمات المرور
- CORS قابل للضبط
- فصل واضح بين الخدمات والراوترات
- دعم ملفات `.env`

## أفكار للتوسعة لاحقًا

- Stripe للاشتراكات
- Queue / Workers لمعالجة الفيديو الطويل
- S3 أو Cloudflare R2 للتخزين السحابي
- Redis للـ caching و rate limiting
- Webhooks للنشر التلقائي على المنصات

بالتوفيق ✨
