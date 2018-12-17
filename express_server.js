const express       = require("express");
const app           = express();
const PORT          = 8080;
const bodyParser    = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt        = require('bcryptjs');

app.use(cookieSession({
  keys: ["Encrypted Cookie"]
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//day4

const urlDatabase  = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1_RandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2_RandomID"
  }
};

//day4 task3
const users = {
  "user1_RandomID": {
    id: "user1_RandomID",
    email: "user1@example.com",
    password: bcrypt.hashSync("123", 10)
  },
  "user2_RandomID": {
    id: "user2_RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", 10)
  }
};



//day2
function generateRandomString() {
  var myURL = "";
  var myData = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for(var i = 0;i < 6; i++) {
    var indexOfMyURL = Math.floor(Math.random()*myData.length);
    myURL += myData[indexOfMyURL];
  }
  return myURL;
}

//day4
function matchUserEmailInDB(email) {
  for (var user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
}


function matchEmailToGetID(userEmail){
  let thisUser;
  for(var user in users){
    if(users[user].email === userEmail){
      thisUser = users[user].id;
    }
  }
  return thisUser;
}


function matchEmailToGetPsw(email) {
  for (var user in users) {
    if (email === users[user].email) {
      return users[user].password;
    }
  }
}


function urlsForUser(id) {
  var urlForThisUser = {};
  for (var url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      urlForThisUser[url] = urlDatabase[url];
    }
  }
  return urlForThisUser;
}



//render works with get method
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)};
  res.render("urls_index", templateVars);
});



//-------------------login--------------
app.get("/login", (req, res) => {
  res.render("login_form");
});

//only way to see the shorted url is to login
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
// day4
app.post("/login", (req, res) => {
  const {user_email, password} = req.body;

  if (!matchUserEmailInDB(user_email)){
    res.sendStatus(403).send("This email was not found.");
  }else{
    if (!bcrypt.compareSync(password, matchEmailToGetPsw(user_email))) {
      res.sendStatus(403).send("This email was not found.");
    }else{
      req.session.user_id = matchEmailToGetID(user_email);
      res.redirect("/urls");
    }
  }
});



//-------------------------------------------------------------

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL};
  if (req.session.user_id === urlDatabase[req.params.id].userID){
    res.render("urls_show", templateVars);
  } else {
    res.send("Access dennied");
  }
});


app.get("/urls/:id/update", (req, res) => {
  res.redirect("/urls/" + req.params.id);
});


app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});


 //day4
app.get("/register", (req, res) => {
  res.render("register_form");
});
// day4
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    res.status(400).send("Sorry,input can not be empty.");
  } else if (matchUserEmailInDB(email)){
    res.status(400).send("Sorry email has been registered");
  } else {
    var userRandomID = generateRandomString();
    users[userRandomID] = {
      id: userRandomID,
      email: email,
      password: hashedPassword
    };
    req.session.user_id = matchEmailToGetID(email);
    res.redirect("/urls");
  }
});




app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.post("/urls/new", (req, res) => {
  let newURL = generateRandomString();
  let user_id = req.session.user_id;
    urlDatabase[newURL] = {
      longURL: "http://" + req.body.longURL,
      userID: user_id
    }
    res.redirect("/urls");
});


app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = {
    longURL: "http://" + req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect("/urls");
});

//--------------------------


app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id === urlDatabase[req.params.id]["userID"]){
    delete urlDatabase[req.params.id];
  }

  res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});