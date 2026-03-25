import {email, z} from "zod/v4"

export const dirName = z.object({
    newDirName: z.string("Please enter a valid name").min(3,"Name must have 3 letters")
})

export const fileName = z.object({
    newFileName: z.string("Please enter a valid name").min(3,"Name must have 3 letters")
})