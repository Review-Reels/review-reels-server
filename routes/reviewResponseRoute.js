const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");
const { uploadToS3, deleteFromS3 } = require("../s3");

router.get("/reviewResponse", auth, async (req, res) => {
  const { user } = req;
  console.log(user);
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

//without auth
// router.get("/reviewRequest/:username", async (req, res) => {
//   const { params } = req;

//   try {
//     const currentReviewRequest = await prisma.reviewRequest.findMany({
//       where: {
//         user: { username: params.username },
//       },
//     });
//     let requests = [];
//     currentReviewRequest.map((request) => {
//       requests.push(signedUrl(request.videoUrl));
//     });
//     let reviewRequests = [];
//     Promise.all(requests).then((response) => {
//       reviewRequests = currentReviewRequest.map((request, i) => {
//         return { ...request, signedUrl: response[i] };
//       });
//       res.send(reviewRequests);
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(400).json(e);
//   }
// });
router.post("/reviewResponse", async (req, res) => {
  const { files, body } = req;
  const { data, size } = files.fileName;
  const { whatYouDo, customerName, reviewRequestId } = body;
  const name = new Date().toISOString() + ".mp4";
  const s3FileName = `${reviewRequestId}/${name}`;
  try {
    const uploadResponse = await uploadToS3(s3FileName, data);

    const currentReviewResponse = await prisma.reviewResponse.create({
      data: {
        customerName,
        whatYouDo,
        size,
        videoUrl: s3FileName,
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

// router.delete("/reviewRequest/:id", auth, async (req, res) => {
//   const { params } = req;

//   try {
//     const currentReviewRequest = await prisma.reviewRequest.delete({
//       where: {
//         id: params.id,
//       },
//     });
//     const s3FileName = currentReviewRequest.videoUrl;
//     const uploadResponse = await deleteFromS3(s3FileName);

//     res.status(201);
//   } catch (e) {
//     console.log(e);
//     res.status(400).json(e);
//   }
// });

module.exports = router;
