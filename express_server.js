const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieParser())

// convert the request body from a Buffer into string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


// //.......check to see if password exist
// const lookUpPassword = (email, users) => {
//   for (let key in users) {
//     if (email === users[key].email) {
//       return users[key].password;
//     }
//   }
//   return undefined;
// };

// ...... URLs Database ..............
let urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};
// ..... users Database.......
const users = { 
  "b6UTxQ": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "i3BoGr": {
    id: "aJ48lW", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

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
const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// ......Add a GET Route to Show the Form...........

app.get("/urls", (req, res) => {
  const cookieId = req.cookies['user_id']
  const templateVars = { urls: urlDatabase, 
                        user: users[cookieId]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const cookieId = req.cookies['user_id']
  const templateVars = {
    user: users[cookieId],
  };
   // user should not see this page if not logged in
  if (!cookieId) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }

});

//............Add a route for shortURL.............. 
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(400).json({message: "Not valide shortURL passed"})
  }
  const cookieId = req.cookies['user_id'];
  const longURL = urlDatabase[shortURL].longURL;
  console.log("longURL", longURL);
  const templateVars = { shortURL, 
                          longURL,
                          user: users[cookieId]};

  res.render("urls_show", templateVars);
});

 
app.post("/urls", (req, res) => {
  const cookieId = req.cookies['user_id'];
  if (!cookieId) {
    return res.status(401).json({message: "Access Denied, Please Login first"});
  }
  // extract longURL from server......
  let longURL = req.body.longURL;
  if (!longURL) {
    return res.status(400).json({message: "Please enter valid url"});
  }
  // Generate random shortURL......
  let shortURL = generateRandomString();
  console.log("cookieId", cookieId);
  // Assign shortURL & longURL to Database...
  const urlObject = {
    longURL: longURL, 
    userID: cookieId
  }
  urlDatabase[shortURL]= urlObject;
  res.redirect(`/urls/${shortURL}`);        
});

// .....Redirect Short URLs.....
app.get("/u/:shortURL", (req, res) => {
  const cookieId = req.cookies['user_id'];
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL;
  // if (!cookieId) {
  //   res.redirect("/urls");
  // } else {
    res.redirect(longURL);
  
});

// Delete URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies['user_id'];
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to delete this short URL.");
  }
});



//..... Edit longURL .................
app.post("/urls/:id", (req, res) => {
  const userID = req.cookies['user_id'];
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to edit this short URL.");
  }
});



// Add 
app.get("/login", (req, res) => {
  const cookieId = req.cookies['user_id'];
  const templateVars = {user: users[cookieId]};
  res.render("urls_login", templateVars);
});

// .....Add Login Route..............
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userEmail = findEmail(email, users);
  const userPassword = findPassword(email, users);
  if (email === userEmail) {
    if (password === userPassword) {
      const userID = findUserID(email, users);
      res.cookie('user_id', userID);
      res.redirect('/urls');
    } else {
      res.status(403).send("400 error: An email or password incorrect");
    }
  } else {
    res.status(403).send("403 error: Please Register");
  }
});

  // .... Logout Route .....
  app.post("/logout", (req, res) => {
    res.clearCookie('user_id');
    res.redirect("/urls");
  });

  // Register Route.......
  app.get("/register", (req, res) => {
    const cookieId = req.cookies['user_id'];
    const templateVars = {user: users[cookieId]};
    res.render("urls_register", templateVars);
  });

// ........ Registration Edpoint..........
app.post("/register", (req, res) => {
  // .. Add new users with a random user ID...
  let id = generateRandomString();
  const { email, password } = req.body;
  res.cookie('user_id', id);
  // .... Check if inputs are empty string ....
  if (!email || !password) {
    res.status(400).send("400 error ! An email or password needs to be entered");
    return;
  }
  const userEmail = findEmail(email, users);
  if (userEmail !== undefined) {
    console.log("Matching");
    res.status(400).send("400 error  ! Email is alraedy exist");
    return;
  }
  users[id] = { id, email, password };
  res.redirect("/urls");
})

  
app.listen(PORT, () => {
  console.log(`Tinyapp is listening on port ${PORT}!`);
});