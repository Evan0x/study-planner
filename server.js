import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

/* ------------------ Load .env (Force Path) ------------------ */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

console.log("Google ID loaded:", !!process.env.GOOGLE_CLIENT_ID);
console.log("Google Secret loaded:", !!process.env.GOOGLE_CLIENT_SECRET);

/* ------------------ App Setup ------------------ */

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);

/* ------------------ Session ------------------ */

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ------------------ Database ------------------ */

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studyPlannerDB";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

/* ------------------ User Model ------------------ */

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, sparse: true },
  passwordHash: String,
  googleId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

/* ------------------ Passport Serialize ------------------ */

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

/* ------------------ Google OAuth Setup ------------------ */

const googleEnabled = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (googleEnabled) {
  passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:3000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.create({
              googleId: profile.id,
            });
          }

          done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );

  console.log("Google OAuth enabled");
} else {
  console.warn("⚠️ Google OAuth NOT configured");
}

/* ------------------ Middleware ------------------ */

function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Not authenticated" });
}

/* ------------------ Routes ------------------ */

/* Register */

app.post("/register", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const exist = await User.findOne({ username });

  if (exist) {
    return res.status(400).json({ message: "Username taken" });
  }

  const saltRounds = Number(process.env.BCRYPT_ROUNDS || 10);

  const passwordHash = await bcrypt.hash(password, saltRounds);

  await User.create({
    username,
    passwordHash,
  });

  res.json({ message: "Account created" });
});

/* Login */

app.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const user = await User.findOne({ username });

  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: "Invalid login" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);

  if (!ok) {
    return res.status(401).json({ message: "Invalid login" });
  }

  req.login(user, (err) => {
    if (err) {
      return res.status(500).json({ message: "Login failed" });
    }

    res.json({ message: "Login success" });
  });
});

/* Logout */

app.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out" });
  });
});

/* Current User */

app.get("/me", requireAuth, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username || null,
    googleId: req.user.googleId || null,
  });
});

/* ------------------ Google Routes ------------------ */

if (googleEnabled) {
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/loginPage.html",
    }),
    (req, res) => {
      res.redirect("/home.html");
    }
  );
} else {
  app.get("/auth/google", (req, res) => {
    res.status(503).json({
      message: "Google OAuth not configured",
    });
  });
}

/* ------------------ Static Frontend ------------------ */

app.use(express.static(__dirname));

/* ------------------ Start Server ------------------ */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
