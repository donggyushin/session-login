var bkfd2Password = require("pbkdf2-password");
var express = require("express");
var app = express();
var hasher = bkfd2Password();
var bodyParser = require("body-parser");
var mysql = require("mysql");
var conn = mysql.createConnection({
  host: "localhost",
  user: "donggyu2",
  password: "nlcfjb",
  database: "mysql_tut"
});
conn.connect();
var opts = {
  password: "javascript"
};

hasher(opts, (err, pass, salt, hash) => {
  opts.salt = salt;
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/auth/register", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var sql = "SELECT * FROM user WHERE username = ?";
  var post = [username];
  conn.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
      res.send("fail to register");
    } else {
      console.log(results.length);
      if (results.length !== 0) {
        res.send("already exist");
      } else {
        return hasher({ password: password }, (err, pass, salt, hash) => {
          if (err) {
            console.log(err);
            res.send("fail to register");
          } else {
            var sql =
              "INSERT INTO user (username, password, salt) VALUES (?,?,?)";
            var post = [username, hash, salt];
            conn.query(sql, post, (err, results, fields) => {
              if (err) {
                console.log(err);
                res.send("fail to register");
              } else {
                res.send("success register");
              }
            });
          }
        });
      }
    }
  });
});

app.post("/auth/login", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  var sql = "SELECT * FROM user WHERE username = ? ";
  var post = [username];
  conn.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
      res.send("fail to login");
    } else {
      if (results.length === 0) {
        res.send("no id");
      } else {
        var salt = results[0].salt;
        return hasher(
          { password: password, salt: salt },
          (err, pass, salt, hash) => {
            if (hash === results[0].password) {
              req.session.displayName = results[0].username;
              req.session.save(() => {
                res.redirect("/");
              });
            } else {
              res.send("wrong password");
            }
          }
        );
      }
    }
  });
});

app.listen(8081, () => {
  console.log("listening at 8081");
});
