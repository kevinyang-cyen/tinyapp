const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "abcdef": {
    id: "abcdef", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "bcdefg": {
    id: "bcdefg", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

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
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

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
    users[userID] = {id: userID, email: req.body.email, password: req.body.password};
    res.cookie('user_id', userID);
    res.redirect("urls");
  }
});

app.post("/login", (req, res) => {
  for (const user in users) {
    if (req.body.email === users[user].email) {
      if (req.body.password === users[user].password) {
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
  console.log(req.body.longURL);
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(req.body.longURL);  // Redirect to new page *ERROR HERE FIX LATER
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

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