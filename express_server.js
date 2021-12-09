const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieParser())

// ....... Generate 6-digit string.......
const generateRandomString = function () {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for ( var i = 0; i < 6; i++ ) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

// ...... URLs Database ..............
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};
// ..... users Database.......
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

// convert the request body from a Buffer into string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// ......Add a GET Route to Show the Form...........

app.get("/urls", (req, res) => {
  const cookieId = req.cookies['user_id']
  const templateVars = { urls: urlDatabase, user: users[cookieId]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const cookieId = req.cookies['user_id']
  const templateVars = {
  user: users[cookieId],
  // ... any other vars
};
console.log("cookieId", cookieId);
console.log("users", users);
res.render("urls_new", templateVars);
});

//............Add a route for shortURL.............. 
app.get("/urls/:shortURL", (req, res) => {
  const cookieId = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, 
                          longURL,
                          user: users[cookieId]};

  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  // Generate random shortURL......
  let shortURL = generateRandomString();
  // extract longURL from server......
  let longURL = req.body.longURL;
  // Assign shortURL & longURL to Database...
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);        
});

// .....Redirect Short URLs.....
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//..... Updating longURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  // Assign shortURL & longURL to Database...
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
})

// .....Add Login Route..............
app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls');
});

  // .... Logout Route .....
  app.post("/logout", (req, res) => {
    res.clearCookie('user_id');
    res.redirect("/urls");
  })

  // Register Route.......
  app.get("/register", (req, res) => {
    const cookieId = req.cookies['user_id'];
    const templateVars = { urls: urlDatabase, user: users[cookieId]};
    res.render("urls_register", templateVars);
  });
  // ........ Registration Edpoint........
  app.post("/register", (req, res) => {
    // .. Add new users...........
    // ... generate a random user ID...
    let id = generateRandomString();
    const { email, password } = req.body;
    users[id] = {id,email,password};
    res.cookie('user_id', id);
    res.redirect("/urls");
  })

  
app.listen(PORT, () => {
  console.log(`Tinyapp is listening on port ${PORT}!`);
});