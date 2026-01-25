import { model, Schema } from "mongoose";

const directorySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    parentDirId: {
        type:String,
        default: null,
        ref: 'Directory'
    }
},{
    strict: "throw",
})

const Directory = model("Directory",directorySchema)

export default Directory