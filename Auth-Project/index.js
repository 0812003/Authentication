import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import flash from "connect-flash";
import User from "./models/User.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Flash messages available to all views
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      const user = await User.findOne({ email: username });
      if (!user) return cb(null, false, { message: "User not found" });
      const valid = await bcrypt.compare(password, user.password);
      if (valid) return cb(null, user);
      else return cb(null, false, { message: "Incorrect password" });
    } catch (err) {
      return cb(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
          });
        }
        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findById(id);
    cb(null, user);
  } catch (err) {
    cb(err);
  }
});

// Routes

app.get("/", (req, res) => res.render("home"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", failureFlash: true }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) res.render("dashboard", { user: req.user });
  else res.redirect("/login");
});

app.get("/add-note", (req, res) => {
  if (req.isAuthenticated()) res.render("add-note");
  else res.redirect("/login");
});

app.post("/add-note", async (req, res) => {
  const { title, content } = req.body;
  try {
    const user = await User.findById(req.user._id);
    user.notes.push({ title, content });
    await user.save();
    req.flash("success", "Note added successfully.");
    res.redirect("/my-notes");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to add note.");
    res.redirect("/add-note");
  }
});

app.get("/my-notes", async (req, res) => {
  if (req.isAuthenticated()) {
    const user = await User.findById(req.user._id);
    res.render("my-notes", { notes: user.notes });
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    res.redirect("/");
  });
});

app.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.username });
    if (existingUser) {
      req.flash("error", "Email already registered.");
      return res.redirect("/register");
    }

    const hashed = await bcrypt.hash(req.body.password, saltRounds);
    const user = new User({ email: req.body.username, password: hashed });
    await user.save();
    req.login(user, (err) => {
      if (err) {
        req.flash("error", "Registration successful, but auto-login failed.");
        return res.redirect("/login");
      }
      res.redirect("/dashboard");
    });
  } catch (err) {
    console.log(err);
    req.flash("error", "Registration failed.");
    res.redirect("/register");
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/delete-note", async (req, res) => {
  const noteId = req.body.noteId;
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { notes: { _id: noteId } },
    });
    req.flash("success", "Note deleted successfully.");
    res.redirect("/my-notes");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete note.");
    res.redirect("/my-notes");
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
