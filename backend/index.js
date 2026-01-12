const express = require("express");
const app = express();
const pool = require("./db");

app.use(express.json());

/* -------------------- HEALTH CHECK -------------------- */
app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB connection failed" });
  }
});

/* -------------------- CREATE TASK -------------------- */
app.post("/tasks", async (req, res) => {
  const { user_id, title, task_date, planned_minutes } = req.body;

  if (!user_id || !title || !task_date || planned_minutes == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, task_date, planned_minutes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, title, task_date, planned_minutes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

/* -------------------- FETCH TASKS BY DATE -------------------- */
app.get("/tasks", async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date query param required" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM tasks
       WHERE task_date = $1
       ORDER BY created_at ASC`,
      [date]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
