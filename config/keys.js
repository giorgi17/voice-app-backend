module.exports = {
    mongoURI: "mongodb+srv://" + process.env.MONGODB_USERNAME + ":" + process.env.MONGODB_PASSWORD + "@cluster0-y0nsa.mongodb.net/test?retryWrites=true&w=majority",
    secretOrKey: "secret" 
  };