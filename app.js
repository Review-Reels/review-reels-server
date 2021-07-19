const express = require("express");
const app = express();
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const cors = require("cors");
// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

//add other middleware
app.use(cors());
dotenv.config();
app.use(express.json());

//import routes
const authRoute = require("./routes/AuthRoute");
const userRoute = require("./routes/UserRoute");
const reviewRequestRoute = require("./routes/reviewRequestRoute");
const reviewResponseRoute = require("./routes/reviewResponseRoute");

//route middleware
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/review", reviewRequestRoute);
app.use("/api/review", reviewResponseRoute);

app.listen(process.env.PORT, () => console.log("Server Started!"));
