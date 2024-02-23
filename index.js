"use strict";

const express = require("express");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pg = require("pg");
const flash = require("connect-flash");
const compression = require("compression");
const path = require("path");

require("dotenv").config();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1d" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const pgPool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL,
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
  },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessionOptions.cookie.secure = true;
}

app.use(session(sessionOptions));

app.use(flash());

app.use((req, res, next) => {
  res.locals.errors = req.flash("errors");
  next();
});

app.use(compression());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", require("./routes/auth"));

app.use((req, res, next) => {
  if (!req.session.user) {
    if (req.method === "GET") {
      return res.redirect("/login");
    }

    return res.status(401).send("Unauthorized");
  }

  next();
});

app.use("/", require("./routes/tasks"));

app.use((req, res) => {
  res.status(404).send("Sorry can't find that!");
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).send("Something broke!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
