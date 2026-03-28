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
        minLength: 4,
    },
    rootDirId: {
        type:String,
        ref: 'Directory'
    },
    profilePic:{
        type: String,
        default: "https://www.bing.com/images/search?view=detailV2&ccid=%2bn6mzk6Q&id=9E95F1A2B7435220E4E70C83A1D6163EAA4C971C&thid=OIP.-n6mzk6Qt5Tu-I3ek1It1gHaHa&mediaurl=https%3a%2f%2fstatic.vecteezy.com%2fsystem%2fresources%2fpreviews%2f036%2f280%2f650%2fnon_2x%2fdefault-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg&exph=980&expw=980&q=empty+profile+pictures&FORM=IRPRST&ck=95F6F1BCF47337C95CE84CC7EAB19609&selectedIndex=0&itb=0"
    },
    role:{
        type: String,
        enum: ["admin","user","manager"],
        default: "user"
    },
    maxSizeAllocated:{
        type: "Number",
        required: true,
        default: 1 * (1024 ** 3)
    }
},{timestamps: true},{
    strict: "throw",
})

const User = model("User",UserSchema)

export default User