import { ObjectId } from "mongodb";
import User from "../Models/users.model.js";
import { Session } from "../Models/session.model.js";

async function CheckAuth(req, res, next) {
  const { sid } = req.signedCookies;
  //   console.log("sid",sid);
  if (!sid) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const session = await Session.findOne({ _id: sid });

    if (!session) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const user = await User.findOne({ _id: session.userId });
    if (!user) {
      return res.status(401).json({ error: "Not logged in" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default CheckAuth;
