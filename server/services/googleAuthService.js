import {OAuth2Client} from "google-auth-library"
import dotenv from 'dotenv'
dotenv.config()

console.log(process.env.client_id);
const clientId = process.env.client_id

const client = new OAuth2Client({
    clientId,
})

export async function verifyIdToken(idToken){
    const loginTicket = await client.verifyIdToken({
        idToken,
        audience: clientId
    })

    const userData = loginTicket.getPayload();
    return userData;
}