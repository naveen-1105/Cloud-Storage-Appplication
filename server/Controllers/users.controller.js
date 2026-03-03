import { ObjectId } from "mongodb";
import User from "../Models/users.model.js";
import { rm } from "fs/promises";
import { Session } from "../Models/session.model.js";
import File from "../Models/file.model.js";
import Directory from "../Models/directory.model.js";
import mongoose from "mongoose";

export const getUser = (req, res) => {
  
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
    picture: req.user.profilePic,
    role: req.user.role
  });
};

export const getAllUser = async(req,res,next) => {
  try {
    const allUsers = await User.find().select("_id name email").lean();
    const allSession = await Session.find().lean()
    const allSesssionUserId = allSession.map(({userId}) => userId.toString());

    const sessionSet = new Set(allSesssionUserId);

    const transformedAllUsers = allUsers.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      isLoggedIn: sessionSet.has(user._id.toString())
    }))
    res.status(200).json({users : transformedAllUsers})
  } catch (error) {
    console.log(error);
    next()
  };
}

export const logoutUser = async(req,res,next) => {
  const {id} = req.params
  await Session.deleteMany({userId: id})
  res.status(201).json({message: "user logged out from all devices"})
}

export const deleteUser = async(req,res,next) => {
  const {id} = req.params
  const rootDir = await Directory.findOne({userId: id, parentDirId: null})
  async function getDirectoryContents(dirId){
      var files = await File.find({parentDirId: dirId}).select("_id extension").lean();
      var directories =await Directory.find({parentDirId: dirId}).select("_id").lean();
      
      for (const {_id,name} of directories) {
        const {files : childFiles,directories : childDirectories} = await getDirectoryContents(_id.toString());
  
        files = [...files,...childFiles];
        directories = [...directories,...childDirectories];
      }
      return {directories,files}
    }

      const {files , directories} = await getDirectoryContents(rootDir._id)
      console.log(files);
      console.log(directories);
      for(const {_id,extension} of files){
        await rm(`./storage/${_id.toString()}${extension}`)
      }
      const session =await mongoose.startSession();
      try {
        session.startTransaction()
        await File.deleteMany({_id: {$in : files.map(({_id}) => _id) }})
        await Directory.deleteMany({_id: {$in : [...directories.map(({_id}) => _id),new ObjectId(rootDir._id)] }})
        await Session.deleteMany({userId: id})
        await User.deleteOne({_id: id})
        await session.commitTransaction()
        return res.json({message: 'user deleted successfully'})
      } catch (error) {
        console.log(error);
        await session.abortTransaction()
      }1
}
