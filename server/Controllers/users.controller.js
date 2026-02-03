import Directory from "../Models/directory.model.js";
import User from "../Models/users.model.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt"

export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  const foundUser = await User.findOne({ email }).lean();
  if (foundUser) {
    return res.status(409).json({
      error: "User already exists",
      message:
        "A user with this email address already exists. Please try logging in or use a different email.",
    });
  }

  const userId = new mongoose.Types.ObjectId();
  const rootDirId = new mongoose.Types.ObjectId();

  const session = await mongoose.startSession();
  session.startTransaction();

  const hashedPassword = await bcrypt.hash(password,12)
  try {
    await Directory.create(
      [
        {
          _id: rootDirId,
          name: `root-${email}`,
          parentDirId: null,
          userId: userId.toString(),
        },
      ],
      { session },
    );

    await User.create(
      [
        {
          _id: userId,
          name,
          email,
          password: hashedPassword,
          rootDirId: rootDirId.toString(),
        },
      ],
      { session },
    );
    await session.commitTransaction();
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    console.log("error:", err);
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email});

  const isPasswordValid = await bcrypt.compare(password,user.password)
  if(!isPasswordValid){
    return res.status(401).json({error: "Invalid Credentials"})
  }

  if (!user) {
    return 
    res.status(404).json({ messagae: "user not found" });
  }

  try {
    const cookiePayload = Buffer.from(
      JSON.stringify({
        uid: user._id.toString(),
        expiry: Date.now() + 1000 * 60 * 60 * 24 * 7,
      }),
    ).toString("base64url");
  
    res.cookie("token", cookiePayload, {
      httpOnly: true,
      maxAge: 1000*60*60*24*7,
      signed: true
    });
    return res.json({ message: "logged in" });
  } catch (error) {
    console.log(error);
    next()
  }
};

export const getUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
};

export const userLogout = (req, res) => {
  res.clearCookie("token");
  res.status(204).end();
};
