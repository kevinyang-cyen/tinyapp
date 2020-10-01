const assert = require('chai').assert;

const {getUserByEmail, emailLookUp, urlsForUser} = require("../helper.js");

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "abcdef";
    assert.strictEqual(user, expectedOutput);
  });

  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("user3@example.com", users)
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});

describe('emailLookUp', function() {
  it('should true with a valid email', function() {
    const exist = emailLookUp("user@example.com", users);
    assert.isTrue(exist);
  });

  it('should return false with an invalid email', function() {
    const exist = emailLookUp("user3@example.com", users)
    assert.isFalse(exist);
  });
});

describe('urlsForUser', function() {
  it('urls in the database belonging to the user ID', function() {
    const urls = urlsForUser("abcdef", urlDatabase);
    console.log();
    const expected = {
      "9sm5xK": {"longURL": "http://www.google.com"},
      "b2xVn2": {"longURL": "http://www.lighthouselabs.ca"}
      };
    assert.deepEqual(urls, expected);
  });

  it('should return blank object if no urls are found for the user ID', function() {
    const urls = urlsForUser("a2d3f4", urlDatabase);
    const expected = {};
    assert.deepEqual(urls, expected);
  });
});