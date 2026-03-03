import {OAuth2Client} from "google-auth-library"

const clientId = "1080300698393-bi6pips0agn48q204jcksijvpkmejgk5.apps.googleusercontent.com"

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