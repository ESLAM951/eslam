# سباق المعلومات — تطبيق مستقل

لعبة أسئلة وأجوبة أونلاين بين لاعبين، تتصل لحظيًا (Socket.io)، من غير أي ارتباط بـ Claude.

## تشغيلها على جهازك (اختياري، للتجربة)

```bash
npm install
node server.js
```

بعدين افتح `http://localhost:3000` في المتصفح.

## نشرها أونلاين (مجانًا) — الطريقة المقترحة: Render.com

1. اعمل حساب على https://render.com (تقدر تسجل بحساب GitHub).
2. ارفع فولدر المشروع ده على GitHub repo جديد (لو محتاج مساعدة في الرفع قولي).
3. من Render Dashboard: **New > Web Service** واختار الـ repo.
4. الإعدادات:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free
5. دوس **Create Web Service** — هياخد دقيقتين وهيديك رابط زي:
   `https://trivia-race-xxxx.onrender.com`
6. ابعت الرابط ده لصاحبك — الاتنين تفتحوا نفس الرابط وتلعبوا.

**ملحوظة عن الخطة المجانية في Render:** السيرفر بينام لو محدش استخدمه لمدة، وأول طلب بعد النوم بياخد شوية ثواني يصحى — عادي، مش عيب في التطبيق.

### بديل: Railway.app
نفس الفكرة تقريبًا (Deploy from GitHub، أو حتى رفع مباشر من غير GitHub لو حابب أبسط طريقة).

## هيكل المشروع

```
trivia-app/
├── server.js        # السيرفر (Express + Socket.io) — منطق اللعبة والغرف
├── package.json
└── public/
    └── index.html   # الواجهة (HTML/CSS/JS عادي، من غير أي framework)
```

## تعديل الأسئلة

الأسئلة موجودة في `server.js` في مصفوفة `QUESTIONS` في الأول. تقدر تضيف/تعدل أي سؤال بنفس الشكل:

```js
{ q: "نص السؤال؟", choices: ["اختيار 1", "اختيار 2", "اختيار 3", "اختيار 4"], correct: 1 }
```

`correct` هو رقم الاختيار الصح (بيبدأ من 0).
