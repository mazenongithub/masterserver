import session from "express-session";
import MongoStore from "connect-mongo";

const mongoURI =
    process.env.NODE_ENV === "production"
        ? process.env.PROD_DB_URI
        : process.env.DEV_DB_URI;


const isProduction = process.env.NODE_ENV === "production";

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "super-secret-key", // 🔒 always store in .env
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: mongoURI, // same URI as your app’s MongoDB
        collectionName: "sessions",
        ttl: 60 * 60 * 24 * 7, // 1 week session lifespan
    }),
    cookie: {
        httpOnly: true,
        secure: true,       // MUST be true for sameSite:"none"
        sameSite: "none",   // required for cross-site cookies
        maxAge: 1000 * 60 * 60 * 24 * 7
    },
});

export default sessionMiddleware;
