const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");

const { upload } = require("../utils/upload");
const { sendEmail } = require("../utils/sendEmail");

router.get("/reviewResponse", auth, async (req, res) => {
  const { user } = req;
  const { requestId, searchValue } = req.query;

  const extraWhere = requestId ? { requestMessageId: requestId } : {};
  const searchQuery = searchValue
    ? {
        OR: [
          { customerName: { contains: searchValue } },
          { whatYouDo: { contains: searchValue } },
        ],
      }
    : {};
  try {
    const currentReviewResponse = await prisma.reviewResponse.findMany({
      where: {
        requestMessage: { userId: user.id },
        ...extraWhere,
        ...searchQuery,
      },
      include: {
        EmailTracker: true,
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });
    res.send(currentReviewResponse);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

//video Embed without auth
router.get("/embedReviewResponse", async (req, res) => {
  try {
    const { responseId } = req.query;

    const currentReviewResponse = await prisma.reviewResponse.findUnique({
      where: {
        id: responseId,
      },
      include: {
        requestMessage: true,
      },
    });
    res.send(currentReviewResponse);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

router.post("/reviewResponse", async (req, res) => {
  try {
    const { files, body } = req;
    let data = null;
    let size = 0;
    if (files && files.fileName) {
      const { data: fileData, size: fileSize } = files.fileName;
      data = fileData;
      size = fileSize;
    }
    const {
      whatYouDo,
      customerName,
      reviewRequestId,
      extension,
      replyMessage,
    } = body;
    const name = new Date().toISOString();
    const s3FileName = `${reviewRequestId}/${name}`;
    let currentReviewResponse = null;
    if (data) {
      await upload(s3FileName, data, extension);
      currentReviewResponse = await prisma.reviewResponse.create({
        data: {
          customerName,
          whatYouDo,
          size,
          videoUrl: s3FileName + extension,
          imageUrl: s3FileName + ".jpg",
          requestMessageId: reviewRequestId,
        },
      });
    } else {
      currentReviewResponse = await prisma.reviewResponse.create({
        data: {
          customerName,
          replyMessage,
          whatYouDo,
          size,
          videoUrl: "",
          imageUrl: "",
          requestMessageId: reviewRequestId,
        },
      });
    }
    const reviewRequestUserId = await prisma.reviewRequest.findUnique({
      where: { id: reviewRequestId },
      include: {
        user: {
          select: {
            email: true,
            merchantName: true,
          },
        },
      },
    });

    const subject = `You received a new review video from ${customerName} !!!`;
    const mailOptions = {
      from: `no-reply@reviewreels.app`,
      to: reviewRequestUserId.user.email,
      subject: subject,
    };
    const templateValues = {
      merchantName: reviewRequestUserId.user.merchantName,
      responseUserName: customerName,
      imageUrl: `${process.env.S3_URL}${currentReviewResponse.imageUrl}`,
    };
    await sendEmail("/reviewResponseTemplate.hbs", mailOptions, templateValues);

    res.send(currentReviewResponse);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

//for email
router.put("/reviewResponse/:id", async (req, res) => {
  console.log("inside review Response");
  const { body, params, files } = req;
  let dataTosend = { ...body };
  console.log("data to send", dataTosend);
  try {
    if (files && files.fileName) {
      const { data, size } = files.fileName;
      const { whatYouDo, customerName, reviewRequestId, platform } = body;
      const name = new Date().toISOString();
      const s3FileName = `${reviewRequestId}/${name}`;
      await upload(s3FileName, data, platform);
      dataTosend = {
        ...dataTosend,
        customerName,
        whatYouDo,
        size,
        videoUrl: s3FileName + ".mp4",
        imageUrl: s3FileName + ".jpg",
        isRead: false,
      };
      const reviewRequestUserId = await prisma.reviewRequest.findUnique({
        where: { id: reviewRequestId },
        include: {
          user: {
            select: {
              email: true,
              merchantName: true,
            },
          },
        },
      });

      const subject = `You received a new review video from ${customerName} !!!`;
      const mailOptions = {
        from: `no-reply@reviewreels.app`,
        to: reviewRequestUserId.user.email,
        subject: subject,
      };
      const templateValues = {
        merchantName: reviewRequestUserId.user.merchantName,
        responseUserName: customerName,
        imageUrl: `${process.env.S3_URL}${dataTosend.imageUrl}`,
      };
      await sendEmail(
        "/reviewResponseTemplate.hbs",
        mailOptions,
        templateValues
      );
    }
    const removeFields = ({ reviewRequestId, platform, ...rest }) => rest;
    dataTosend = removeFields(dataTosend);
    console.log("data to send", dataTosend);

    const currentReviewResponse = await prisma.reviewResponse.update({
      where: {
        id: params.id,
      },
      data: {
        ...dataTosend,
      },
    });

    res.send(currentReviewResponse);
  } catch (e) {
    console.log("error in review update", e);
    res.status(400).json(e);
  }
});

module.exports = router;
