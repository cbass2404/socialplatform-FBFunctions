const isEmailFormat = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  email.match(regEx) ? true : false;
};

const isEmpty = (string) => {
  string.trim() === "" ? true : false;
};

exports.validateSignupData = (data) => {
  let errors = {};

  isEmpty(data.email)
    ? (errors.email = "")
    : !isEmailFormat && (errors.email = "Not a valid email address.");
  isEmpty(data.password) && (errors.password = "Enter a password");
  data.password !== data.confirmPassword &&
    (errors.confirmPassword = "Passwords must match");

  isEmpty(data.userName) && (errors.userName = "Must not be empty");

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateLoginData = (data) => {
  let errors = {};

  isEmpty(data.email) && (errors.email = "Must not be empty");
  isEmpty(data.password) && (errors.password = "Must not be empty");
  Object.keys(errors) > 0 && res.status(400).json(errors);

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.reduceUserDetails = (data) => {
  let userDetails = {};

  !isEmpty(data.bio.trim()) && (userDetails.bio = data.bio);
  if (!isEmpty(data.website.trim())) {
    if (data.website.trim().substring(0, 4) !== "http") {
      return (userDetails.website = `http://${data.website.trim()}`);
    } else {
      return (userDetails.website = data.website);
    }
  }
  !isEmpty(data.location.trim()) && (userDetails.location = data.location);

  return userDetails;
};
