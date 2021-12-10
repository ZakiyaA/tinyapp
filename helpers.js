// ....... Generate 6-digit string.......
const generateRandomString = function () {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for ( var i = 0; i < 6; i++ ) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}
//check to see if email exist
const findEmail = (email, users) => {
  for (let key in users) {
    if (email === users[key].email) {
      return email;
    }
  }
  return undefined;
};

//check to see if password exist
const findPassword = (email, db) => {
  for (let key in db) {
    if (email === db[key].email) {
      return db[key].password;
    }
  }
  return undefined;
};

// find the id by email
const findUserID = (email, db) => {
  for (let key in db) {
    if (email === db[key].email) {
      return db[key].id;
    }
  }
  return undefined;
};

//Validate login by checking email and password combination of a user
const checkPassword = function (email, password, users) {
  for (let user in users) {
    if (users[user].email === email && users[user].password === password) {
      return true;
    }
  }
  return false;
}

/* Returns an object of short URLs specific to the passed in userID */
// URLs for display selector
const urlsForUser = function(id, database) {
  let urlsToDisplay = {};
  let urlDatabaseKeys = Object.keys(database);
  for (let url of urlDatabaseKeys) {
    
    if (database[url].userID === id) {
      urlsToDisplay[url] = {
        longURL: database[url].longURL,
        userID: database[url].userID
      };
    }
  }
  return urlsToDisplay;
};


module.exports = {generateRandomString,  findEmail, findPassword, findUserID , checkPassword, urlsForUser}

