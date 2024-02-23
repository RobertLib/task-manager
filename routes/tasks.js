"use strict";

const { Router } = require("express");
const router = Router();
const { tryCatch } = require("../utils/try-catch");
const pool = require("../db");

// View all tasks for a user
router.get(
  "/",
  tryCatch(async (req, res) => {
    const { user } = req.session;

    const { rows: tasks } = await pool.query(
      "SELECT * FROM tasks WHERE userId = $1 ORDER BY id DESC",
      [user.id]
    );

    res.render("tasks", {
      tasks,
      user,
    });
  })
);

// Create a new task
router.post(
  "/",
  tryCatch(async (req, res) => {
    const { name } = req.body;
    const { user } = req.session;

    const {
      rows: [task],
    } = await pool.query(
      "INSERT INTO tasks (name, userId) VALUES ($1, $2) RETURNING *",
      [name, user.id]
    );

    res.json(task);
  })
);

// Update a task
router.post(
  "/:id",
  tryCatch(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const { user } = req.session;

    const {
      rows: [task],
    } = await pool.query(
      "UPDATE tasks SET name = $1 WHERE id = $2 AND userId = $3 RETURNING *",
      [name, id, user.id]
    );

    res.json(task);
  })
);

// Toggle task completion
router.post(
  "/:id/toggle",
  tryCatch(async (req, res) => {
    const { id } = req.params;
    const { user } = req.session;

    const {
      rows: [task],
    } = await pool.query(
      "UPDATE tasks SET completed = NOT completed WHERE id = $1 AND userId = $2 RETURNING *",
      [id, user.id]
    );

    res.json(task);
  })
);

// Delete a task
router.post(
  "/:id/delete",
  tryCatch(async (req, res) => {
    const { id } = req.params;
    const { user } = req.session;

    const {
      rows: [task],
    } = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND userId = $2 RETURNING *",
      [id, user.id]
    );

    res.json(task);
  })
);

module.exports = router;
