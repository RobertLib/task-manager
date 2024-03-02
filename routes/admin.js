"use strict";

const { Router } = require("express");
const router = Router();

// Redirect to admin tasks
router.get("/", (req, res) => {
  res.redirect("/admin/tasks");
});

module.exports = router;
