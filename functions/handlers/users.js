const { db, admin } = require("../utility/admin");

const config = require("../utility/config");
const { uuid } = require("uuidv4");

const firebase = require("firebase");
firebase.initializeApp(config);

const {
  validateSignupData,
  validateLoginData,
  reduceUserDetails,
} = require("../utility/validators");

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    userName: req.body.userName,
  };

  const { valid, errors } = validateSignupData(newUser);
  const defaultImage = "no-img.png";
  let token, userId;

  !valid && res.status(400).json(errors);

  db.doc(`/users/${newUser.userName}`)
    .get()
    .then((doc) => {
      doc.exists
        ? res.status(400).json({ userName: "Username already in use." })
        : firebase.auth().createUser(newUser.email, newUser.password);
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        userName: newUser.userName,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${defaultImage}?alt=media`,
        userId,
      };
      db.doc(`/users/${newUser.userName}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      err.code === "auth/email-already-in-use"
        ? res.status(400).json({ email: "Email is already in use" })
        : res
            .status(500)
            .json({ general: "Something went wrong, please try again" });
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { valid, errors } = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res
        .status(403)
        .json({ general: "Wrong credentials, please try again" });
    });
};
