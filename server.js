import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs'
import db, { testConnection } from './config/db.js';
import mongoose from 'mongoose'
import { connectDB } from './config/mongodb.js';
import appbaseddriver from './routes/appbaseddriver.js';
import gfk from './routes/gfk.js'
import cors from 'cors';
import sessionMiddleware from "./middleware/session.js";
import path from "path";
import { fileURLToPath } from "url";
import https from 'https'
import http from 'http'

// await testConnection()
(async () => {
  try {
    await testConnection();
    console.log("✅ Test connection successful");

    await connectDB();
    console.log("✅ Database connected successfully");

  } catch (err) {
    console.error("❌ Connection error:", err.message || err);
    process.exit(1); // 🔴 Exit with error code if connection fails
  }
})();






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




const allowedOrigins = [
  'http://localhost:3000',
  'https://civilengineer.io',
  'http://civilengineer.io',
  'http://appbaseddriver.civilengineer.io',
  'https://appbaseddriver.civilengineer.io',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


app.use('/uploads', express.static('uploads'));

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) app.set("trust proxy", 1);


const options = {
  key: fs.readFileSync("./certs/192.168.1.6+1-key.pem"),
  cert: fs.readFileSync("./certs/192.168.1.6+1-cert.pem"),
};


app.use(express.json({ limit: '50mb' }))
app.use(sessionMiddleware);
app.set("trust proxy", 1); // trust first proxy




// ...your routes go here...


app.get("/", (req, res) => {
  res.send(`Server running in ${process.env.NODE_ENV} mode`)
})

appbaseddriver(app);
gfk(app);




if (!isProduction) {
  // Local HTTPS only for dev

  https.createServer(options, app).listen(port, () => {
    console.log(`DEV HTTPS server running on https://192.168.1.6 on port ${port}`);
  });

} else {
  // Production = HTTP ONLY
  http.createServer(app).listen(port, () => {
    console.log(`Production HTTP server running on ${port}`);
  });
}



