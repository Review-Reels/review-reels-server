const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");

const emailTemplateSource = fs.readFileSync(
  path.join(__dirname, "/template.hbs"),
  "utf8"
);

const mailgunAuth = {
  auth: {
    api_key: process.env.MAIL_GUN_API_KEY,
    domain: process.env.MAIL_GUN_DOMAIN,
  },
};

router.post("/sendMail", auth, async (req, res) => {
  const { subject, sendTo } = req.body;
  const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));

  const template = handlebars.compile(emailTemplateSource);

  const htmlToSend = template({ message: "Hello!" });

  const mailOptions = {
    from: "requests@reviewreels.app",
    to: sendTo,
    subject: subject,
    html: htmlToSend,
  };

  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
      res.send({ message: error });
    } else {
      console.log("Successfully sent email.");
      res.send({ message: "successfully send email" });
    }
  });
});

module.exports = router;
