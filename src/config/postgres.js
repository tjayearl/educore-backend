const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: (process.env.NODE_ENV === 'production' || (process.env.PG_HOST && process.env.PG_HOST.includes('render.com')))
    ? { rejectUnauthorized: false } 
    : false
});

module.exports = pool;