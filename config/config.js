const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  mongodbUser: process.env.MONGODB_USERNAME,
  mongodbPassword: process.env.MONGODB_PASSWORD
};