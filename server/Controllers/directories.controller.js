import { ObjectId } from "mongodb";
import { rm } from "fs/promises";
import Directory from "../Models/directory.model.js";
import File from "../Models/file.model.js";

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
    });

    return res.status(200).json({ message: "Directory Created!" });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export const renameDir = async (req, res, next) => {
  const { id } = req.params;
  const { newDirName } = req.body;
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
    const user = req.user;
  const { id } = req.params;
    // const filesCollection =await File
  // console.log(filesCollection);
  // const dirCollection =await db.collection('directories')

  async function getDirectoryContents(id){
    // console.log(new ObjectId(id));
    var files = await File.find({parentDirId: id}).select("_id").lean();
    // console.log(files);
    var directories =await Directory.find({parentDirId: id}).select("_id").lean();
    
    for (const {_id,name} of directories) {
      const {files : childFiles,directories : childDirectories} = await getDirectoryContents(_id.toString());

      files = [...files,...childFiles];
      directories = [...directories,...childDirectories];
    }
    return {directories,files}
  }
    const {files , directories} = await getDirectoryContents(id)
    for(const {_id,extension} of files){
      await rm(`./storage/${_id.toString()}${extension}`)
    }
    await File.deleteMany({_id: {$in : files.map(({_id}) => _id) }})
    await Directory.deleteMany({_id: {$in : [...directories.map(({_id}) => _id),new ObjectId(id)] }})
    return res.json({message: 'Files deleted successfully'})
  } catch (err) {
    console.log(err);
    next(err);
  }
}
