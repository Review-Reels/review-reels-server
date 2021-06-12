const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
app.use(express.json());

//import routes
const authRoute = require("./routes/AuthRoute");

//route middleware
app.use("/api/user", authRoute);

app.listen(3000, () => console.log("Server Started!"));
