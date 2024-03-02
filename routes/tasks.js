"use strict";

const { Router } = require("express");
const router = Router();
const { isLoggedIn } = require("../middlewares/is-logged-in");
const { tryCatch } = require("../utils/try-catch");
const pool = require("../db");

// View all tasks for a user
router.get(
  "/",
  isLoggedIn,
  tryCatch(async (req, res) => {
    const { user: currentUser } = req.session;

    const { rows: tasks } = await pool.query(
      "SELECT * FROM tasks WHERE userId = $1 ORDER BY id DESC",
      [currentUser.id]
    );

    res.render("tasks", {
      currentUser,
      tasks,
    });
  })
);

// Create a new task
router.post(
  "/",
  isLoggedIn,
  tryCatch(async (req, res) => {
    const { name } = req.body;
    const { user: currentUser } = req.session;

    const {
      rows: [task],
    } = await pool.query(
      "INSERT INTO tasks (name, userId) VALUES ($1, $2) RETURNING *",
      [name, currentUser.id]
    );

    res.json(task);
  })
);

// Update task
router.patch(
  "/:id",
  isLoggedIn,
  tryCatch(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const { user: currentUser } = req.session;

    const {
      rows: [task],
    } = await pool.query(
      "UPDATE tasks SET name = $1 WHERE id = $2 AND userId = $3 RETURNING *",
      [name, id, currentUser.id]
    );

    res.json(task);
  })
);

// Toggle task completion
router.patch(
  "/:id/toggle",
  isLoggedIn,
  tryCatch(async (req, res) => {
    const { id } = req.params;
    const { user: currentUser } = req.session;

    const {
      rows: [task],
    } = await pool.query(
      "UPDATE tasks SET completed = NOT completed WHERE id = $1 AND userId = $2 RETURNING *",
      [id, currentUser.id]
    );

    res.json(task);
  })
);

// Delete task
router.delete(
  "/:id",
  isLoggedIn,
  tryCatch(async (req, res) => {
    const { id } = req.params;
    const { user: currentUser } = req.session;

    const {
      rows: [task],
    } = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND userId = $2 RETURNING *",
      [id, currentUser.id]
    );

    res.json(task);
  })
);

module.exports = router;
