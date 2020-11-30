const { db } = require("../utility/admin");

exports.newPost = (req, res) => {
  req.body.body.trim() === "" &&
    res.status(400).json({ body: "Content required" });

  const newPost = {
    body: req.body.body,
    userName: req.user.userName,
    imageUrl: req.user.imageUrl,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };

  db.collection("posts")
    .add(newPost)
    .then((doc) => {
      const resPost = newPost;
      resPost.postId = doc.id;
      res.json({ resPost });
    })
    .catch((err) => {
      res.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
};

exports.getPost = (req, res) => {
  let post = {};
  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      !doc.exists && res.status(404).json({ error: "Post not found" });

      post = doc.data();
      post.postId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("postId", "==", req.params.postId)
        .get();
    })
    .then((data) => {
      post.comments = [];
      data.forEach((doc) => {
        post.comments.push(doc.data());
      });
      return res.json(post);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.getPosts = (req, res) => {
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let posts = [];
      data.forEach((doc) => {
        posts.push({
          postId: doc.id,
          body: doc.data().body,
          userName: doc.data().userName,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
          imageUrl: doc.data().imageUrl,
        });
      });
      return res.json(posts);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.commentOnPost = (req, res) => {
  req.body.body.trim() === "" &&
    res.status(400).json({ comment: "Must not be empty" });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    postId: req.params.postId,
    userName: req.user.userName,
    imageUrl: req.user.imageUrl,
  };

  db.doc(`/posts/${req.params.postId}`)
    .get()
    .then((doc) => {
      !doc.exists && res.status(404).json({ error: "Status not found" });

      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    });
};

exports.likePost = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userName", "==", req.user.userName)
    .where("postId", "==", req.params.postId)
    .limit(1);

  const postDocument = db.doc(`/posts/${req.params.postId}`);

  let postData;

  postDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Post not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            postId: req.params.postId,
            userName: req.user.userName,
          })
          .then(() => {
            postData.likeCount++;
            return postDocument.update({ likeCount: postData.likeCount });
          })
          .then(() => {
            return res.json(postData);
          });
      } else {
        return res.status(400).json({ error: "Post already liked" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.unlikePost = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userName", "==", req.user.userName)
    .where("postId", "==", req.params.postId)
    .limit(1);

  const postDocument = db.doc(`/posts/${req.params.postId}`);

  let postData;

  postDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        postData = doc.data();
        postData.postId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Post not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: "Post not liked" });
      } else {
        return db
          .doc(`/likes/${data.docs[0].id}`)
          .delete()
          .then(() => {
            postData.likeCount--;
            return postDocument.update({ likeCount: postData.likeCount });
          })
          .then(() => {
            res.json(postData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.deletePost = (req, res) => {
  const document = db.doc(`/posts/${req.params.postId}`);
  document
    .get()
    .then((doc) => {
      !doc.exists && res.status(404).json({ error: "Post not found" });

      doc.data().userName !== req.user.userName
        ? res.status(403).json({ error: "Unauthorized" })
        : document.delete();
    })
    .then(() => {
      res.json({ message: "Post deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.editComment = (req, res) => {
  req.body.body.trim() === "" &&
    res.status(400).json({ comment: "Must not be empty" });

  const document = db.doc(`/posts/${req.params.postId}`);
  document
    .get()
    .then((doc) => {
      !doc.exists && res.status(404).json({ error: "Post not found" });

      doc.data().userName !== req.user.userName
        ? res.status(403).json({ error: "Unauthorized" })
        : document.update({ body: req.body.body });
    })
    .then(() => {
      res.json({ message: "Post updated successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.deleteComment = (req, res) => {
  const document = db.doc(`/posts/${req.params.postId}`);
  document
    .get()
    .then((doc) => {
      !doc.exists && res.status(404).json({ error: "Post not found" });

      doc.data().userName !== req.user.userName
        ? res.status(403).json({ error: "Unauthorized" })
        : document.delete();
    })
    .then(() => {
      res.json({ message: "Post deleted successfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
