const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};
// Convert empty fields to an empty string so we can use validator functions
  data.password = !isEmpty(data.password) ? data.password : "";
  data.newPassword = !isEmpty(data.newPassword) ? data.newPassword : "";
  data.newPassword2 = !isEmpty(data.newPassword2) ? data.newPassword2 : "";


// Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if (Validator.isEmpty(data.newPassword)) {
    errors.newPassword = "Password field is required";
  }

  if (Validator.isEmpty(data.newPassword2)) {
      errors.newPassword2 = "Confirm password field is required";
  }

  if (!Validator.isLength(data.newPassword, { min: 6, max: 30 })) {
      errors.newPassword = "Password must be at least 6 characters";
  }

  if (!Validator.isLength(data.newPassword2, { min: 6, max: 30 })) {
      errors.newPassword2 = "Password must be at least 6 characters";
  }

  if (!Validator.equals(data.newPassword, data.newPassword2)) {
      errors.newPassword = "New Passwords must match"; errors.newPassword2 = "New Passwords must match"; 
  }

return {
    errors,
    isValid: isEmpty(errors)
  };
};