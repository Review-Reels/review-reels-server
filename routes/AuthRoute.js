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
    const salt = await bcrypt.genSalt(10);
    userObj.password = await bcrypt.hash(userObj.password, salt);
    userData = { ...userObj };
    const user = await prisma.user.create({ data: userData });
    const removeFields = ({ password, ...rest }) => rest;
    res.json(removeFields(user));
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
      if (bcrypt.compare(signIn.password, user.password)) {
        //create and assign a token
        const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET, {
          expiresIn: "7d",
        });
        const removeFields = ({ password, ...rest }) => rest;

        res.json({ Authorization: token, ...removeFields(user) });
      } else res.json({ message: "Password wrong" });
    } else res.json({ message: "User does not exist" });
  } catch (e) {
    console.log(e);
    res.json({ message: "Something went wrong! Please try again later" });
  }
});

// google sign up route
router.post("/google_sign_in", async (req, res) => {
  const userObj = req.body;
  try {
    const verifiedUser = await verifyAndGetUser(userObj.idToken);
    console.log(verifiedUser);
    if (verifiedUser) {
      const userData = {
        ...verifiedUser,
        username: "",
        authType: "google",
      };
      let user = await prisma.user.findUnique({
        where: { email: verifiedUser.email },
      });
      if (!user) {
        user = await prisma.user.create({ data: userData });
      }
      const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET, {
        expiresIn: "7d",
      });
      const removeFields = ({ password, ...rest }) => rest;
      res.json({
        Authorization: token,
        ...removeFields({ ...userData, ...user }),
      });
    } else {
      res.json({ message: "Cannot verify user" });
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
