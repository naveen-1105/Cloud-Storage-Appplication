import { ObjectId } from 'mongodb';


async function CheckAuth(req, res, next){
  const db = req.db;
  const {uid} = req.cookies;
  if (!uid) {
      return res.status(401).json({error: "Not logged in"});
  }
  try {
      const user = await db.collection('users').findOne({_id: new ObjectId(String(uid))});
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