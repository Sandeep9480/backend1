import User from "./../models/userModel.js";
import bcrypt from "bcrypt";
import Profile from "./../models/profileModel.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import Connection from "../models/connectionModel.js";
import Post from "./../models/postModel.js";

const convertUserDataIntoPdf = async (userData) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/" + outputPath);
  doc.pipe(stream);

  doc.image(`uploads/${userData.userId.profilePicture}`, {
    textAline: "center",
    width: 100,
  });
  doc.fontSize(14).text(`Name:${userData.userId.name}`);
  doc.fontSize(14).text(`Username:${userData.userId.username}`);
  doc.fontSize(14).text(`Email:${userData.userId.email}`);
  doc.fontSize(14).text(`Bio:${userData.userId.bio}`);
  doc.fontSize(14).text(`Current Position :${userData.userId.currPost}`);
  doc.fontSize(14).text(`Past Work`);
  userData.pastWork.forEach((work, index) => {
    doc.fontSize(14).text(`Company name ${work.company}`);
    doc.fontSize(14).text(`Position ${work.position}`);
    doc.fontSize(14).text(`Years ${work.years}`);
  });
  doc.end();
  return outputPath;
};

export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password || !username) {
      return res.status(400).send({ message: "All files are required" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).send({ message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();
    console.log;

    const profile = await Profile({ userId: newUser._id });
    await profile.save();
    return res.json("User Created Succussfully");
  } catch (error) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User Not Fount " });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(404).send({ message: "Invalid Password" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    await User.updateOne({ _id: user._id }, { token: token });
    return res.json({ token: token });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json("User Not Found");
    }

    user.profilePicture = req.file.filename;
    await user.save();
    return res
      .status(200)
      .json({ message: "Profile Picture Uploadded Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json("User Not Found");
    }
    const { username, email } = newUserData;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res.status(400).json("User Already Exsists");
      }
    }
    Object.assign(user, newUserData);
    await user.save();
    return res.status(200).json("User  Updated");
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json("User Not Found");
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );
    return res.json({ userProfile });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;
    const userProfile = await User.findOne({ token: token });
    if (!userProfile) {
      return res.status(400).json("User Not Found");
    }
    const newUserProfile = await Profile.findOne({ userId: userProfile._id });
    Object.assign(newUserProfile, newProfileData);
    await newUserProfile.save();
    return res.status(200).json("User Profile Updated");
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getAllProfile = async (req, res) => {
  try {
    const allProfile = await Profile.find().populate(
      "userId",
      "name email username profilePicture"
    );
    return res.json({ allProfile });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const downloadPDF = async (req, res) => {
  const user_id = req.query.id;
  console.log(user_id);
  try {
    const profile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name email username profilePicture"
    );
    let outputPath = await convertUserDataIntoPdf(profile);
    return res.json({ message: outputPath });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendConnection = async (req, res) => {
  const { token, connectionId } = req.body;
  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json("User Not Found");
    }
    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionUser) {
      return res.status(400).json(" Connection User Not Found");
    }

    const connection = await Connection.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    if (connection) {
      return res.status(400).json(" Connection Already Sent");
    }
    const request = new Connection({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    console.log(request);
    await request.save();
    return res.status(200).json("Connection sent");
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyConnections = async (req, res) => {
  try {
    const { token } = req.query; // Extract token from query

    if (!token) {
      return res.status(400).json("Token is missing");
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json("User Not Found");
    }

    const connections = await Connection.find({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );
    return res.json({ connections });
  } catch (error) {
    console.error("Error occurred:", error); // Logging error for debugging
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const allMyConnections = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json("User Not Found");
    }
    const connections = await Connection.find({
      connectionId: user._id,
    }).populate("userId", "name email username profilePicture");
    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const acceptConnections = async (req, res) => {
  try {
    const { token, requestId, actionType } = req.query;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(400).json("User Not Found");
    }
    const connection = await Connection.findOne({ _id: requestId });
    if (!connection) {
      return res.status(400).json("Connection Not Found");
    }
    if (actionType === "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }

    await connection.save();
    return res.status(200).json("Connection Accepted");
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const createPost = async (req, res) => {
//   const { token } = req.body;
//   try {
//     const user = await User.findOne({ token: token });

//     if (!user) {
//       return res.status(400).json("User Not Found");
//     }
//     const post = new Post({
//       userId: user._id,
//       body: req.body.body,
//       media: req.file != undefined ? req.file.filename : "",
//       fileType: req.file != undefined ? req.file.filename.split("/")[1] : "",
//     });
//     let ans = await post.save();
//     console.log(ans);
//     return res.status(200).json({ message: "Post Created" });
//   } catch (error) {
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

export const getUserProfileAndBasedOnUsername = async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({
      username,
    });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );
    return res.json({ profile: userProfile });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
