import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv"
dotenv.config()

const s3 = new S3Client({});
console.log(process.env.s3_bucket_name);
export const generateSignedPutUrl = async({ fileName, fileType }) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.s3_bucket_name,
      Key: `uploads/${fileName}`,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3, command, {
      expiresIn: 3600, // URL valid for 60 seconds
    });

    return url;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generating URL" });
  }
}