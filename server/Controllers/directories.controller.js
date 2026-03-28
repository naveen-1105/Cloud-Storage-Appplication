import { ObjectId } from "mongodb" 
import { rm } from "fs/promises";
import Directory from "../Models/directory.model.js";
import File from "../Models/file.model.js";
import { dirName } from "../validators/nameValidator.js";
import mongoose from "mongoose";

export const getDirectory = async (req, res, next) => {
    try {
        const user = req.user;
        const id = req.params.id || user.rootDirId;

        const directoryData = await Directory
            .findOne({ _id: id }).lean();
        if (!directoryData)
            return res.status(404).json({ message: "Directory not found!" });

        const files = await File.find({ parentDirId: id }).lean();
        const directories = await Directory 
            .find({ parentDirId: id }).lean();

        return res.status(200).json({
            ...directoryData,
            files: files.map((file) => ({ ...file, id: file._id })),
            directories: directories.map((dir) => ({ ...dir, id: dir._id })),
        });
    } catch (err) {
        console.log(err);
        next(err);
    }
};

export const addDirectory = async (req, res, next) => {
  const user = req.user;
  const parentDirId = req.params.parentDirId || user.rootDirId;
  const dirname = req.headers.dirname || "New Folder";
  try {
    const parentDir = await Directory
      .findOne({ _id: parentDirId }).lean();
    if (!parentDir)
      return res
        .status(404)
        .json({ message: "Parent Directory Does not exist!" });

    const dir = await Directory.insertOne({
      name: dirname,
      parentDirId,
      userId: String(user._id),
      path:[],
    });
    
    dir.path.push(parentDirId)
    parentDir.path.forEach(parentDirId => {
      dir.path.push(parentDirId)
    });
    await dir.save()

    return res.status(200).json({ message: "Directory Created!" });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export const renameDir = async (req, res, next) => {
  const { id } = req.params;
  const {success, data, error} = dirName.safeParse(req.body);
    
    if(!success){
      return res.status(400).json(error.issues[0].message)
    }
  const { newDirName } = data;
  try {
    const dirData = await Directory.find({_id: id}).lean();
  if (!dirData) res.status(404).json({ message: "Directory not found!" });
    await Directory.updateOne({_id: id},{name: newDirName});
    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
}

export const deleteDir = async (req, res, next) => {
  
  try {
    const { id } = req.params;
    const directory = await Directory.findOne({_id: id})

  async function getDirectoryContents(id){
    // console.log(new ObjectId(id));
    var files = await File.find({parentDirId: id}).lean();
    // console.log(files);
    var directories =await Directory.find({parentDirId: id}).lean();
    
    for (const {_id} of directories) {
      const {files : childFiles,directories : childDirectories} = await getDirectoryContents(_id.toString());

      files = [...files,...childFiles];
      directories = [...directories,...childDirectories];
    }
    return {directories,files}
  }
    const {files , directories} = await getDirectoryContents(id)
    console.log(files);
    for(const {_id,extension} of files){
      await rm(`${import.meta.dirname}/../storage/${_id.toString()}${extension}`)
    }
    let newParentDirId = directory.parentDirId;
    while(newParentDirId){
      const newParentDir = await Directory.findOne({_id: newParentDirId})
      newParentDir.size -= directory.size;
      await newParentDir.save()
      newParentDirId = newParentDir.parentDirId
    }
    await File.deleteMany({_id: {$in : files.map(({_id}) => _id) }})
    await Directory.deleteMany({_id: {$in : [...directories.map(({_id}) => _id),new ObjectId(id)] }})
    return res.json({message: 'Files deleted successfully'})
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export const getBreadcrumbs = async(req,res,next) => {
  const {id} = req.params;
  console.log(id);
  let breadcrumbs = []
  try {
    const directory = await Directory.findOne({_id :id})
  
    breadcrumbs = await Directory.find({_id: {$in: directory.path}}).select("_id name")
    return res.status(200).json(breadcrumbs)
  } catch (error) {
    console.log(error);
  }
}
