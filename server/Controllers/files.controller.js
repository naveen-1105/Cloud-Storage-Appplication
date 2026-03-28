import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";

import { ObjectId } from "mongodb";
import File from "../Models/file.model.js";
import Directory from "../Models/directory.model.js";
import { fileName } from "../validators/nameValidator.js";

export const addFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  const parentDir = await Directory.findOne({_id: parentDirId})
  const filename = req.headers.filename || "untitled";
  const filesize = req.headers.filesize;
  if(filesize > 50 * 1024 * 1024){
    return res.status(413).json({message: "File size is too big"})
  }

  const extension = path.extname(filename);
  console.log(filename);

  try {
    // Insert file metadata first
    const fileData = await File.insertOne({
      extension,
      name: filename,
      size: filesize,
      parentDirId,
      userId: String(req.user._id),
    });
    const id = fileData._id;
    const fullFileName = `${id}${extension}`;
    const filePath = `${import.meta.dirname}/../storage/${fullFileName}`
    const writeStream = createWriteStream(filePath);

    let totalFileLength = 0;
    let abort = false;
    req.on("data",async(chunk) => {
      if(abort == true) return;
        totalFileLength += chunk.length
        if(totalFileLength > filesize){
          abort = true;
          writeStream.close()
          await rm(filePath)
          fileData.deleteOne()
          return req.destroy()
        }
        writeStream.write(chunk)
    })

    req.on("end", async () => {
      parentDir.size += totalFileLength;
      await parentDir.save();
      let newParentDirId = parentDir.parentDirId
      console.log("newParentDirId: ",parentDirId);
      while(newParentDirId){
        const newParentDir = await Directory.findOne({_id: newParentDirId})
        console.log(newParentDir);
        newParentDir.size += totalFileLength;
        await newParentDir.save()
        newParentDirId = newParentDir.parentDirId
      }
      return res.status(201).json({ message: "File Uploaded" });
    });
    req.on("error", async () => {
      await File.deleteOne({ _id: id });
    });

    writeStream.on("error", (err) => {
      console.log(err);
      next(err);
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const getFileById = async (req, res) => {
  const { id } = req.params;
  try {
    const fileData = await File.findOne({ _id: id });

    if (!fileData) {
      return res.status(404).json({ message: "File Not Found!" });
    }

    const parentDirId = fileData.parentDirId;

    const parentDir = await Directory.findOne({ _id: parentDirId });

    if (parentDir.userId !== String(req.user._id)) {
      return res
        .status(401)
        .json({ message: "File cannot be seen because you are not the owner" });
    }

    if (req.query.action === "download") {
      res.set("Content-Disposition", `attachment; filename=${fileData.name}`);
    }
    console.log(process.cwd());
    return res.sendFile(
      `${import.meta.dirname}/../storage/${id}${fileData.extension}`,
      (err) => {
        if (!res.headersSent && err) {
          return res.status(404).json({ error: "File not found!" });
        }
      },
    );
  } catch (error) {
    console.log(error);
  }
};

export const renameFile = async (req, res, next) => {
  const { id } = req.params;


  try {
    const fileData = await File.findOne({ _id: id, userId: req.user._id });
    const parentDirId = fileData.parentDirId;
    const parentDir = await Directory.find({ _id: parentDirId });
    if (parentDir.userId !== req.user.id) {
      return res.status(401).json({
        message: "File cannot be renamed because you are not the owner",
      });
    }
    const {success, data, error} = fileName.safeParse(req.body);
        
        if(!success){
          return res.status(400).json(error.issues[0].message)
        }
      const { newFilename } = data;
    fileData.name = newFilename
    await fileData.save();
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;
  try {
    const fileData = await File.findOne({
      _id: new ObjectId(id),
      userId: req.user._id,
    });
    if (!fileData) {
      return res.status(404).json({ message: "File Not Found!" });
    }
    const parentDirId = fileData.parentDirId;
    const parentDir = await Directory.findOne({
      _id: new ObjectId(parentDirId),
    });
    if (parentDir.userId !== String(req.user._id)) {
      return res
        .status(401)
        .json({ message: "File cannot be seen because you are not the owner" });
    }
    parentDir.size -= fileData.size;
    await parentDir.save();
    let newParentDirId = parentDir.parentDirId
    console.log("newParentDirId: ",parentDirId);
    while(newParentDirId){
      const newParentDir = await Directory.findOne({_id: newParentDirId})
      console.log(newParentDir);
      newParentDir.size -= fileData.size;
      await newParentDir.save()
      newParentDirId = newParentDir.parentDirId
    }
    await rm(`${import.meta.dirname}/../storage/${id}${fileData.extension}`);
    await File.deleteOne({ _id: new ObjectId(id) });
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    console.log("error:", err);
    next(err);
  }
};
