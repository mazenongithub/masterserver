import mysql from 'mysql2/promise'
import dotenv from 'dotenv';
import fs from 'fs'

const envFile =
    process.env.NODE_ENV === "production"
        ? ".env.production"
        : ".env.development"

if (fs.existsSync(envFile)) {

    dotenv.config({ path: envFile })

} else {
    dotenv.config()

}


const pool = mysql.createPool({
    host:process.env.DB_HOST || 'localhost',
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:process.env.DB_NAME,
    waitForConnections:true,
    connectionLimit:10,
    queueLimit:0

});

export async function testConnection () {

    try {

        const [rows] = await pool.query(`SELECT 1 + 1 AS result`)
        console.log(`Connect to MYSQL ${process.env.NODE_ENV || 'development'} database`)

    } catch(err) {
        console.error(`MySQL Connection Error ${err.message}`)
    }
}

export default pool;