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
  const { user } = req;
  const { subject, sendTo, reviewRequestId } = req.body;
  const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));

  const template = handlebars.compile(emailTemplateSource);
  console.log(user);
  try {
    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: {
        id: reviewRequestId,
      },
    });

    let mailsToSend = [];
    sendTo.map(async (sender) => {
      const htmlToSend = template({
        askMessage: reviewRequest.askMessage,
        reviewRequestUrl: `${process.env.WEB_APP_URL}${user.username}`,
        imageUrl: `${process.env.S3_URL}${reviewRequest.imageUrl}`,
      });

      const mailOptions = {
        from: "requests@reviewreels.app",
        to: sender,
        subject: subject,
        html: htmlToSend,
      };
      mailsToSend.push(smtpTransport.sendMail(mailOptions));
    });

    Promise.allSettled(mailsToSend).then((results) => {
      let sendMails = [];
      let errorMails = [];
      results.forEach((result, num) => {
        if (result.status == "fulfilled") {
          sendMails.push(sendTo[num]);
        }
        if (result.status == "rejected") {
          errorMails.push(sendTo[num]);
        }
      });
      res.send({ message: "send email", sendMails, errorMails });
    });
  } catch (err) {
    res.send({ message: "Some Error occured", err });
  }
});

module.exports = router;
