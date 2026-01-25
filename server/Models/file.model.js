import { model, Schema } from "mongoose";

const FileSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    extension: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    parentDirId: {
        type:String,
        ref: 'Directory'
    }
},{
    strict: "throw",
})

const File = model("File",FileSchema)

export default File