"use strict";

/**
 * Util that wraps the route handler in a try/catch block
 * @param {function (import("express").Request, import("express").Response, import("express").NextFunction)} handler - The route handler
 */
exports.tryCatch =
  (handler) =>
  /**
   * The route handler wrapped in a try/catch block
   * @param {import("express").Request} req - The request object
   * @param {import("express").Response} res - The response object
   * @param {import("express").NextFunction} next - The next middleware function
   */
  async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
