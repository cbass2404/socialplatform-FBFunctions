require("dotenv").config();

const functions = require("firebase-functions");
const app = require("express")();
const FBAuth = require("./utility/fbAuth");

const cors = require("cors");
app.use(cors());

const { db } = require("./utility/admin");

const {
  signup,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead,
  deleteUser,
} = require("./handlers/users");

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
} = require("./handlers/posts");

app.post("/signup", signup);
app.post("/login", login);
app.get("/user/:userName", getUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.post("/user", FBAuth, addUserDetails);
app.post("/user/image", FBAuth, uploadImage);
app.post("/notifications", FBAuth, markNotificationsRead);
app.delete("/user/:userName", FBAuth, deleteUser);

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

exports.api = functions.region("us-central1").https.onRequest(app);
