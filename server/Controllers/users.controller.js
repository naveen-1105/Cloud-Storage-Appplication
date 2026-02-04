import Directory from "../Models/directory.model.js";
import User from "../Models/users.model.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt"
import { Session } from "../Models/session.model.js";

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

  if(!user){
    return res.status(404).json({message: "No user exist with this Email"})
  }

  const isPasswordValid = await bcrypt.compare(password,user.password)
  if(!isPasswordValid){
    return res.status(401).json({error: "Invalid Credentials"})
  }

  if (!user) {
    res.status(404).json({ messagae: "user not found" });
  }

  try {
    const allSessions = await Session.find({userId : user._id})
    console.log(allSessions);
    if(allSessions.length >= 2){
      await Session.deleteOne({_id: allSessions[0]._id})
      console.log("Deleted one session",allSessions[0]);
    }
    const session = await Session.create({
      userId: user._id,
    })
    console.log(session);
    res.cookie("sid", session._id, {
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

export const userLogout = async(req, res) => {
  const {sid} = req.signedCookies
  // const session = await Session.findOne({_id: sid});
  await Session.deleteOne({_id: sid})
  res.clearCookie('sid')
  res.status(204).end();
};

export const logoutAll = async(req, res) => {
   const {sid} = req.signedCookies
  const session = await Session.findOne({_id: sid});
  await Session.deleteMany({userId: session.userId})

  res.status(204).json({message: "Logged out from all the devices"})
}
