let db = {
  users: [
    {
      userId: "string",
      email: "string, email format",
      userName: "string",
      createdAt: "string, new date to iso",
      imageUrl: "userName/image/imageId",
      bio: "string",
      website: "string, web address",
      location: "string, city state",
    },
  ],
  posts: [
    {
      userName: "string",
      body: "string",
      createdAt: "string, new date to iso",
      likeCount: 0,
      commentCount: 0,
    },
  ],
  comments: [
    {
      userName: "string",
      postId: "string",
      body: "string",
      createdAt: "string, new date to iso",
    },
  ],
  notifications: [
    {
      recipient: "string, receiving userName",
      sender: "string, senders userName",
      read: "boolean, true or false",
      postId: "string",
      type: "string, like or comment",
      createdAt: "string, new date to iso",
    },
  ],
};

const userDetails = {
  // Redux data
  credentials: {
    userId: "string",
    email: "string, email format",
    userName: "string, userName",
    createdAt: "string, new date to iso",
    imageUrl: "userName/image/imageId",
    bio: "string",
    website: "string, email format",
    location: "string, city,state",
  },
  likes: [
    {
      userName: "string",
      postId: "string",
    },
    {
      userName: "string",
      postId: "string",
    },
  ],
};
