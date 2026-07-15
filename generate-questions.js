// generate-questions.js
// Builds a bank of ~1000 unique Arabic trivia questions and writes questions.js
// Run once with: node generate-questions.js

const fs = require("fs");

const bank = [];
const seenText = new Set();

function addQuestion(q, choices, correct) {
  if (seenText.has(q)) return false;
  seenText.add(q);
  bank.push({ q, choices, correct });
  return true;
}

function shuffleWithCorrect(correctValue, wrongValues) {
  const choices = [correctValue, ...wrongValues];
  // Fisher-Yates shuffle, tracking where correctValue ends up
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  const correct = choices.indexOf(correctValue);
  return { choices: choices.map(String), correct };
}

// ---------- 1) Curated general-knowledge questions ----------
const curated = [
  { q: "ايه هي أكبر دولة عربية من حيث المساحة؟", choices: ["مصر", "الجزائر", "السعودية", "السودان"], correct: 1 },
  { q: "كام عدد اللاعبين في فريق كرة القدم داخل الملعب؟", choices: ["9", "10", "11", "12"], correct: 2 },
  { q: "مين اللي كتب رواية 'مدن الملح'؟", choices: ["نجيب محفوظ", "عبدالرحمن منيف", "طه حسين", "يوسف إدريس"], correct: 1 },
  { q: "إيه هو أسرع حيوان بري في العالم؟", choices: ["الأسد", "الفهد", "النمر", "الحصان"], correct: 1 },
  { q: "كام قارة في العالم؟", choices: ["5", "6", "7", "8"], correct: 2 },
  { q: "إيه هي عاصمة اليابان؟", choices: ["بكين", "سيول", "طوكيو", "بانكوك"], correct: 2 },
  { q: "مين اخترع المصباح الكهربائي؟", choices: ["نيوتن", "إديسون", "أينشتاين", "تسلا"], correct: 1 },
  { q: "كام عدد أضلاع المثمن؟", choices: ["6", "7", "8", "9"], correct: 2 },
  { q: "إيه هو أطول نهر في العالم؟", choices: ["الأمازون", "النيل", "المسيسيبي", "اليانغتسي"], correct: 1 },
  { q: "في أي سنة هبط الإنسان على القمر لأول مرة؟", choices: ["1965", "1969", "1972", "1959"], correct: 1 },
  { q: "كام عدد عظام جسم الإنسان البالغ؟", choices: ["186", "206", "226", "246"], correct: 1 },
  { q: "إيه هو الكوكب الأقرب للشمس؟", choices: ["الزهرة", "الأرض", "عطارد", "المريخ"], correct: 2 },
  { q: "مين رسم لوحة الموناليزا؟", choices: ["فان جوخ", "بيكاسو", "ليوناردو دافنشي", "مايكل أنجلو"], correct: 2 },
  { q: "إيه هي أصغر دولة في العالم من حيث المساحة؟", choices: ["موناكو", "الفاتيكان", "سان مارينو", "ليختنشتاين"], correct: 1 },
  { q: "كام عدد أسنان الإنسان البالغ؟", choices: ["28", "30", "32", "34"], correct: 2 },
  { q: "إيه هو أكبر محيط في العالم؟", choices: ["الأطلسي", "الهندي", "الهادي", "المتجمد الشمالي"], correct: 2 },
  { q: "مين مؤسس شركة مايكروسوفت؟", choices: ["ستيف جوبز", "بيل جيتس", "مارك زوكربيرج", "إيلون ماسك"], correct: 1 },
  { q: "إيه هي عملة اليابان؟", choices: ["الوون", "اليوان", "الين", "الروبية"], correct: 2 },
  { q: "كام دقيقة في اليوم الواحد؟", choices: ["1240", "1340", "1440", "1540"], correct: 2 },
  { q: "إيه هو أعلى جبل في العالم؟", choices: ["كليمنجارو", "إفرست", "الألب", "أنديز"], correct: 1 },
  { q: "مين قائد الثورة العرابية في مصر؟", choices: ["سعد زغلول", "أحمد عرابي", "عمر مكرم", "مصطفى كامل"], correct: 1 },
  { q: "إيه هي اللغة الرسمية في البرازيل؟", choices: ["الإسبانية", "الإنجليزية", "البرتغالية", "الفرنسية"], correct: 2 },
  { q: "كام عدد ألوان قوس قزح؟", choices: ["5", "6", "7", "8"], correct: 2 },
  { q: "إيه هو أكبر كوكب في المجموعة الشمسية؟", choices: ["زحل", "المشتري", "أورانوس", "نبتون"], correct: 1 },
  { q: "مين مخترع الهاتف؟", choices: ["إديسون", "جراهام بيل", "تسلا", "نيوتن"], correct: 1 },
  { q: "إيه هي أطول سلسلة جبال في العالم؟", choices: ["الأنديز", "الألب", "الهيمالايا", "الروكي"], correct: 0 },
  { q: "كام قارة تقع فيها مصر؟", choices: ["قارة واحدة", "قارتين", "ثلاث قارات", "مفيش"], correct: 1 },
  { q: "إيه هو الغاز اللي بيتنفسه الإنسان بشكل أساسي؟", choices: ["ثاني أكسيد الكربون", "النيتروجين", "الأكسجين", "الهيدروجين"], correct: 2 },
  { q: "مين كاتب رواية 'الأخوة كارامازوف'؟", choices: ["تولستوي", "ديستوفسكي", "تشيخوف", "جوجول"], correct: 1 },
  { q: "إيه هي أكبر صحراء حارة في العالم؟", choices: ["صحراء أستراليا", "الصحراء الكبرى", "صحراء كالاهاري", "صحراء جوبي"], correct: 1 },
  { q: "كام عدد أرجل العنكبوت؟", choices: ["6", "8", "10", "12"], correct: 1 },
  { q: "إيه هي عاصمة أستراليا؟", choices: ["سيدني", "ملبورن", "كانبيرا", "بريزبن"], correct: 2 },
  { q: "مين اكتشف الجاذبية؟", choices: ["أينشتاين", "نيوتن", "جاليليو", "كوبرنيكوس"], correct: 1 },
  { q: "إيه هو أسرع طائر في العالم؟", choices: ["النسر", "الصقر الشاهين", "النعامة", "البومة"], correct: 1 },
  { q: "كام عدد حروف اللغة العربية؟", choices: ["26", "28", "30", "32"], correct: 1 },
  { q: "إيه هي أكبر جزيرة في العالم؟", choices: ["مدغشقر", "جرينلاند", "بورنيو", "سومطرة"], correct: 1 },
  { q: "مين أول رئيس لجمهورية مصر العربية؟", choices: ["جمال عبدالناصر", "محمد نجيب", "أنور السادات", "حسني مبارك"], correct: 1 },
  { q: "إيه هي عاصمة كندا؟", choices: ["تورونتو", "فانكوفر", "أوتاوا", "مونتريال"], correct: 2 },
  { q: "كام عدد اللاعبين في فريق كرة السلة داخل الملعب؟", choices: ["4", "5", "6", "7"], correct: 1 },
  { q: "إيه هو أصغر كوكب في المجموعة الشمسية؟", choices: ["المريخ", "الزهرة", "عطارد", "بلوتو"], correct: 2 },
];
curated.forEach((c) => addQuestion(c.q, c.choices, c.correct));

