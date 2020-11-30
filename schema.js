let db = {
  users: [
    {
      userId: "string",
      email: "string, email format",
      handle: "string",
      createdAt: "string, new date to iso",
      imageUrl: "handle/image/imageId",
      bio: "string",
      website: "string, web address",
      location: "string, city state",
    },
  ],
  posts: [
    {
      handle: "string",
      body: "string",
      createdAt: "string, new date to iso",
      likeCount: 0,
      commentCount: 0,
    },
  ],
  comments: [
    {
      handle: "string",
      postId: "string",
      body: "string",
      createdAt: "string, new date to iso",
    },
  ],
  notifications: [
    {
      recipient: "string, receiving handle",
      sender: "string, senders handle",
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
    handle: "string, handle",
    createdAt: "string, new date to iso",
    imageUrl: "handle/image/imageId",
    bio: "string",
    website: "string, email format",
    location: "string, city,state",
  },
  likes: [
    {
      handle: "string",
      postId: "string",
    },
    {
      handle: "string",
      postId: "string",
    },
  ],
};
