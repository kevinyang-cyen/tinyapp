// Returns user_id from database given email
const getUserByEmail = function(email, database) {
  let user;
  for (const user_id in database) {
    if (database[user_id].email === email) {
      user = user_id; 
    }
  }
  return user;
};

// Checks if user email already exists in database
function emailLookUp(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return true;
    }
  }
  return false;
}

// Returns urls belonging to the user id
function urlsForUser(id, database) {
  let userURLs = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userURLs[shortURL] = {longURL : database[shortURL].longURL };
    }
  }
  return userURLs;
}

// Generates random 6 letter or number string
function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}

module.exports = {getUserByEmail, emailLookUp, generateRandomString, urlsForUser};