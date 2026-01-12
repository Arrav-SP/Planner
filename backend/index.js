const express = require("express");
const app = express();
const pool = require("./db");

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "ok", time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB connection failed" });
  }
});

app.listen(5000, () => {
  console.log("Backend running on port 5000");
});
