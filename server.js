let express = require('express')
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
let request = require('request')
let querystring = require('querystring')
const passport = require("passport");
const cors = require('cors')

const users = require("./routes/api/users");
const usersRestricted = require("./routes/api/users-restricted");

let app = express()

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use(cors())

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Routes
app.use("/api/users", users);  
app.use("/api/restricted-users", usersRestricted(passport)); 

let redirect_uri = 
  process.env.REDIRECT_URI || 
  'http://localhost:8888/callback'

app.get('/stocktwits-login', function(req, res) {
  res.redirect('https://api.stocktwits.com/api/2/oauth/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.STOCKTWITS_CLIENT_ID,
      scope: 'read',
      redirect_uri
    }))
})

app.get('/callback', function(req, res) {
  console.log("This is the code - " + req.query.code)
  let code = req.query.code || null
  let authOptions = {
    url: 'https://api.stocktwits.com/api/2/oauth/token',
    form: {
      client_id: process.env.STOCKTWITS_CLIENT_ID,
      client_secret: process.env.STOCKTWITS_CLIENT_SECRET,
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    // headers: {
    //   'Authorization': 'Basic ' + process.env.STOCKTWITS_CLIENT_ID + ':' + process.env.STOCKTWITS_CLIENT_SECRET
    // },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token
    console.log(body);
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
    // console.log(access_token)
    res.redirect(uri + '?access_token=' + access_token)
  })
})

let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go /stocktwits-login to initiate authentication flow.`)
app.listen(port)