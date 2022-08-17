const router = require("express").Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const verifyAndGetUser = require("../googleAuth/googleAuth");
const { nanoid } = require("nanoid");
const { sendEmail } = require("../utils/sendEmail");
const prisma = new PrismaClient();
//sign in route
router.post("/signup", async (req, res) => {
  let userObj = req.body;
  let userData = {};
  try {
    const salt = await bcrypt.genSalt(10);
    userObj.password = await bcrypt.hash(userObj.password, salt);
    userData = { ...userObj };
    const emailVerifyHash = nanoid();
    const user = await prisma.user.create({
      data: { ...userData, emailVerifyHash },
    });
    const removeFields = ({ password, ...rest }) => rest;

    const subject = `Review Reels email verify link ${userObj.merchantName}`;
    const mailOptions = {
      from: `no-reply@reviewreels.app`,
      to: userObj.email,
      subject: subject,
    };
    const templateValues = {
      merchantName: userObj.merchantName,
      emailVerifyLink: `${process.env.WEB_APP_URL}verify/${userData.email}/${emailVerifyHash}`,
    };
    await sendEmail("/emailVerify.hbs", mailOptions, templateValues);
    res.json(removeFields(user));
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: e.meta.target });
  }
});

router.post("/verifyEmail", async (req, res) => {
  const { email, verifyHash } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (user) {
      if (verifyHash === user.emailVerifyHash) {
        await prisma.user.update({
          where: { email: email },
          data: {
            emailVerified: true,
          },
        });
        res.json({ message: "Verified" });
      } else
        res.status(400).json({
          message: "Cannot verify please generate a new verify email",
        });
    } else res.status(400).json({ message: "This link is expired" });
  } catch (e) {
    console.log(e);
    res
      .status(400)
      .json({ message: "Something went wrong! Please try again later" });
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
      if (await bcrypt.compare(signIn.password, user.password)) {
        //create and assign a token
        const token = jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET, {
          expiresIn: "7d",
        });
        const removeFields = ({ password, ...rest }) => rest;

        res.json({ Authorization: token, ...removeFields(user) });
      } else res.status(400).json({ message: "Password wrong" });
    } else res.status(400).json({ message: "User does not exist" });
  } catch (e) {
    console.log(e);
    res
      .status(400)
      .json({ message: "Something went wrong! Please try again later" });
  }
});

// google sign up route
router.post("/google_sign_in", async (req, res) => {
  const userObj = req.body;
  try {
    const verifiedUser = await verifyAndGetUser(userObj.idToken);

    if (verifiedUser) {
      const removeFieldsNbf = ({ nbf, ...rest }) => rest;
      const userData = {
        ...removeFieldsNbf({ ...verifiedUser }),
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
  } catch (error) {
    console.log(error, "google_sign_in");
    res.json({ message: "Something went wrong!" });
  }
});

module.exports = router;
