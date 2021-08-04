const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");
const { uploadToS3 } = require("../s3");
const {
  createThumbNail,
  removeLocalFile,
} = require("../utils/createThumbNail");
const fs = require("fs");

router.get("/reviewResponse", auth, async (req, res) => {
  const { user } = req;
  try {
    const currentReviewResponse = await prisma.reviewResponse.findMany({
      where: {
        requestMessage: { userId: user.id },
      },
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
    const uploadResponse = await uploadToS3(s3FileName, data, ".mp4");
    const thumbNailPath = await createThumbNail(uploadResponse);
    const fileStream = fs.createReadStream(thumbNailPath);

    await uploadToS3(s3FileName, fileStream, ".jpg");
    removeLocalFile(thumbNailPath);

    const currentReviewResponse = await prisma.reviewResponse.create({
      data: {
        customerName,
        whatYouDo,
        size,
        videoUrl: s3FileName + ".mp4",
        requestMessageId: reviewRequestId,
      },
    });

    res.send(currentReviewResponse);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

router.put("/reviewResponse/:id", auth, async (req, res) => {
  const { body, user, params } = req;
  const { isRead } = body;

  try {
    const currentReviewResponse = await prisma.reviewResponse.update({
      where: {
        id: params.id,
      },
      data: {
        isRead,
      },
    });

    res.send(currentReviewResponse);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

module.exports = router;
