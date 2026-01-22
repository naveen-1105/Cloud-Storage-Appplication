import { ObjectId } from "mongodb";
import { client } from "../Middleware/db.js";

export const registerUser = async (req, res, next) => {
  const db = req.db;
  const { name, email, password } = req.body;

  // const foundUser = db.collection('users').findOne({email})
  // console.log(foundUser);
  // if(foundUser) {
  //   return res.status(409).json({
  //     error: "User already exists",
  //     message: "A user with this email address already exists. Please try logging in or use a different email."
  //   })
  // }

  const userId = new ObjectId();
  const rootDirId = new ObjectId();
  const session = client.startSession();
  try {
    await db.collection("directories").insertOne(
      {
        _id: rootDirId,
        name: `root-${email}`,
        parentDirId: null,
        userId,
      },
      { session }
    );

    await db.collection("users").insertOne(
      {
        _id: userId,
        name,
        email,
        password,
        rootDirId,
      },
      { session }
    );
    session.commitTransaction();
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    console.log(err.message);
    session.abortTransaction();
    next(err);
  }
}

export const userLogin = async (req, res, next) => {
  const db = req.db;
  const { email, password } = req.body;
  const user = await db.collection("users").findOne({ email, password });
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