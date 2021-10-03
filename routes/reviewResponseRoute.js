const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");

const { upload } = require("../utils/upload");

router.get("/reviewResponse", auth, async (req, res) => {
  const { user } = req;
  try {
    const currentReviewResponse = await prisma.reviewResponse.findMany({
      where: {
        requestMessage: { userId: user.id },
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

router.post("/reviewResponse", async (req, res) => {
  const { files, body } = req;
  const { data, size } = files.fileName;
  const { whatYouDo, customerName, reviewRequestId } = body;
  const name = new Date().toISOString();
  const s3FileName = `${reviewRequestId}/${name}`;
  try {
    await upload(s3FileName, data);

    const currentReviewResponse = await prisma.reviewResponse.create({
      data: {
        customerName,
        whatYouDo,
        size,
        videoUrl: s3FileName + ".mp4",
        imageUrl: s3FileName + ".jpg",
        requestMessageId: reviewRequestId,
      },
    });

    res.send(currentReviewResponse);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

router.put("/reviewResponse/:id", async (req, res) => {
  console.log("inside review Response");
  const { body, params, files } = req;
  let dataTosend = { ...body };
  console.log("data to send", dataTosend);
  try {
    if (files && files.fileName) {
      const { data, size } = files.fileName;
      const { whatYouDo, customerName, reviewRequestId } = body;
      const name = new Date().toISOString();
      const s3FileName = `${reviewRequestId}/${name}`;
      await upload(s3FileName, data);
      dataTosend = {
        ...dataTosend,
        customerName,
        whatYouDo,
        size,
        videoUrl: s3FileName + ".mp4",
        imageUrl: s3FileName + ".jpg",
        isRead: false,
      };
    }
    const removeFields = ({ reviewRequestId, ...rest }) => rest;
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
