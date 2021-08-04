const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");
// const { uploadToS3, deleteFromS3 } = require("../aws/s3");
const { upload } = require("../utils/upload");

router.get("/reviewRequest", auth, async (req, res) => {
  const { user } = req;

  try {
    const currentReviewRequest = await prisma.reviewRequest.findMany({
      where: {
        userId: user.id,
      },
    });
    res.send(currentReviewRequest);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

//without auth
router.get("/reviewRequest/:username", async (req, res) => {
  const { params } = req;

  try {
    const currentReviewRequest = await prisma.reviewRequest.findMany({
      where: {
        user: { username: params.username },
      },
    });
    res.send(currentReviewRequest);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});
router.post("/reviewRequest", auth, async (req, res) => {
  const { files, body, user } = req;
  const { data, size } = files.fileName;
  const { askMessage } = body;
  const name = new Date().toISOString();
  try {
    const existingRequests = await prisma.reviewRequest.findFirst({
      where: {
        userId: user.id,
      },
    });
    if (existingRequests) {
      res.send({ message: "You can only create one review request" });
    } else {
      const s3FileName = `${user.id}/${name}`;
      await upload(s3FileName, data);

      const currentReviewRequest = await prisma.reviewRequest.create({
        data: {
          askMessage,
          size,
          videoUrl: s3FileName + ".mp4",
          imageUrl: s3FileName + ".jpg",
          userId: user.id,
        },
      });

      res.send(currentReviewRequest);
    }
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

router.put("/reviewRequest/:id", auth, async (req, res) => {
  const { files, body, user, params } = req;
  const { data, size } = files.fileName;
  const { askMessage } = body;

  try {
    const review = await prisma.reviewRequest.findUnique({
      where: { id: params.id },
    });
    if (review) {
      const s3FileName = review.videoUrl.replace(".mp4", "");
      await upload(s3FileName, data);

      const currentReviewRequest = await prisma.reviewRequest.update({
        where: {
          id: params.id,
        },
        data: {
          askMessage,
          videoUrl: s3FileName + ".mp4",
          imageUrl: s3FileName + ".jpg",
          size,
          userId: user.id,
        },
      });
      res.send(currentReviewRequest);
    } else {
      res.status(400).json({ message: "review request doesn't exist" });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
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
    res.status(400).json(e);
  }
});

module.exports = router;
