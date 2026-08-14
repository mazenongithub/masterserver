import express from 'express';
import expressWs from "express-ws";
import dotenv from 'dotenv';
import fs from 'fs'
import db, { testConnection } from './config/db.js';
import mongoose from 'mongoose'
import { connectDB } from './config/mongodb.js';
import appbaseddriver from './routes/appbaseddriver.js';
import gfk from './routes/gfk.js'
import civilengineer from './routes/civilengineer.js'
import geotech from './routes/geotech.js'
import cors from 'cors';
import sessionMiddleware from "./middleware/session.js";
import path from "path";
import { fileURLToPath } from "url";
import https from 'https'
import http from 'http'
import Geotech from './classes/geotech.js';
import Stripe from "stripe";
import Notifications from './classes/notifications.js';
import Room from './classes/room.js';

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
  'http://localhost:3001',
  'http://localhost:3003',
  'https://civilengineer.io',
  'http://civilengineer.io',
  'http://appbaseddriver.civilengineer.io',
  'https://appbaseddriver.civilengineer.io',
  'http://gfk.civilengineer.io',
  'https://gfk.civilengineer.io',
  'https://geotech.civilengineer.io',
  'http://geotech.civilengineer.io'
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



app.use(sessionMiddleware);
app.set("trust proxy", 1); // trust first proxy



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post(
    "/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {

        console.log("stripe signature", req.headers["stripe-signature"]);

        const geotech = new Geotech();

        const sig = req.headers["stripe-signature"];

        let event;

        try {

            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );

            console.log("142", event.type)

            switch (event.type) {

                case "payment_intent.succeeded": {


                    const paymentIntent = event.data.object;

                    const projectid = paymentIntent.metadata.projectid;
                    const invoiceid = paymentIntent.metadata.invoiceid;

                    const updatedInvoice =
                        await geotech.HandlePaymentSucceeded(
                            paymentIntent
                        );

                

                    if (projectid) {

                        Room.broadcastProjectUpdate(
                            `geotech:${projectid}`,
                            {
                                type: "invoicepayment-submitted",
                                message: "invoicepayment-submitted",
                                updatedInvoice: updatedInvoice
                            }
                        );

                    }

                    break;
                }

                case "payment_intent.payment_failed": {

                    const paymentIntent = event.data.object;

                    await geotech.HandlePaymentFailed(
                        paymentIntent
                    );

                    break;
                }

                default:
                    console.log("Ignored event:", event.type);
            }

            res.json({ received: true });

        } catch (err) {

            console.log(err);

            return res
                .status(400)
                .send(`Webhook Error: ${err.message}`);
        }
    }
);


app.use(express.json({ limit: '50mb' }))

// Create the actual server
let server;
if (!isProduction) {
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

expressWs(app, server);



// ...your routes go here...
// Create the actual server

;

// Attach express-ws to THAT server








app.get("/test-ws-http", (req, res) => {
  console.log("HTTP TEST REACHED");
  res.send("HTTP TEST WORKS");
});



app.get("/", (req, res) => {
  res.send(`Server running in ${process.env.NODE_ENV} mode`)
})

appbaseddriver(app);
gfk(app);
civilengineer(app);
geotech(app)


// Create the actual HTTPS server


if (!isProduction) {
  // Local HTTPS server



  server.listen(port, () => {
    console.log(
      `DEV HTTPS server running on ${port}`
    );
  });

  const internalPort = process.env.INTERNAL_PORT;

  http.createServer(app).listen(internalPort, () => {
    console.log(
      `Internal HTTP for FOP images on port ${internalPort}`
    );
  });

} else {
  // Production HTTP server


  server.listen(port, () => {
    console.log(
      `Production HTTP server running on port ${port}`
    );
  });
}








