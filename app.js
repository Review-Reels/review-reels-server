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
const uploadRoute = require("./routes/uploadVideoRoute");
//route middleware
app.use("/api/user", authRoute);
app.use("/api/upload", uploadRoute);

app.listen(3000, () => console.log("Server Started!"));
