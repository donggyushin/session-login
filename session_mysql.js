var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mysql = require("mysql");
var conn = mysql.createConnection({
  host: "localhost",
  user: "donggyu2",
  password: "nlcfjb",
  database: "mysql_tut"
});
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
var sessionStore = new MySQLStore({
  host: "localhost",
  port: 3306,
  user: "donggyu2",
  password: "nlcfjb",
  database: "mysql_tut"
});
conn.connect();

//middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: "session_cookie_name",
    secret: "212jh12#!@adlk",
    resave: false,
    saveUninitialized: true,
    store: sessionStore
  })
);

//settings
app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  if (req.session.displayName) {
    res.render("private");
  } else {
    res.render("public");
  }
});

app.get("/logout", (req, res) => {
  delete req.session.displayName;
  res.redirect("/");
});

app.get("/auth/login", (req, res) => {
  res.render("login");
});

app.post("/auth/login", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  var sql = "SELECT password FROM user WHERE username = ?";
  var post = [username];
  conn.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
      res.render("public");
    } else {
      if (results.length === 0) {
        res.render("public");
      }
      if (results[0].password === password) {
        req.session.displayName = username;
        res.render("private");
      } else {
        res.render("public");
      }
    }
  });
});

app.get("/register", (req, res) => {
  if (req.session.displayName) {
    //로그인 되어져 있다면 들어오지 못함.
    res.redirect("/");
  }
  res.render("register");
});

app.post("/auth/register", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var check = checkUsername(username);

  if (check === 0) {
    makeNewUser(username, password, res, req);
  }
});

const checkUsername = username => {
  var sql = "SELECT * FROM user WHERE username = ?";
  var post = [username];
  var check = conn.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
    }
  });
  return check._results.length;
};

const makeNewUser = (username, password, res, req) => {
  var sql = "INSERT INTO user (username, password) VALUES (?, ?)";
  var post = [username, password];
  conn.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
      res.send("fail to register, database error");
    } else {
      req.session.displayName = username;
      res.redirect("/");
    }
  });
};

app.listen(8081, () => {
  console.log("Server listening at 8081 port");
});
