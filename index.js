"use strict";

const express = require("express");
const app = express();
const port = 3000;
const compression = require("compression");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pg = require("pg");
const flash = require("connect-flash");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const logger = require("./middlewares/logger");
const path = require("path");

require("dotenv").config();

// Compression
app.use(compression());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1d" }));

// Cookie parser
app.use(cookieParser());

// Session
const pgPool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
  retryStrategy: function (times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

const sessionOptions = {
  store: new pgSession({
    pool: pgPool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
  },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionOptions.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionOptions));

// Flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.errors = req.flash("errors");
  next();
});

if (app.get("env") === "production") {
  // Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          scriptSrc: ["'self'", "'unsafe-inline'"],
          scriptSrcAttr: ["'self'", "'unsafe-inline'"],
        },
      },
    })
  );

  // Rate limiter
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  app.use(limiter);
}

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/", require("./routes/auth"));
app.use("/", require("./routes/tasks"));
app.use("/admin", require("./routes/admin"));
app.use("/admin/tasks", require("./routes/admin/tasks"));
app.use("/admin/users", require("./routes/admin/users"));

// 404 handler
app.use((req, res) => {
  res.status(404).send("Sorry can't find that!");
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );

  res.status(500).send("Something broke!");
});

// Start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
