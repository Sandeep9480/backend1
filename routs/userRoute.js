import multer from "multer";
import {
  acceptConnections,
  allMyConnections,
  // createPost,
  downloadPDF,
  getAllProfile,
  getMyConnections,
  getUserProfile,
  getUserProfileAndBasedOnUsername,
  login,
  register,
  sendConnection,
  updateProfile,
  updateUserProfile,
  uploadProfilePicture,
} from "../controller/userController.js";
import { Router } from "express";

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

router
  .route("/update_profile_picture")
  .post(upload.single("profilePicture"), uploadProfilePicture);

// router.route("/post").post(upload.single("media"), createPost);

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/update_user").post(updateUserProfile);
router.route("/get_user_profile").get(getUserProfile);
router.route("/update_user_profile").post(updateProfile);
router.route("/get_allUser_profile").get(getAllProfile);
router.route("/download_resume").get(downloadPDF);
router.route("/send_connection").post(sendConnection);
router.route("/getmy_connection").get(getMyConnections);
router.route("/allmy_connection").get(allMyConnections);
router.route("/accept_connection").get(acceptConnections);
router
  .route("/get_user_profile_based_on_username")
  .get(getUserProfileAndBasedOnUsername);

export default router;
