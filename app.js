const express = require("express");
require("express-async-errors");
require("dotenv").config(); 
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const passportInit = require("./passport/passportInit");
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");
const cookieParser = require("cookie-parser");
const csrf = require("host-csrf");
const productsRouter = require("./routes/products");
// extra security packages
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const app = express();

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));


const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: process.env.MONGO_URL,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(helmet()); // before session, set headers

app.use(session(sessionParms));

// after cookie_parser and any body parsers but before any of the routes.
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));
let csrf_development_mode = true;
if (app.get("env") === "production") {
  csrf_development_mode = false;
  app.set("trust proxy", 1);
}
const csrf_options = {
  protected_operations: ["PATCH", "PUT", "POST"],
  protected_content_types: ["application/json", "application/x-www-form-urlencoded"], // protect headers from
  development_mode: csrf_development_mode,
};
app.use(csrf(csrf_options));

passportInit();
app.use(passport.initialize());
app.use(passport.session());

// this code must come after the app.use that sets up sessions, because flash depends on sessions
app.use(require("connect-flash")());

app.use(require("./middleware/storeLocals"));

// more security
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  })
);

app.use(xss());


// routes
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));
app.use("/secretWord", auth, secretWordRouter);
app.use("/products", auth, productsRouter);

app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();