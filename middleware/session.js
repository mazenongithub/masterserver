import session from "express-session";
import MongoStore from "connect-mongo";

const mongoURI =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_DB_URI
    : process.env.DEV_DB_URI;


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
    httpOnly: true,       // prevents client-side JS access
    secure: process.env.NODE_ENV === "production", // true if using HTTPS
    sameSite: "lax",      // helps prevent CSRF
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
});

export default sessionMiddleware;
