const baseUrl = "http://localhost:4000"

export const loginWithGoogle = async(idToken) => {
    const response = await fetch(`${baseUrl}/auth/login-with-google`,{
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
        credentials: "include"
    })
    const data = await response.json()
    return data
}