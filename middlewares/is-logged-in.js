"use strict";

/**
 * Middleware to check if the user is logged in
 * @param {import("express").Request} req - request object
 * @param {import("express").Response} res - response object
 * @param {import("express").NextFunction} next - next middleware function
 */
function isLoggedIn(req, res, next) {
  if (req.session.user) {
    return next();
  }

  res.redirect("/login");
}

exports.isLoggedIn = isLoggedIn;