// ---------- 2) Capitals ----------
const countryCapitals = {
  "مصر": "القاهرة", "السعودية": "الرياض", "الإمارات": "أبوظبي", "الكويت": "الكويت",
  "قطر": "الدوحة", "البحرين": "المنامة", "عمان": "مسقط", "الأردن": "عمّان",
  "لبنان": "بيروت", "سوريا": "دمشق", "العراق": "بغداد", "اليمن": "صنعاء",
  "فلسطين": "القدس", "ليبيا": "طرابلس", "تونس": "تونس", "الجزائر": "الجزائر",
  "المغرب": "الرباط", "السودان": "الخرطوم", "الصومال": "مقديشو", "موريتانيا": "نواكشوط",
  "جيبوتي": "جيبوتي", "جزر القمر": "موروني",
  "تركيا": "أنقرة", "إيران": "طهران", "باكستان": "إسلام أباد", "أفغانستان": "كابول",
  "الهند": "نيودلهي", "الصين": "بكين", "اليابان": "طوكيو", "كوريا الجنوبية": "سيول",
  "كوريا الشمالية": "بيونج يانج", "إندونيسيا": "جاكرتا", "ماليزيا": "كوالالمبور",
  "تايلاند": "بانكوك", "فيتنام": "هانوي", "الفلبين": "مانيلا", "سنغافورة": "سنغافورة",
  "بنجلاديش": "دكا", "سريلانكا": "كولومبو", "نيبال": "كاتماندو",
  "روسيا": "موسكو", "ألمانيا": "برلين", "فرنسا": "باريس", "إيطاليا": "روما",
  "إسبانيا": "مدريد", "البرتغال": "لشبونة", "بريطانيا": "لندن", "هولندا": "أمستردام",
  "بلجيكا": "بروكسل", "سويسرا": "برن", "النمسا": "فيينا", "اليونان": "أثينا",
  "السويد": "ستوكهولم", "النرويج": "أوسلو", "الدنمارك": "كوبنهاجن", "فنلندا": "هلسنكي",
  "بولندا": "وارسو", "أوكرانيا": "كييف", "رومانيا": "بوخارست", "المجر": "بودابست",
  "التشيك": "براغ", "أيرلندا": "دبلن", "آيسلندا": "ريكيافيك", "صربيا": "بلجراد",
  "كرواتيا": "زغرب", "بلغاريا": "صوفيا",
  "أمريكا": "واشنطن", "كندا": "أوتاوا", "المكسيك": "مكسيكو سيتي", "البرازيل": "برازيليا",
  "الأرجنتين": "بوينس آيرس", "تشيلي": "سانتياجو", "كولومبيا": "بوجوتا", "بيرو": "ليما",
  "فنزويلا": "كاراكاس", "كوبا": "هافانا",
  "جنوب أفريقيا": "بريتوريا", "نيجيريا": "أبوجا", "كينيا": "نيروبي", "إثيوبيا": "أديس أبابا",
  "غانا": "أكرا", "أوغندا": "كمبالا", "تنزانيا": "دودوما", "زيمبابوي": "هراري",
  "السنغال": "داكار", "أنجولا": "لواندا",
  "أستراليا": "كانبيرا", "نيوزيلندا": "ويلينجتون",
};
const capitalNames = Object.values(countryCapitals);
const countryNames = Object.keys(countryCapitals);

