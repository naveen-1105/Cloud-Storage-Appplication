import { ObjectId } from "mongodb";
import Directory from "../Models/directory.model.js";
import User from "../Models/users.model.js";
import mongoose from "mongoose";

export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  const foundUser =await User.findOne({email}).lean()
  if(foundUser) {
    return res.status(409).json({
      error: "User already exists",
      message: "A user with this email address already exists. Please try logging in or use a different email."
    })
  }

  const userId = new mongoose.Types.ObjectId()
  const rootDirId = new mongoose.Types.ObjectId()
  const session = await mongoose.startSession()
  try {
    await Directory.insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session }
    );

    await User.insertOne(
      {
        _id: userId,
        name,
        email,
        password,
        rootDirId,
      },
      { session }
    );
    await session.commitTransaction();
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    console.log(err.message);
    await session.abortTransaction();
    next(err);
  }
}

export const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) {
    return res.status(404).json({ messagae: "user not found" });
  }
  res.cookie("uid", user._id.toString(), {
    httpOnly: true,
  });
  res.json({ message: "logged in" });
}

export const getUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
  });
}

export const userLogout = (req, res) => {
  res.clearCookie("uid");
  res.status(204).end();
}