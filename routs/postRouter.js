import { Router } from "express";
import multer from "multer";
import {
  comment,
  createPost,
  deleteComment,
  deletePost,
  getAllCommentsPosts,
  getAllPosts,
  likesIncrrement,
} from "../controller/postController.js";

const router = Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.route("/post").post(upload.single("media"), createPost);
router.route("/getAll_post").get(getAllPosts);
router.route("/delete_post").delete(deletePost);
router.route("/add_comment").post(comment);
router.route("/get_comment_post").get(getAllCommentsPosts);
router.route("/delete_comment").post(deleteComment);
router.route("/delete_post").delete(deletePost);
router.route("/like_Increament").post(likesIncrrement);

export default router;