countryNames.forEach((country) => {
  const correctCapital = countryCapitals[country];
  const wrongPool = capitalNames.filter((c) => c !== correctCapital);
  // pick 3 distinct wrong capitals
  const wrongs = [];
  const usedIdx = new Set();
  while (wrongs.length < 3 && wrongs.length < wrongPool.length) {
    const idx = Math.floor(Math.random() * wrongPool.length);
    if (usedIdx.has(idx)) continue;
    usedIdx.add(idx);
    wrongs.push(wrongPool[idx]);
  }
  const { choices, correct } = shuffleWithCorrect(correctCapital, wrongs);
  addQuestion(`إيه هي عاصمة ${country}؟`, choices, correct);
});

// ---------- 3) Multiplication table (1-12 x 1-12) ----------
for (let a = 1; a <= 12; a++) {
  for (let b = 1; b <= 12; b++) {
    const correct = a * b;
    const wrongs = new Set();
    while (wrongs.size < 3) {
      const delta = [-2, -1, 1, 2, 3, -3][Math.floor(Math.random() * 6)];
      const candidate = correct + delta;
      if (candidate > 0 && candidate !== correct) wrongs.add(candidate);
    }
    const { choices, correct: correctIdx } = shuffleWithCorrect(correct, [...wrongs]);
    addQuestion(`كام حاصل ضرب ${a} × ${b}؟`, choices, correctIdx);
  }
}

// ---------- 4) Division (exact results) ----------
for (let b = 2; b <= 12; b++) {
  for (let q = 1; q <= 12; q++) {
    const a = b * q;
    const wrongs = new Set();
    while (wrongs.size < 3) {
      const delta = [-2, -1, 1, 2, 3, -3][Math.floor(Math.random() * 6)];
      const candidate = q + delta;
      if (candidate > 0 && candidate !== q) wrongs.add(candidate);
    }
    const { choices, correct: correctIdx } = shuffleWithCorrect(q, [...wrongs]);
    addQuestion(`كام ناتج قسمة ${a} ÷ ${b}؟`, choices, correctIdx);
  }
}

// ---------- 5) Squares ----------
for (let n = 1; n <= 30; n++) {
  const correct = n * n;
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const delta = [-5, -3, -2, -1, 1, 2, 3, 5][Math.floor(Math.random() * 8)];
    const candidate = correct + delta;
    if (candidate > 0 && candidate !== correct) wrongs.add(candidate);
  }
  const { choices, correct: correctIdx } = shuffleWithCorrect(correct, [...wrongs]);
  addQuestion(`كام ناتج ${n} تربيع (${n}×${n})؟`, choices, correctIdx);
}

// ---------- 6) Random addition / subtraction to fill up to 1000 ----------
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let guard = 0;
while (bank.length < 1000 && guard < 200000) {
  guard++;
  const useAdd = Math.random() < 0.5;
  if (useAdd) {
    const a = randInt(1, 300);
    const b = randInt(1, 300);
    const correct = a + b;
    const wrongs = new Set();
    while (wrongs.size < 3) {
      const delta = randInt(-6, 6);
      const candidate = correct + delta;
      if (candidate > 0 && candidate !== correct) wrongs.add(candidate);
    }
    const { choices, correct: correctIdx } = shuffleWithCorrect(correct, [...wrongs]);
    addQuestion(`كام ناتج ${a} + ${b}؟`, choices, correctIdx);
  } else {
    const a = randInt(10, 500);
    const b = randInt(1, a - 1 >= 1 ? a - 1 : 1);
    const correct = a - b;
    const wrongs = new Set();
    while (wrongs.size < 3) {
      const delta = randInt(-6, 6);
      const candidate = correct + delta;
      if (candidate >= 0 && candidate !== correct) wrongs.add(candidate);
    }
    const { choices, correct: correctIdx } = shuffleWithCorrect(correct, [...wrongs]);
    addQuestion(`كام ناتج ${a} - ${b}؟`, choices, correctIdx);
  }
}

if (bank.length < 1000) {
  console.error(`تحذير: تم توليد ${bank.length} سؤال بس من أصل 1000 (احتمال تكرار كبير في المدى المحدد).`);
} else {
  bank.length = 1000; // trim to exactly 1000 if we overshot
}

const header = `// questions.js
// تم توليد هذا الملف تلقائيًا بواسطة generate-questions.js
// إجمالي الأسئلة: ${bank.length}
module.exports = `;

fs.writeFileSync("questions.js", header + JSON.stringify(bank, null, 2) + ";\n");
console.log(`تم إنشاء questions.js بعدد ${bank.length} سؤال.`);
