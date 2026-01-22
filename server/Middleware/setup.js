import { connectDB,client } from "./db.js";
const db = await connectDB();

await db.command({
    collMod: 'users',
    validator:{
  $jsonSchema: {
    bsonType: 'object',
    required: [
      '_id',
      'name',
      'email',
      'password',
      'rootDirId'
    ],
    properties: {
      _id: {
        bsonType: 'objectId'
      },
      name: {
        bsonType: 'string',
        minLength: 3
      },
      email: {
        bsonType: 'string',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'
      },
      password: {
        bsonType: 'string',
        minLength: 4
      },
      rootDirId: {
        bsonType: 'objectId'
      }
    },
    additionalProperties: false
  }
},
validationLevel: "strict",
validationAction: "error"
})

await db.command({
    collMod: 'files',
    validator:{
  $jsonSchema: {
    bsonType: 'object',
    required: [
      '_id',
      'name',
      'extension',
      'userId',
      'parentDirId'
    ],
    properties: {
      _id: {
        bsonType: 'objectId'
      },
      name: {
        bsonType: 'string'
      },
      extension: {
        bsonType: 'string'
      },
      userId: {
        bsonType: 'string'
      },
      parentDirId: {
        bsonType: [
          'string',
          'null'
        ]
      }
    }
  }
},
validationLevel: "strict",
validationAction: "error"
})

await db.command({
    collMod: 'directories',
    validator:{
  $jsonSchema: {
    bsonType: 'object',
    required: [
      '_id',
      'name',
      'userId',
      'parentDirId'
    ],
    properties: {
      _id: {
        bsonType: 'objectId'
      },
      name: {
        bsonType: 'string'
      },
      userId: {
        bsonType: 'string'
      },
      parentDirId: {
        bsonType: [
          'string',
          'null'
        ]
      }
    }
  }
},
validationLevel: "strict",
validationAction: "error"
})

client.close()