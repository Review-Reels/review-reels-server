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
  try {
    const { user } = req;
    const { subject, sendTo, reviewRequestId } = req.body;
    const smtpTransport = nodemailer.createTransport(mg(mailgunAuth));

    const template = handlebars.compile(emailTemplateSource);

    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: {
        id: reviewRequestId,
      },
    });

    sendTo.map(async (sender) => {
      const reviewResponse = await prisma.reviewResponse.create({
        data: {
          customerName: "",
          whatYouDo: "",
          size: 0,
          videoUrl: "",
          imageUrl: "",
          requestMessageId: reviewRequestId,
        },
      });

      const emailTracker = await prisma.emailTracker.create({
        data: {
          reviewResponseId: reviewResponse.id,
          reviewRequestId: reviewRequestId,
          emailId: sender.email,
          customerName: sender.customerName,
          status: false,
        },
      });

      const htmlToSend = template({
        askMessage: reviewRequest.askMessage,
        reviewRequestUrl: `${process.env.WEB_APP_URL}${user.username}/${reviewResponse.id}`,
        imageUrl: `${process.env.S3_URL}${reviewRequest.imageUrl}`,
      });

      const mailOptions = {
        from: `${user.username}@reviewreels.app`,
        to: sender.email,
        subject: subject,
        html: htmlToSend,
      };
      await smtpTransport.sendMail(mailOptions);
      await prisma.emailTracker.update({
        where: {
          id: emailTracker.id,
        },
        data: {
          status: true,
        },
      });
      res.send({ message: "Emails Send" });
    });
  } catch (err) {
    console.log("Error", err);
    res.send({ message: "Some Error occured", err });
  }
});

module.exports = router;
