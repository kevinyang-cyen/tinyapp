// TinyApp - A full stack web app built with Node and Express 
// that allows users to shorten long URLs (à la bit.ly).
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');

// Server Setup -----------------------------------
const PORT = 8080; // default port 8080
const app = express();
app.set("view engine", "ejs");

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Databases
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "abcdef"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "abcdef"}
};

const users = { 
  "abcdef": {
    id: "abcdef", 
    email: "user@example.com", 
    password: "temppassword"
  },
 "bcdefg": {
    id: "bcdefg", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// Page Renders
app.get("/", (req,res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.cookies["user_id"]), user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
    return;
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send('Short URL not found!');
    return;
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, urls: urlsForUser(req.cookies["user_id"]), user: users[req.cookies["user_id"]], urlUserID: urlDatabase[req.params.shortURL].userID };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// Posts
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please fill out an email and a password!');
    return;
  }
  if (emailLookUp(req.body.email)) {
    res.status(400).send('Email already exists!');
    return;
  }
  else {
    let userID = generateRandomString();
    users[userID] = {id: userID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10)};
    console.log(users[userID].password);
    res.cookie('user_id', userID);
    res.redirect("urls");
  }
});

app.post("/login", (req, res) => {
  for (const user in users) {
    if (req.body.email === users[user].email) {
      if (bcrypt.compareSync(req.body.password, users[user].password)) {
        res.cookie('user_id', user);
        res.redirect("/urls");
        return;
      }
      else {
        res.status(403).send('User email and password do not match!');
        return;
      }
    }
  }
  res.status(403).send('User email not found!');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(req.body.longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL].longURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});


// Functions
function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}

function emailLookUp(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}

function urlsForUser(id) {
  let userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = {longURL : urlDatabase[shortURL].longURL };
    }
  }
  return userURLs;
}