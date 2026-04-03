import { model, Schema } from "mongoose";
import { boolean } from "zod/v4";

const FileSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
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
    },
    isUploading: {
        type: boolean,
    }
},
{
    timestamps: true
},{
    strict: "throw",
})

const File = model("File",FileSchema)

export default File