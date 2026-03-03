import Directory from "../Models/directory.model.js";
import User from "../Models/users.model.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt"
import { Session } from "../Models/session.model.js";
import Otp from "../Models/otp.model.js";
import { otpSender } from "../util/resend.js";
import { verifyIdToken } from "../services/googleAuthService.js";
import redisClient from "../util/redis.js";

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
          role: "user"
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

  const isPasswordValid = bcrypt.compare(password,user.password)
  if(!isPasswordValid){
    return res.status(401).json({error: "Invalid Credentials"})
  }

  if (!user) {
    res.status(404).json({ messagae: "user not found" });
  }

  try {
    console.log("yha pr hu");
    const allSessions = await redisClient.ft.search(
      "userIdIdx",
      `@userId:{${user.id}}`,
      {
        RETURN: [],
      }
    )
    console.log("yha pr hu 2");
    console.log("AllSessions",allSessions.documents);
    if(allSessions.total >= 2){
      await allSessions[0].deleteOne()
      console.log("Deleted one session",allSessions[0]);
    }
    const sessionId = crypto.randomUUID()
    await redisClient.json.set(`session:${sessionId}`,"$",{
      userId: user._id
    })
    res.cookie("sid", sessionId, {
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

export const userLogout = async(req, res) => {
  const {sid} = req.signedCookies
  // const session = await Session.findOne({_id: sid});
  await redisClient.del(`session:${sid}`)
  res.clearCookie('sid')
  res.status(204).end();
};

export const logoutAll = async(req, res) => {
   const {sid} = req.signedCookies
  const session = await Session.findOne({_id: sid});
  await Session.deleteMany({userId: session.userId})

  res.status(204).json({message: "Logged out from all the devices"})
}

export const sendOtp = async(req,res,next) => {
  const {email} = req.body;
  try {
    const otp = Math.floor(Math.random() * 10000);
    await Otp.findOneAndUpdate(
      { userEmail: email },
      { $set: { otp : otp } },
      { upsert: true }
    )
    otpSender(otp)
  } catch (error) {
    console.log(error);
    next()
  }
  return res.status(200).json({message: "OTP sent!"})
}

export const verifyOtp = async(req,res,next) => {
  const {email,otp} = req.body;
 try {
   const user = await Otp.findOne({userEmail: email})
   if(otp !== user.otp){
     return res.status(401).json({message: "Entered otp doesn't match, please enter correct otp"})
   }
   await Otp.deleteOne({userEmail: email})
 } catch (error) {
  console.log(error);
  next()
 }
  return res.status(201).json({message: "Otp matches, email Verified!!"})
}

export const googleLogin = async(req,res,next) => {
  const {idToken} = req.body;
  const userData = await verifyIdToken(idToken)

  const {email} = userData

  const user = await User.findOne({email}).lean()

  if(user){
    try {
    console.log("yha pr hu");
    const allSessions = await redisClient.ft.search(
      "userIdIdx",
      `@userId:{${user._id}}`,
      {
        RETURN: [],
      }
    )
    console.log("yha pr hu 2");
    console.log("AllSessions",allSessions);
    if(allSessions.total >= 2){
      await redisClient.del(allSessions.documents[0].id)
      console.log("Deleted one session",allSessions[0]);
    }
    const sessionId = crypto.randomUUID()
    await redisClient.json.set(`session:${sessionId}`,"$",{
      userId: user._id
    })
    res.cookie("sid", sessionId, {
      httpOnly: true,
      maxAge: 1000*60*60*24*7,
      signed: true
    });
    return res.json({ message: "logged in" });
  } catch (error) {
    console.log(error);
    next()
  }
  }else{
      const userId = new mongoose.Types.ObjectId();
      const rootDirId = new mongoose.Types.ObjectId();
      console.log({_id: userId,
          name: userData.name,
          email,
          profilePic: userData.picture,
          rootDirId: rootDirId.toString()});
      console.log(rootDirId);

      const mongooseSession = await mongoose.startSession();
      mongooseSession.startTransaction();
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
      { mongooseSession },
    );

    const newUser = await User.create(
      [
        {
          _id: userId,
          name: userData.name,
          email,
          profilePic: userData.picture,
          rootDirId: rootDirId.toString(),
        },
      ],
      { mongooseSession },
    );
    
    const sessionId = crypto.randomUUID()
    await redisClient.json.set(`session:${sessionId}`,"$",{
      userId: user._id
    })
    res.cookie("sid", sessionId, {
      httpOnly: true,
      maxAge: 1000*60*60*24*7,
      signed: true
    });
    await mongooseSession.commitTransaction();
    res.status(201).json({ message: "User Registered and logged in",user: newUser });
  } catch (err) {
    console.log("error:",err)
    await mongooseSession.abortTransaction();
    next(err);
  } finally {
    mongooseSession.endSession();
  }
  }
}