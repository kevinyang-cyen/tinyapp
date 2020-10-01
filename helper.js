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

module.exports = getUserByEmail;