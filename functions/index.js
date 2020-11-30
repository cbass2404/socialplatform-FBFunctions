require("dotenv").config();

const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./utility/fbAuth");

const cors = require("cors");
app.use(cors());

const { db } = require("./utility/admin");

const {
  newPost,
  getPost,
  getPosts,
  commentOnPost,
  likePost,
  unlikePost,
  deletePost,
  editPost,
  editComment,
  deleteComment,
} = require("./handlers/status");

const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
} = require("./handlers/users");

// Status Routes
app.post("/posts", FBAuth, newPost);
app.get("/posts/:postId", getPost);
app.get("/posts", getPosts);
app.post("/posts/:postId/comment", FBAuth, commentOnPost);
app.get("/posts/:postId/like", FBAuth, likePost);
app.get("/posts/:postId/unlike", FBAuth, unlikePost);
app.delete("/posts/:postId", FBAuth, deletePost);
app.put("/posts/:postId", editPost);
app.put("/posts/:postId/:commentId", editComment);
app.delete("/posts/:postId/:commentId", deleteComment);

// User Routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.get("/user/:userName", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.region("us-central1").https.onRequest(app);
