const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");
const { uploadToS3, deleteFromS3, signedUrl } = require("../s3");

router.get("/reviewRequest/:id", auth, async (req, res) => {
  const { params } = req;

  try {
    const currentReviewRequest = await prisma.reviewRequest.findUnique({
      where: {
        id: params.id,
      },
    });

    res.send(currentReviewRequest);
  } catch (e) {
    console.log(e);
    res.status(400).json(e.errors);
  }
});

router.post("/reviewRequest", auth, async (req, res) => {
  const { files, body, user } = req;
  const { name, data, size } = files.fileName;
  const { askMessage } = body;

  const s3FileName = `${user.id}/${name}`;
  try {
    const uploadResponse = await uploadToS3(s3FileName, data);

    const currentReviewRequest = await prisma.reviewRequest.create({
      data: {
        askMessage,
        size,
        videoUrl: s3FileName,
        userId: user.id,
      },
    });
    currentReviewRequest.signedUrl = await signedUrl(s3FileName);

    res.send(currentReviewRequest);
  } catch (e) {
    console.log(e);
    res.status(400).json(e.errors);
  }
});

router.put("/reviewRequest/:id", auth, async (req, res) => {
  const { files, body, user, params } = req;
  const { name, data, size } = files.fileName;
  const { askMessage } = body;

  const s3FileName = `${user.id}/${name}`;
  try {
    const uploadResponse = await uploadToS3(s3FileName, data);

    const currentReviewRequest = await prisma.reviewRequest.update({
      where: {
        id: params.id,
      },
      data: {
        askMessage,
        size,
        videoUrl: s3FileName,
        userId: user.id,
      },
    });
    currentReviewRequest.signedUrl = await signedUrl(s3FileName);

    res.send(currentReviewRequest);
  } catch (e) {
    console.log(e);
    res.status(400).json(e.errors);
  }
});

router.delete("/reviewRequest/:id", auth, async (req, res) => {
  const { params } = req;

  try {
    const currentReviewRequest = await prisma.reviewRequest.delete({
      where: {
        id: params.id,
      },
    });
    const s3FileName = currentReviewRequest.videoUrl;
    const uploadResponse = await deleteFromS3(s3FileName);

    res.status(201);
  } catch (e) {
    console.log(e);
    res.status(400).json(e.errors);
  }
});

module.exports = router;