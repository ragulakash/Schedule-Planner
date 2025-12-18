import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./schedule.db");

// TASKS TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    date TEXT,
    time TEXT,
    completed INTEGER
  )
`);

// NOTES TABLE
db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY,
    content TEXT
  )
`);

// ---------- TASK ROUTES ----------

app.get("/schedules", (req, res) => {
  db.all("SELECT * FROM tasks ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post("/schedules", (req, res) => {
  const { title, date, time } = req.body;
  db.run(
    "INSERT INTO tasks (title, date, time, completed) VALUES (?, ?, ?, 0)",
    [title, date, time],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

app.put("/schedules/:id", (req, res) => {
  const { completed } = req.body;
  db.run(
    "UPDATE tasks SET completed=? WHERE id=?",
    [completed ? 1 : 0, req.params.id],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Updated" });
    }
  );
});

app.delete("/schedules/:id", (req, res) => {
  db.run("DELETE FROM tasks WHERE id=?", [req.params.id], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deleted" });
  });
});

// ---------- NOTES ROUTES ----------

app.get("/notes", (req, res) => {
  db.get("SELECT content FROM notes WHERE id=1", [], (err, row) => {
    if (err) return res.status(500).json(err);
    res.json({ content: row ? row.content : "" });
  });
});

app.post("/notes", (req, res) => {
  const { content } = req.body;
  db.run(
    `INSERT INTO notes (id, content)
     VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET content=excluded.content`,
    [content],
    err => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Notes saved" });
    }
  );
});

app.listen(5000, () => {
  console.log("Backend running at http://localhost:5000");
});
