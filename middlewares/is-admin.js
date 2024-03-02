"use strict";

/**
 * Middleware to check if the user is an admin
 * @param {import("express").Request} req - request object
 * @param {import("express").Response} res - response object
 * @param {import("express").NextFunction} next - next middleware function
 */
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "ADMIN") {
    return next();
  }

  res.status(403).send("Not authorized");
}

exports.isAdmin = isAdmin;
