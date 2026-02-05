import mongoose, { model } from 'mongoose'

const otpSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        unique:true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600,
    }
})

const Otp = model("Otp",otpSchema)
export default Otp