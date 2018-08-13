var express = require("express");
var app = express();

//middlewares

//settings
app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.send("main");
});

app.get("/auth/login", (req, res) => {
  res.render("login");
});

app.listen(8081, () => {
  console.log("Server listening at 8081 port");
});
