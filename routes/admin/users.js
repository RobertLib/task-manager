"use strict";

const { Router } = require("express");
const router = Router();
const { isLoggedIn } = require("../../middlewares/is-logged-in");
const { isAdmin } = require("../../middlewares/is-admin");
const { tryCatch } = require("../../utils/try-catch");
const pool = require("../../db");

// View admin users
router.get(
  "/",
  isLoggedIn,
  isAdmin,
  tryCatch(async (req, res) => {
    const { editId, email, limit = 10, page = 1 } = req.query;
    const { user: currentUser } = req.session;

    const { rows: users } = await pool.query(
      `SELECT * FROM users
       WHERE email ILIKE COALESCE($1, email)
       ORDER BY id DESC
       LIMIT $2
       OFFSET $3`,
      [email ? `%${email}%` : null, limit, (page - 1) * limit]
    );

    res.render("admin/users", {
      currentUser,
      editId: Number(editId),
      hasSidebar: true,
      page: Number(page),
      req,
      users,
    });
  })
);

// Update user
router.post(
  "/:id",
  isLoggedIn,
  isAdmin,
  tryCatch(async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    await pool.query("UPDATE users SET email = $1 WHERE id = $2", [email, id]);

    res.redirect(`/admin/users?${new URLSearchParams(req.query)}`);
  })
);

// Delete user
router.post(
  "/:id/delete",
  isLoggedIn,
  isAdmin,
  tryCatch(async (req, res) => {
    const { id } = req.params;

    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    res.redirect(`/admin/users?${new URLSearchParams(req.query)}`);
  })
);

module.exports = router;
