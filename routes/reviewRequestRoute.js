const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");

const { upload } = require("../utils/upload");
const { deleteFromS3 } = require("../aws/s3");

router.get("/reviewRequest", auth, async (req, res) => {
  const { user } = req;

  try {
    const currentReviewRequest = await prisma.reviewRequest.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
    });
    res.send(currentReviewRequest);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

//without auth
// router.get("/reviewRequest/:username", async (req, res) => {
//   const { params } = req;

//   try {
//     const currentReviewRequest = await prisma.reviewRequest.findMany({
//       include: {
//         user: {
//           select: {
//             merchantName: true,
//           },
//         },
//       },
//       where: {
//         user: { username: params.username },
//       },
//     });
//     res.send(currentReviewRequest);
//   } catch (e) {
//     console.log(e);
//     res.status(400).json(e);
//   }
// });
//without auth
router.get("/reviewRequest/requestId=:requestId", async (req, res) => {
  const { params } = req;
  try {
    const currentReviewRequest = await prisma.reviewRequest.findUnique({
      include: {
        user: {
          select: {
            merchantName: true,
          },
        },
      },
      where: {
        id: params.requestId,
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
  let data = null;
  let size = 0;
  if (files && files.fileName) {
    const { data: fileData, size: fileSize } = files.fileName;
    data = fileData;
    size = fileSize;
  }
  const { askMessage, extension, name } = body;
  const fileName = new Date().toISOString();
  console.log(data, size, name);
  try {
    // const existingRequests = await prisma.reviewRequest.findFirst({
    //   where: {
    //     userId: user.id,
    //   },
    // });
    // if (existingRequests) {
    //   res.send({ message: "You can only create one review request" });
    // } else {
    if (data) {
      const s3FileName = `${user.id}/${fileName}`;
      await upload(s3FileName, data, extension);
      const currentReviewRequest = await prisma.reviewRequest.create({
        data: {
          name,
          askMessage,
          size,
          videoUrl: s3FileName + extension,
          imageUrl: s3FileName + ".jpg",
          userId: user.id,
        },
      });
      res.send(currentReviewRequest);
    } else {
      const currentReviewRequest = await prisma.reviewRequest.create({
        data: {
          name,
          askMessage,
          size,
          videoUrl: "",
          imageUrl: "",
          userId: user.id,
        },
      });
      res.send(currentReviewRequest);
    }

    // }
  } catch (e) {
    console.log(e, "error");
    res.status(400).json(e);
  }
});

router.put("/reviewRequest/:id", auth, async (req, res) => {
  const { files, body, user, params } = req;
  const { askMessage, platform } = body;

  try {
    const review = await prisma.reviewRequest.findUnique({
      where: { id: params.id },
    });
    if (review) {
      let size = review.size;
      const s3FileName = review.videoUrl.replace(".mp4", "");
      if (files && files.hasOwnProperty("fileName")) {
        let { data } = files.fileName;
        size = files.fileName.size;
        await upload(s3FileName, data, platform);
      }

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
  try {
    const { params } = req;
    const currentReviewRequest = await prisma.reviewRequest.delete({
      where: {
        id: params.id,
      },
    });
    const s3FileName = currentReviewRequest.videoUrl;
    if (s3FileName !== "") await deleteFromS3(s3FileName);

    res.status(201).send({});
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

module.exports = router;
