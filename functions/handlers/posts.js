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
