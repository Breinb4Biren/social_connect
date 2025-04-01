import pg from 'pg';
import Redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
const { createClient }  = Redis;
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});



console.log(process.env.REDIS_URL,process.env.REDIS_PASS);

const client = new createClient({
    url: process.env.REDIS_URL,
    port: 4004,
    
  
});

export { pool, client };
