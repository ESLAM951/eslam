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

// بنك الأسئلة الكامل (1000 سؤال) - اتولد بواسطة generate-questions.js
const QUESTIONS = require("./questions.js");

// عدد الأسئلة اللي بتتلعب في كل جولة/غرفة (تقدر تزودها لو حابب)
const QUESTIONS_PER_GAME = 10;

// بيرجع مصفوفة من N سؤال عشوائي من البنك الكامل من غير أي تكرار
function pickRandomQuestions(n) {
  const shuffled = [...QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

// In-memory rooms: { code: { questions, players: { socketId: {name, score, index, finished, finishTime} } } }
const rooms = {};

function genCode() {
  let code;
  do {
    code = String(Math.floor(1000 + Math.random() * 9000));
  } while (rooms[code]);
  return code;
}

function publicQuestions(roomQuestions) {
  // strip "correct" so clients can't peek before answering
  return roomQuestions.map(({ q, choices }) => ({ q, choices }));
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
    // اختيار مجموعة أسئلة عشوائية وفريدة لكل غرفة، وترتيبها بيتغير كل مرة
    const roomQuestions = pickRandomQuestions(QUESTIONS_PER_GAME);
    rooms[code] = { questions: roomQuestions, players: {} };
    rooms[code].players[socket.id] = {
      name: (name || "لاعب").slice(0, 16),
      score: 0,
      index: 0,
      finished: false,
      finishTime: null,
    };
    socket.join(code);
    socket.data.code = code;
    cb({ ok: true, code, questions: publicQuestions(roomQuestions) });
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
    // نفس أسئلة الغرفة اللي اتحددت وقت الإنشاء، عشان اللاعبين الاتنين يلعبوا نفس الأسئلة
    cb({ ok: true, code, questions: publicQuestions(room.questions) });
    io.to(code).emit("room-update", roomSummary(code));
  });

  socket.on("answer", ({ choiceIndex, qIndex }, cb) => {
    const code = socket.data.code;
    const room = rooms[code];
    if (!room || !room.players[socket.id]) return;
    const player = room.players[socket.id];
    const question = room.questions[qIndex];
    if (!question || qIndex !== player.index) return; // ignore out-of-order/duplicate
    const correct = question.correct === choiceIndex;
    if (correct) player.score += 1;
    player.index += 1;

    const isLast = player.index >= room.questions.length;
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
