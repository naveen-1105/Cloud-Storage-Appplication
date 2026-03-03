
export async function AuthorizeRole(req,res,next){
    const user = req.user;
    if(user.role != "user"){
        next()
    }else{
        return res.status(403).json({message : "You are not authorized to see all the users in aour application"})
    }
}