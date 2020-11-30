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
  editPost,
  deletePost,
  editComment,
  deleteComment,
} = require("./handlers/posts");

app.post("/signup", signup);
app.post("/login", login);
app.get("/user/:handle", getUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);
app.post("/user", FBAuth, addUserDetails);
app.post("/user/image", FBAuth, uploadImage);
app.post("/notifications", FBAuth, markNotificationsRead);
app.delete("/user", FBAuth, deleteUser);

app.post("/posts", FBAuth, newPost);
app.get("/posts/:postId", getPost);
app.get("/posts", getPosts);
app.patch("/posts/:postId", FBAuth, editPost);
app.delete("/posts/:postId", FBAuth, deletePost);
app.get("/posts/:postId/like", FBAuth, likePost);
app.get("/posts/:postId/unlike", FBAuth, unlikePost);
app.post("/posts/:postId/comment", FBAuth, commentOnPost);
app.patch("/posts/:postId/:commentId", FBAuth, editComment);
app.delete("/posts/:postId/:commentId", FBAuth, deleteComment);

exports.api = functions.region("us-central1").https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("us-central1")
  .firestore.document("likes/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then((doc) => {
        if (doc.exists && doc.data().handle !== snapshot.data().handle) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().handle,
            sender: snapshot.data().handle,
            type: "like",
            read: false,
            postId: doc.id,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

exports.deleteNotificationOnUnLike = functions
  .region("us-central1")
  .firestore.document("likes/{id}")
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
      });
  });

exports.createNotificationOnComment = functions
  .region("us-central1")
  .firestore.document("comments/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then((doc) => {
        if (doc.exists && doc.data().handle !== snapshot.data().handle) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().handle,
            sender: snapshot.data().handle,
            type: "comment",
            read: false,
            postId: doc.id,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

exports.onUserImageChange = functions
  .region("us-central1")
  .firestore.document("/users/{userId}")
  .onUpdate((change) => {
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      let batch = db.batch();
      return db
        .collection("posts")
        .where("handle", "==", change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const post = db.doc(`/posts/${doc.id}`);
            batch.update(post, { imageUrl: change.after.data().imageUrl });
          });
          return batch.commit();
        })
        .then(() => {
          change.before.data().imageUrl.delete();
        });
    } else return true;
  });

exports.onPostDelete = functions
  .region("us-central1")
  .firestore.document("/posts/{postId}")
  .onDelete((snapshot, context) => {
    const postId = context.params.postId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("postId", "==", postId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db.collection("likes").where("postId", "==", postId).get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("postId", "==", postId)
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => {
        console.error(err);
      });
  });

exports.onUserDelete = functions
  .region("us-central1")
  .firestore.document("/users/{handle}")
  .onDelete((snapshot, context) => {
    const handle = context.params.handle;
    const batch = db.batch();
    return db
      .collection("posts")
      .where("handle", "==", handle)
      .get()
      .then((data) => {
        data.forEach((post) => {
          batch.delete(db.doc(`/posts/${post.postId}`));
        });
        return batch.commit();
      })
      .catch((err) => {
        console.error(err);
      });
  });
