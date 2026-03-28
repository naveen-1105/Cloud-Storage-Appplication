import { connectDB } from "../Middleware/db.js";
import mongoose from "mongoose";

await connectDB();
const client = mongoose.connection.getClient();
try {
  const db = mongoose.connection.db;

  await db.command({
    collMod: "users",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "name", "email", "rootDirId", "role","maxSizeAllocated"],
        properties: {
          _id: { bsonType: "objectId" },
          name: { bsonType: "string", minLength: 3 },
          email: {
            bsonType: "string",
            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
          },
          password: { bsonType: "string", minLength: 4 },
          profilePic: { bsonType: "string" },
          rootDirId: { bsonType: "string" },
          role: { bsonType: "string" },
          maxSizeAllocated:{bsonType: "long"}
        },
        additionalProperties: true,
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  });

  await db.command({
    collMod: "files",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "name", "extension", "userId", "parentDirId","size"],
        properties: {
          _id: { bsonType: "objectId" },
          name: { bsonType: "string" },
          size: {bsonType: "int"},
          extension: { bsonType: "string" },
          userId: { bsonType: "string" },
          parentDirId: { bsonType: ["string", "null"] },
        },
        additionalProperties: true,
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  });

  await db.command({
    collMod: "directories",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "name", "userId", "parentDirId","size","path"],
        properties: {
          _id: { bsonType: "objectId" },
          name: { bsonType: "string" },
          userId: { bsonType: "string" },
          parentDirId: { bsonType: ["string", "null"] },
          size: { bsonType: "int" },
          path: {bsonType: "array"}
        },
        additionalProperties: true,
      },
    },
    validationLevel: "strict",
    validationAction: "error",
  });

  client.close();
} catch (error) {
  console.error(error);
}
