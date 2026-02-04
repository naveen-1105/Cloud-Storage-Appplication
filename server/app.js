import express from "express";
import cors from "cors";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser"
import CheckAuth from "./Middleware/auth.js";
import { connectDB } from "./Middleware/db.js";
import sessionMiddleware from "./Middleware/session.js";

const secretkey = "navwifi13";
try {
  connectDB();

  const app = express();



app.use(express.json());
app.use(cookieParser(secretkey))
app.use(cors(
  {origin: "http://localhost:5173",
    credentials: true
  }
));

app.use("/directory",CheckAuth, directoryRoutes);
app.use("/file",CheckAuth, fileRoutes);
app.use("/user", userRoutes);
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: "Something went wrong!" });
});


app.listen(4000, () => {
  console.log(`Server Started`);
});

} catch (error) {
  console.log(error);
}




