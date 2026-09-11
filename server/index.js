import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

import { INITIAL_STUDENTS, DEFAULT_SETTINGS } from "../data.js";

const STUDENTS_FILE = path.join(__dirname, "data", "students.json");
const SESSIONS_FILE = path.join(__dirname, "data", "sessions.json");
const FACULTY_FILE = path.join(__dirname, "data", "faculty.json");
const DATA_JS_PATH = path.join(__dirname, "..", "data.js");

// In-memory student roster initialized from data.js
let currentStudents = [...INITIAL_STUDENTS];
let currentSettings = { ...DEFAULT_SETTINGS };

// Synchronize with server/data/students.json on startup
writeJSON(STUDENTS_FILE, currentStudents);

// Live watcher on data.js to update server in real time whenever user saves data.js
try {
  let reloadTimeout = null;
  fs.watch(DATA_JS_PATH, (eventType) => {
    if (eventType === "change") {
      clearTimeout(reloadTimeout);
      reloadTimeout = setTimeout(async () => {
        try {
          const freshModule = await import(`../data.js?t=${Date.now()}`);
          if (freshModule.INITIAL_STUDENTS) {
            currentStudents = [...freshModule.INITIAL_STUDENTS];
            writeJSON(STUDENTS_FILE, currentStudents);
            console.log(`[API Server] Live synced ${currentStudents.length} students from data.js on save!`);
          }
          if (freshModule.DEFAULT_SETTINGS) {
            currentSettings = { ...freshModule.DEFAULT_SETTINGS };
          }
        } catch (err) {
          console.error("[API Server] Error reloading data.js:", err.message);
        }
      }, 150);
    }
  });
} catch (e) {
  console.warn("Could not attach watcher to data.js:", e.message);
}

// Helper utilities to read/write JSON
function readJSON(filePath, fallback = []) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJSON(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Faculty Attendance Portal API",
    version: "2.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Settings endpoint
app.get("/api/settings", (req, res) => {
  res.json({ success: true, data: currentSettings });
});

// 2. Students roster endpoints
app.get("/api/students", (req, res) => {
  let students = currentStudents.length > 0 ? currentStudents : readJSON(STUDENTS_FILE, []);
  const { section, search } = req.query;

  if (section) {
    students = students.filter(s => s.section && s.section.toLowerCase() === section.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    students = students.filter(s =>
      s.roll.toLowerCase().includes(q) ||
      (s.name && s.name.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: students.length, data: students });
});

app.post("/api/students", (req, res) => {
  const { roll, name, section } = req.body;
  if (!roll || !name) {
    return res.status(400).json({ success: false, error: "Roll number and student name are required" });
  }

  const students = readJSON(STUDENTS_FILE, []);
  const existingIndex = students.findIndex(s => s.roll.toUpperCase() === roll.toUpperCase());

  const studentObj = {
    id: roll.toUpperCase(),
    roll: roll.toUpperCase(),
    name: name.toUpperCase().trim(),
    section: section || "CSE - Sec 1"
  };

  if (existingIndex >= 0) {
    students[existingIndex] = studentObj;
  } else {
    students.push(studentObj);
  }

  writeJSON(STUDENTS_FILE, students);
  res.json({ success: true, message: "Student saved successfully", data: studentObj });
});

// 3. Sessions (Attendance records)
app.get("/api/sessions", (req, res) => {
  const sessions = readJSON(SESSIONS_FILE, []);
  // Sort descending by timestamp
  sessions.sort((a, b) => new Date(b.timestamp || b.id) - new Date(a.timestamp || a.id));
  res.json({ success: true, count: sessions.length, data: sessions });
});

app.get("/api/sessions/:id", (req, res) => {
  const sessions = readJSON(SESSIONS_FILE, []);
  const session = sessions.find(s => String(s.id) === req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: "Session not found" });
  }
  res.json({ success: true, data: session });
});

app.post("/api/sessions", (req, res) => {
  const sessionData = req.body;
  if (!sessionData.date || !sessionData.attendance) {
    return res.status(400).json({ success: false, error: "Missing required attendance session payload" });
  }

  const sessions = readJSON(SESSIONS_FILE, []);
  const sessionId = sessionData.id || `session_${Date.now()}`;
  const newSession = {
    ...sessionData,
    id: sessionId,
    timestamp: sessionData.timestamp || new Date().toISOString()
  };

  const existingIndex = sessions.findIndex(s => s.id === sessionId);
  if (existingIndex >= 0) {
    sessions[existingIndex] = newSession;
  } else {
    sessions.unshift(newSession);
  }

  writeJSON(SESSIONS_FILE, sessions);
  res.json({ success: true, message: "Attendance session recorded", data: newSession });
});

app.delete("/api/sessions/:id", (req, res) => {
  const sessions = readJSON(SESSIONS_FILE, []);
  const filtered = sessions.filter(s => String(s.id) !== req.params.id);
  if (filtered.length === sessions.length) {
    return res.status(404).json({ success: false, error: "Session not found to delete" });
  }

  writeJSON(SESSIONS_FILE, filtered);
  res.json({ success: true, message: "Session deleted successfully" });
});

// 4. Faculty WhatsApp Contacts endpoints (Custom, permanent storage)
app.get("/api/faculty", (req, res) => {
  const contacts = readJSON(FACULTY_FILE, []);
  res.json({ success: true, data: contacts });
});

app.post("/api/faculty", (req, res) => {
  const contacts = req.body;
  if (!Array.isArray(contacts)) {
    return res.status(400).json({ success: false, error: "Expected an array of contacts" });
  }

  writeJSON(FACULTY_FILE, contacts);
  res.json({ success: true, message: "Faculty contacts updated", data: contacts });
});

// 5. Aggregate Stats Overview
app.get("/api/stats/overview", (req, res) => {
  const sessions = readJSON(SESSIONS_FILE, []);
  const students = readJSON(STUDENTS_FILE, []);

  const totalSessions = sessions.length;
  let totalPercentages = 0;
  let totalAbsentees = 0;

  sessions.forEach(s => {
    totalPercentages += Number(s.percentage) || 0;
    totalAbsentees += Number(s.absentCount) || 0;
  });

  const avgPercentage = totalSessions > 0 ? (totalPercentages / totalSessions).toFixed(1) : "0.0";

  res.json({
    success: true,
    data: {
      totalStudents: students.length,
      totalSessions,
      avgPercentage,
      totalAbsenteesRecorded: totalAbsentees
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[API Server] Running at http://localhost:${PORT}`);
  console.log(`[API Server] Health: http://localhost:${PORT}/api/health`);
  console.log(`[API Server] Students: http://localhost:${PORT}/api/students`);
});
