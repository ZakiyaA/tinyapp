const {generateRandomString,  findEmail, findPassword, findUserID , checkPassword, urlsForUser} = require('./helpers.js');


const express = require("express");
const cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs')
const app = express();

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieParser())

app.use(
  cookieSession({
    name: 'session',
    keys: ['e1d50c4f-538a-4682-89f4-c002f10a59c8', '2d310699-67d3-4b26-a3a4-1dbf2b67be5c'],
  })
);

// convert the request body from a Buffer into string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


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



//...... homepage .....

app.get("/", (req, res) => {
  const userID = req.session.userId;
  const user = users[userID];
  if (!user) {
    return res.redirect('/login');
  }
  return res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//...... Display all links pairs in user's account

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.status(400).json({message: "You have to Login First"})
  
  } else {
  const urlsToDisplay = urlsForUser(userID, urlDatabase);
  templateVars = {
    user,
    urls: urlsToDisplay
  };
}
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  // if (!req.session.user_id) {
  //   res.redirect("/login?alert=true");
  // } 
    let templateVars = { urls: urlDatabase, user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  
});

//............Add a route for shortURL.............. 
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(400).json({message: "Not valide shortURL passed"})
  }
  const longURL = urlDatabase[shortURL].longURL;
  console.log("longURL", longURL);
  const templateVars = { shortURL, 
                          longURL,
                          user: users[req.session.user_id]};

  res.render("urls_show", templateVars);
});

 
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).json({message: "Access Denied, Please Login first"});
  }
  // extract longURL from server......
  let longURL = req.body.longURL;
  if (!longURL) {
    return res.status(400).json({message: "Please enter valid url"});
  }
  // Generate random shortURL......
  let shortURL = generateRandomString();
  // Assign shortURL & longURL to Database...
  const urlObject = {
    longURL: longURL, 
    userID: req.session.user_id
  }
  urlDatabase[shortURL]= urlObject;
  res.redirect(`/urls/${shortURL}`);        
});

// .....Redirect Short URLs.....
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase.hasOwnProperty(req.params.shortURL)) {
    return res.status(400).send("Page doesn't exist");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Delete URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
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
  const userID = req.session.user_id;
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
  const templateVars = {user: users[req.session.user_id]};
  res.render("urls_login", templateVars);
});

// .....Add Login Route..............
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userEmail = findEmail(email, users);
  const userPassword = findPassword(email, users);
  // const hashedPassword = bcrypt.hashSync(userPassword, 10);
  if (email === userEmail) {
    if (bcrypt.compareSync(password, userPassword)) {
      const userID = findUserID(email, users);
      req.session.user_id = userID;
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
    req.session = null;
    res.redirect("/urls");
  });

  // Register Route.......
  app.get("/register", (req, res) => {
    const templateVars = {user: users[req.session.user_id]};
    if (templateVars.user) {
      res.redirect("/urls");
    } else {
      res.render("urls_register", templateVars);
    }
  });

app.post("/register", function (req, res) {
  const { email, password } = req.body;
  //if email or password input is blank throw an error
  if (email === "" || password === "") {
    res.status(400).send("An email or password needs to be entered.")
    return
    //if email is already in use throw an error 
  } else if (findEmail(email, users)) {
    res.status(400).send("Email is already in use.")
    return
  } else {
    //if the email is not in use, create a new user for TinyApp
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: bcrypt.hashSync(password, 8)
    }
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});




  
app.listen(PORT, () => {
  console.log(`Tinyapp is listening on port ${PORT}!`);
});