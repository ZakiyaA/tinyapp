const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// 
const generateRandomString = function() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(6);
}
console.log(generateRandomString());

// ...... Our Database ..............
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

// convert the request body from a Buffer into string
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//............Add a route for /urls................
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// ......Add a GET Route to Show the Form...........
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//............Add a route for shortURL.............. 
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL};
  res.render("urls_show", templateVars);
});



app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  console.log("temp",templateVars);
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // Generate random shortURL......
  let shortURL = generateRandomString();
  // extract longURL from server......
  let longURL = req.body.longURL;
  // Assign shortURL & longURL to Database...
  urlDatabase[shortURL] = longURL;
 res.redirect(`/urls`);        
});

// .....Redirect Short URLs.....
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



app.listen(PORT, () => {
  console.log(`Tinyapp is listening on port ${PORT}!`);
});