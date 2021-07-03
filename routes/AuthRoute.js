const router = require("express").Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const verifyAndGetUser = require("../googleAuth/googleAuth");
const prisma = new PrismaClient();
//sign in route
router.post("/signup", async (req, res) => {
  let userObj = req.body;
  let userData = {};
  try {
    if (userObj?.authType !== "google") {
      const salt = await bcrypt.genSalt(10);
      userObj.password = await bcrypt.hash(userObj.password, salt);
      userData = { ...userObj };
    } else {
      const verifiedUser = await verifyAndGetUser(userObj.idToken);
      if (verifiedUser)
        userData = {
          ...verifiedUser,
          username: userObj.username,
          authType: userObj.authType,
        };
    }
    const user = await prisma.user.create({ data: userData });

    res.json(user);
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: e.meta.target });
  }
});

//sign up route
router.post("/signin", async (req, res) => {
  const signIn = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: signIn.email },
    });
    if (user) {
      if (signIn?.authType !== "google") {
        if (bcrypt.compare(signIn.password, user.password)) {
          //create and assign a token
          const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET, {
            expiresIn: "7d",
          });
          const removeFields = ({ password, ...rest }) => rest;

          res.json({ Authorization: token, ...removeFields(user) });
        } else res.json({ message: "Password wrong" });
      } else {
        const verifiedUser = await verifyAndGetUser(signIn.idToken);
        if (verifiedUser) {
          const userData = {
            ...verifiedUser,
            username: user.username,
          };
          const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET, {
            expiresIn: "7d",
          });
          res.json({ Authorization: token, ...userData });
        } else {
          res.json({ message: "Cannot verify User" });
        }
      }
    } else res.json({ message: "User does not exist" });
  } catch (e) {
    console.log(e);
    res.json({ message: "Something went wrong! Please try again later" });
  }
});

module.exports = router;
