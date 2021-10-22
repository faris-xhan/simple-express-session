import express from "express";
import session from "express-session";
import morgan from "morgan";
import path from "path";
import { insertSession } from "./db.mjs";
import { deleteSession } from "./db.mjs";
import { getUser } from "./db.mjs";
import { insertUser } from "./db.mjs";
import { getLoggedinUser } from "./db.mjs";

const __dirname = path.resolve();
const app = express();

app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(
   session({
      secret: "mylittlesecret",
      resave: true,
      saveUninitialized: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
   })
);

const publicRoute = (req, res, next) => {
   const session = getLoggedinUser(req.sessionID);
   if (session) {
      return res.redirect("/dashboard");
   }
   next();
};

const privateRoute = (req, res, next) => {
   const session = getLoggedinUser(req.sessionID);
   if (session) {
      return next();
   }
   res.redirect("/login");
};

app.get("/login", publicRoute, (req, res) => {
   res.send(`
   <html>
   <head>
      <title> Log in </title>
      <link 
   </head>
   <body>
   <h1> Log in </h1>
   <form action="/login" method="POST">
      <input type="text" name="uname" placeholder="username" />
      <input type="password" name="passwd" placeholder="password" />
      <button type="submit"> Log in </button>
      <a href="/register"> Create a new account </a>
   </form>
   </body>
   </html>
   `);
});

app.get("/register", publicRoute, (req, res) => {
   res.send(`
   <h1> Create a new account </h1>
   <form action="/register" method="POST">
      <input type="text" name="fname" placeholder="full name" />
      <input type="text" name="uname" placeholder="username" />
      <input type="password" name="passwd" placeholder="password" />
      <button type="submit"> Log in </button>
      <a href="/login"> Login </a>
   </form>
   `);
});

app.post("/register", publicRoute, (req, res) => {
   const { fname, uname, passwd } = req.body;
   if (!fname || !uname || !passwd) {
      return res.status(400).send("Please fill the form");
   }

   if (insertUser(fname, uname, passwd)) {
      return res.send(
         "User created succesfully <a href='/login'> Log in here </a>"
      );
   }
   return res.status(404).send("Username already exists try another one");
});

app.post("/login", publicRoute, (req, res) => {
   const { uname, passwd } = req.body;

   if (!uname || !passwd) {
      return res.status(400).send("Please fill the form");
   }

   const user = getUser(uname, passwd);
   if (user) {
      insertSession(req.sessionID, user);
      return res.redirect("/dashboard");
   }
   return res.status(404).send("Username or password is incorrecet");
});

app.get("/dashboard", privateRoute, (req, res) => {
   const user = getLoggedinUser(req.sessionID);
   res.send(`
   <!DOCTYPE html>
      <html lang="en">
         <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Dashboard</title>
         </head>
         <body>
            <p>You're logged in as <b>${user.fname}</b></p>
            <form action="/dashboard" method="post">
               <button type="submit">Log out</button>
            </form>
         </body>
      </html>
`);
});

app.post("/dashboard", privateRoute, (req, res) => {
   if (deleteSession(req.sessionID)) {
      return res.redirect("/login");
   }
   return res.send("There was an error");
});

app.listen(3000, () => console.log("App is live on 3000"));
