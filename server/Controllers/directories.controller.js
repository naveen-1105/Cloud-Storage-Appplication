import { ObjectId } from "mongodb";
import { rm } from "fs/promises";

export const getDirectory = async (req, res, next) => {
    try {
        const db = req.db;
        const user = req.user;
        const id = req.params.id || user.rootDirId;

        const directoryData = await db
            .collection("directories")
            .findOne({ _id: new ObjectId(id) });
        if (!directoryData)
            return res.status(404).json({ message: "Directory not found!" });

        const files = await db.collection("files").find({ parentDirId: id }).toArray();
        const directories = await db
            .collection("directories")
            .find({ parentDirId: id }).toArray();

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
  const db = req.db;
  const parentDirId = req.params.parentDirId || user.rootDirId;
  const dirname = req.headers.dirname || "New Folder";
  try {
    const parentDir = await db
      .collection("directories")
      .findOne({ _id: new ObjectId(parentDirId) });
    if (!parentDir)
      return res
        .status(404)
        .json({ message: "Parent Directory Does not exist!" });

    const dir = await db.collection("directories").insertOne({
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
  const db = req.db;
  const { newDirName } = req.body;
  try {
    const dirData = await db.collection('directories').find({_id: new ObjectId(id)});
  if (!dirData) res.status(404).json({ message: "Directory not found!" });
    await db.collection('directories').updateOne({_id: new ObjectId(id)},{$set: {name: newDirName}});
    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
}

export const deleteDir = async (req, res, next) => {
  
  try {
    const user = req.user;
  const { id } = req.params;
  const db = req.db;
    const filesCollection =await db.collection('files')
  // console.log(filesCollection);
  const dirCollection =await db.collection('directories')

  async function getDirectoryContents(id){
    // console.log(new ObjectId(id));
    var files = await filesCollection.find({parentDirId: id},{projection: {_id: 1, extension: 1}}).toArray();
    // console.log(files);
    var directories =await dirCollection.find({parentDirId: id},{projection: {_id: 1}}).toArray();
    
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
    await filesCollection.deleteMany({_id: {$in : files.map(({_id}) => _id) }})
    await dirCollection.deleteMany({_id: {$in : [...directories.map(({_id}) => _id),new ObjectId(id)] }})
    return res.json({message: 'Files deleted successfully'})
  } catch (err) {
    console.log(err);
    next(err);
  }
}
