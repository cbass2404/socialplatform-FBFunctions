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
