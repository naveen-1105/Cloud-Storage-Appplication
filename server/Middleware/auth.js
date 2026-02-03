import { ObjectId } from 'mongodb';
import User from '../Models/users.model.js';


async function CheckAuth(req, res, next){
  const {token} = req.signedCookies;
//   console.log("token",token);
  if (!token) {
      return res.status(401).json({error: "Not logged in"});
  }

  const {uid,expiry} = JSON.parse(Buffer.from(token,'base64url').toString())
  try {
      const user = await User.findOne({_id: new ObjectId(String(uid))});
      if (!user) {
          return res.status(401).json({error: "Not logged in"});
      }
      req.user = user;
      next();
  } catch (error) {
      console.log(error);
      return res.status(500).json({error: "Internal server error"});
  }
}

export default CheckAuth