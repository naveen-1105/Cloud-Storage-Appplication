import { v4 as uuidv4 } from "uuid";
import { Session } from "../Models/session.model.js";

const SESSION_TTL_DAYS = 30;

const sessionMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Read sessionId from cookie
    let sessionId = req.cookies?.sessionId;
    
    // 2️⃣ If no sessionId → create new session
    if (!sessionId) {
      sessionId = uuidv4();

      await Session.create({
        sessionId,
        userId: null,
        isGuest: true,
        lastSeen: new Date(),
        expiresAt: new Date(
          Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
        ),
      });

      // 3️⃣ Send cookie to browser
      res.cookie("sessionId", sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
      });
    } 
    // 4️⃣ SessionId exists → update lastSeen
    else {
      const session = await Session.findOne({ sessionId });

      // If cookie exists but DB session is missing (expired/deleted)
      if (!session) {
        sessionId = uuidv4();

        await Session.create({
          sessionId,
          userId: null,
          isGuest: true,
          lastSeen: new Date(),
          expiresAt: new Date(
            Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
          ),
        });

        res.cookie("sessionId", sessionId, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
        });
      } else {
        // Update activity timestamp
        session.lastSeen = new Date();
        await session.save();
      }
    }

    // 5️⃣ Attach sessionId to request for later use
    req.sessionId = sessionId;

    next();
  } catch (error) {
    console.error("Session middleware error:", error);
    next(error);
  }
};

export default sessionMiddleware;
