import {email, z} from "zod/v4"

export const loginSchema = z.object({
    email: z.email("please enter a valid mail"),
    password: z.string(),
})

export const registerSchema = loginSchema.extend({
    name: z.string().min(3),
})

export const otpSenderSchema = z.object({
    email: z.email("please enter a valid mail")
})

export const otpVerifierSchema = otpSenderSchema.extend({
    otp: z.string("please enter a valid 4 digit otp")
})

