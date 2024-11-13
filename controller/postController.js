import Post from "./../models/postModel.js";
import Comment from "./../models/commentsModel.js";
import User from "../models/userModel.js";

const findUser = async (token) => {
  return await User.findOne({ token: token });
};

export const createPost = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await findUser(token); // Await the async function
    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }
    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: req.file ? req.file.filename : "",
      fileType: req.file ? req.file.filename.split(".").pop() : "", // Use .pop() for file type
    });

    await post.save();
    return res.status(200).json({ message: "Post Created" });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getAllPosts = async (req, res) => {
  try {
    const allPost = await Post.find().populate(
      "userId",
      "name email username profilePicture"
    );
    return res.json({ allPost });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;
  try {
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(400).json("User Not Found");
    }

    const post = await Post({ _id: post_id });
    if (!post) {
      return res.status(400).json("Post Not Found");
    }

    await Post.deleteOne({ _id: post._id });
    return res.status(200).json("Post Deleted Successfully");
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const comment = async (req, res) => {
  const { token, post_id, commentBody } = req.body;
  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(400).json("User Not Found");
    }
    const post = await Post({ _id: post_id });
    if (!post) {
      return res.status(400).json("Post Not Found");
    }
    const comment = new Comment({
      userId: user._id,
      postId: post._id,
      body: commentBody,
    });
    await comment.save();
    return res.status(200).json({ message: "Comment Added" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllCommentsPosts = async (req, res) => {
  const { post_id } = req.query;
  try {
    const post = await Post({ _id: post_id });
    if (!post) {
      return res.status(400).json("Post Not Found");
    }
    const comments = await Comment.find({ postId: post_id }).populate(
      "userId",
      "username name"
    );
    return res.json(comments.reverse());
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteComment = async (req, res) => {
  const { token, comment_id } = req.body;
  try {
    const user = await User.findOne({ token: token }).select("._id");
    if (!user) {
      return res.status(400).json("User Not Found");
    }
    const comment = await Comment({ _id: post_id });
    if (!comment) {
      return res.status(400).json("Comment Not Found");
    }
    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(400).json("Unauthorized User");
    }
    await Comment.deleteOne({ _id: comment._id });
    return res.status(200).json("Post Deleted Successfully");
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const likesIncrrement = async (req, res) => {
  const { post_id } = req.body;
  try {
    const post = await Post.findById(post_id); // Correctly fetch the post
    if (!post) {
      return res.status(404).json("Post Not Found"); // Use 404 for not found
    }
    post.likes += 1; // Increment likes
    await post.save(); // Save the updated post
    return res.status(200).json("Like Incremented");
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
