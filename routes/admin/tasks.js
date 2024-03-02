"use strict";

const { Router } = require("express");
const router = Router();
const { isLoggedIn } = require("../../middlewares/is-logged-in");
const { isAdmin } = require("../../middlewares/is-admin");
const { tryCatch } = require("../../utils/try-catch");
const pool = require("../../db");

// View admin tasks
router.get(
  "/",
  isLoggedIn,
  isAdmin,
  tryCatch(async (req, res) => {
    const { editId, limit = 10, name, page = 1 } = req.query;
    const { user: currentUser } = req.session;

    const { rows: tasks } = await pool.query(
      `SELECT * FROM tasks
       WHERE name ILIKE COALESCE($1, name)
       ORDER BY id DESC
       LIMIT $2
       OFFSET $3`,
      [name ? `%${name}%` : null, limit, (page - 1) * limit]
    );

    res.render("admin/tasks", {
      currentUser,
      editId: Number(editId),
      hasSidebar: true,
      page: Number(page),
      req,
      tasks,
    });
  })
);

// Update task
router.post(
  "/:id",
  isLoggedIn,
  isAdmin,
  tryCatch(async (req, res) => {
    const { id } = req.params;
    const { completed, name } = req.body;

    await pool.query(
      "UPDATE tasks SET name = $1, completed = $2 WHERE id = $3",
      [name, completed === "true", id]
    );

    res.redirect(`/admin/tasks?${new URLSearchParams(req.query)}`);
  })
);

// Delete task
router.post(
  "/:id/delete",
  isLoggedIn,
  isAdmin,
  tryCatch(async (req, res) => {
    const { id } = req.params;

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    res.redirect(`/admin/tasks?${new URLSearchParams(req.query)}`);
  })
);

module.exports = router;
