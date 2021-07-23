const { mongodbUser, mongodbPassword } = require('./config');

module.exports = {
    // mongoURI: "mongodb+srv://" + process.env.MONGODB_USERNAME + ":" + process.env.MONGODB_PASSWORD + "@cluster0-y0nsa.mongodb.net/test?retryWrites=true&w=majority",
    // mongoURI: "mongodb+srv://" + process.env.MONGODB_USERNAME + ":" + process.env.MONGODB_PASSWORD + "@cluster0.y0nsa.mongodb.net/test?retryWrites=true&w=majority",
    // mongoURI: "mongodb+srv://voice-app-user:voice-app-17@cluster0.y0nsa.mongodb.net/test?retryWrites=true&w=majority",
    mongoURI: "mongodb+srv://" + mongodbUser + ":" + mongodbPassword + "@cluster0.y0nsa.mongodb.net/test?retryWrites=true&w=majority",
    secretOrKey: "secret" 
  };