import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs'
import db, {testConnection} from './config/db.js';
import mongoose from 'mongoose'
import { connectDB } from './config/mongodb.js';

// await testConnection()
testConnection()
.then(succ=> {

})
.catch(err => {
    console.log(err)
})

connectDB()
.then(succ=> {

})
.catch(err => {
    console.log(err)
})





const envFile =
    process.env.NODE_ENV === "production"
        ? ".env.production"
        : ".env.development"

if (fs.existsSync(envFile)) {

    dotenv.config({ path: envFile })

} else {
    dotenv.config()

}

const dbUri = process.env.NODE_ENV === "production" 
    ? process.env.PROD_DB_URI 
    : process.env.DEV_DB_URI;


const app = express();

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send(`Server running in ${process.env.NODE_ENV} mode`)
})




app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port} in ${process.env.NODE_ENV}`)
})



