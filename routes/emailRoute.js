const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");
const { sendEmail } = require("../utils/sendEmail");

router.post("/sendMail", auth, async (req, res) => {
  try {
    const { user } = req;
    const { subject, sendTo, reviewRequestId } = req.body;

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

      const email = await prisma.emailTracker.create({
        data: {
          reviewResponseId: reviewResponse.id,
          reviewRequestId: reviewRequestId,
          emailId: sender.email,
          customerName: sender.customerName,
          subject: subject,
          status: false,
        },
      });
      const mailOptions = {
        from: `no-reply@reviewreels.app`,
        to: sender.email,
        subject: subject,
      };
      const templateValues = {
        askMessage: reviewRequest.askMessage,
        reviewRequestUrl: `${process.env.WEB_APP_URL}view/${user.username}/${reviewResponse.id}`,
        imageUrl: `${process.env.S3_URL}${reviewRequest.imageUrl}`,
      };
      await sendEmail("/template.hbs", mailOptions, templateValues);
      await prisma.emailTracker.update({
        where: {
          id: email.id,
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

router.post("/reSendMail", auth, async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.body;

    const email = await prisma.emailTracker.findUnique({
      where: {
        id: id,
      },
    });
    if (email) {
      const reviewRequest = await prisma.reviewRequest.findUnique({
        where: {
          id: email.reviewRequestId,
        },
      });
      const reviewResponse = await prisma.reviewResponse.findUnique({
        where: {
          id: email.reviewResponseId,
        },
      });
      console.log(reviewRequest, reviewResponse);
      const mailOptions = {
        from: `no-reply@reviewreels.app`,
        to: email.emailId,
        subject: email.subject,
      };
      const templateValues = {
        askMessage: reviewRequest.askMessage,
        reviewRequestUrl: `${process.env.WEB_APP_URL}view/${user.username}/${reviewResponse.id}`,
        imageUrl: `${process.env.S3_URL}${reviewResponse.imageUrl}`,
      };
      await sendEmail("/template.hbs", mailOptions, templateValues);
      await prisma.emailTracker.update({
        where: {
          id: id,
        },
        data: {
          status: true,
        },
      });
      res.send({ message: "Emails Send" });
    } else {
      console.log("Error", "Email entry does'nt exist");
      res.send({ message: "Some Error occured" });
    }
  } catch (err) {
    console.log("Error", err);
    res.send({ message: "Some Error occured", err });
  }
});

module.exports = router;
