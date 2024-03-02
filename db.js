"use strict";

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  retryStrategy: function (times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

module.exports = pool;
