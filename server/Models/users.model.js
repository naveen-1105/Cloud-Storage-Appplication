import { model, Schema } from "mongoose";

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 4,
    },
    rootDirId: {
        type:String,
        ref: 'Directory'
    }
},{
    strict: "throw",
})

const User = model("User",UserSchema)

export default User