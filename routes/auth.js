"use strict";

const { Router } = require("express");
const router = Router();
const bcrypt = require("bcrypt");
const { tryCatch } = require("../utils/try-catch");
const pool = require("../db");

// View login
router.get(
  "/login",
  tryCatch((req, res) => {
    res.render("auth/login");
  })
);

// Login user
router.post(
  "/login",
  tryCatch(async (req, res) => {
    const { email, password } = req.body;

    const {
      rows: [user],
    } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (!user) {
      req.flash("errors", "Invalid e-mail or password");
      return res.redirect("/login");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      req.flash("errors", "Invalid e-mail or password");
      return res.redirect("/login");
    }

    req.session.user = { id: user.id, email };
    res.redirect("/");
  })
);

// View registration
router.get(
  "/register",
  tryCatch((req, res) => {
    res.render("auth/register");
  })
);

// Register user
router.post(
  "/register",
  tryCatch(async (req, res) => {
    const { email, password, passwordConfirm } = req.body;

    if (!email || !password || !passwordConfirm) {
      req.flash("errors", "All fields are required");
      return res.redirect("/register");
    }

    if (password.length < 6) {
      req.flash("errors", "Password must be at least 6 characters long");
      return res.redirect("/register");
    }

    if (password !== passwordConfirm) {
      req.flash("errors", "Passwords do not match");
      return res.redirect("/register");
    }

    try {
      const hash = await bcrypt.hash(password, 10);

      const {
        rows: [user],
      } = await pool.query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
        [email, hash]
      );

      req.session.user = { id: user.id, email };
      res.redirect("/");
    } catch (error) {
      if (error.code === "23505") {
        req.flash("errors", "User with this e-mail already exists");
        res.redirect("/register");
      } else {
        throw error;
      }
    }
  })
);

// Logout the user
router.post(
  "/logout",
  tryCatch((req, res) => {
    req.session.destroy();
    res.redirect("/");
  })
);

module.exports = router;
