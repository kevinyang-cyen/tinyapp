// TinyApp - A full stack web app built with Node and Express 
// that allows users to shorten long URLs (à la bit.ly).
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const {getUserByEmail, emailLookUp, generateRandomString, urlsForUser} = require("./helper.js");

// Server Setup -----------------------------------
const PORT = 8080; // default port 8080
const app = express();
app.set("view engine", "ejs");

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['secretkey1', 'secretkey2']
}));

// Databases
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "abcdef"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "abcdef"}
};

const users = { 
  "abcdef": {
    id: "abcdef", 
    email: "user@example.com", 
    password: bcrypt.hashSync("temppassword", 10)
  },
 "bcdefg": {
    id: "bcdefg", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

// GETs
app.get("/", (req,res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Page render for user registration
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("register", templateVars);
});

// Page render for user login
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});

// Page render for list of user urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

// Page render for creating a new shortURL
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

// Page render for shortURL
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send('Short URL not found!');
    return;
  }
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id], urlUserID: urlDatabase[req.params.shortURL].userID };
  res.render("urls_show", templateVars);
});

// Path with shortURL to redirect to actual longURL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// Posts
// Checks if user filled out registration correctly
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Please fill out an email and a password!');
    return;
  }
  if (emailLookUp(req.body.email, users)) {
    res.status(400).send('Email already exists!');
    return;
  }
  else {
    let userID = generateRandomString();
    users[userID] = {id: userID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10)};
    req.session.user_id = userID;
    res.redirect("urls");
  }
});

// Checks if user entered login info correctly
app.post("/login", (req, res) => {
  let user_id = getUserByEmail(req.body.email, users);
  if (user_id) {
    if (bcrypt.compareSync(req.body.password, users[user_id].password)) {
      req.session.user_id = user_id;
      res.redirect("/urls");
      return;
    }
    else {
      res.status(403).send('User email and password do not match!');
      return;
    }
  }
  res.status(403).send('User email not found!');
});

// Clears session upon logout
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls");
});

// Adds generates new shortURL and redirects to actual page
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(req.body.longURL);
});

// Updates existing longURL for given shortURL
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

// Deletes a user shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// Console logs when server begins listening
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});