const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const QUESTIONS = [
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
];

// In-memory rooms: { code: { players: { socketId: {name, score, index, finished, finishTime} } } }
const rooms = {};

function genCode() {
  let code;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (rooms[code]);
  return code;
}

function publicQuestions() {
  // strip "correct" so clients can't peek before answering
  return QUESTIONS.map(({ q, choices }) => ({ q, choices }));
}

function roomSummary(code) {
  const room = rooms[code];
  if (!room) return null;
  return {
    code,
    players: Object.entries(room.players).map(([id, p]) => ({
      id,
      name: p.name,
      score: p.score,
      index: p.index,
      finished: p.finished,
      finishTime: p.finishTime,
    })),
  };
}

io.on("connection", (socket) => {
  socket.on("create-room", ({ name }, cb) => {
    const code = genCode();
    rooms[code] = { players: {} };
    rooms[code].players[socket.id] = {
      name: (name || "لاعب").slice(0, 16),
      score: 0,
      index: 0,
      finished: false,
      finishTime: null,
    };
    socket.join(code);
    socket.data.code = code;
    cb({ ok: true, code, questions: publicQuestions() });
    io.to(code).emit("room-update", roomSummary(code));
  });

  socket.on("join-room", ({ name, code }, cb) => {
    const room = rooms[code];
    if (!room) {
      cb({ ok: false, error: "مفيش غرفة بالكود ده" });
      return;
    }
    if (Object.keys(room.players).length >= 2) {
      cb({ ok: false, error: "الغرفة دي كاملة بالفعل" });
      return;
    }
    room.players[socket.id] = {
      name: (name || "لاعب").slice(0, 16),
      score: 0,
      index: 0,
      finished: false,
      finishTime: null,
    };
    socket.join(code);
    socket.data.code = code;
    cb({ ok: true, code, questions: publicQuestions() });
    io.to(code).emit("room-update", roomSummary(code));
  });

  socket.on("answer", ({ choiceIndex, qIndex }, cb) => {
    const code = socket.data.code;
    const room = rooms[code];
    if (!room || !room.players[socket.id]) return;
    const player = room.players[socket.id];
    const question = QUESTIONS[qIndex];
    if (!question || qIndex !== player.index) return; // ignore out-of-order/duplicate
    const correct = question.correct === choiceIndex;
    if (correct) player.score += 1;
    player.index += 1;

    const isLast = player.index >= QUESTIONS.length;
    if (isLast) {
      player.finished = true;
      player.finishTime = socket.data.startTime
        ? Math.round((Date.now() - socket.data.startTime) / 100) / 10
        : null;
    }

    cb({ correct, correctIndex: question.correct, score: player.score, finished: player.finished, finishTime: player.finishTime });
    io.to(code).emit("room-update", roomSummary(code));
  });

  socket.on("start-timer", () => {
    socket.data.startTime = Date.now();
  });

  socket.on("disconnect", () => {
    const code = socket.data.code;
    if (code && rooms[code]) {
      delete rooms[code].players[socket.id];
      if (Object.keys(rooms[code].players).length === 0) {
        delete rooms[code];
      } else {
        io.to(code).emit("room-update", roomSummary(code));
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Trivia race server running on port ${PORT}`));
