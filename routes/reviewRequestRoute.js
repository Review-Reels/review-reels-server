const router = require("express").Router();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const auth = require("./VerifyToken");
// const { uploadToS3, deleteFromS3 } = require("../aws/s3");
const { upload } = require("../utils/upload");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

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
  console.log(data, size, name);
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
      // await upload(s3FileName, data);
      // stream = s3
      //   .getObject(
      //     {
      //       Bucket: process.env.AWS_BUCKET_NAME,
      //       Key:
      //         "https://review-reels-videos.s3.ap-south-1.amazonaws.com/" +
      //         s3FileName,
      //     },
      //     function (err, data) {
      //       if (err) console.log(err, err.stack);
      //       // an error occurred
      //       else console.log(data); // successful response
      //     }
      //   )
      //   .createReadStream();
      fs.writeFile("test.mp4", data, function (err) {
        if (err) return console.log(err);
        console.log("file saved");
      });
      // downloadFile(
      //   `./thumbnail/test.mp4`,
      //   process.env.AWS_BUCKET_NAME,
      //   `${s3FileName}.mp4`
      // );

      ffmpeg("test.mp4")
        .on("end", async function () {
          console.log("Finished processing");
          const fileStream = fs.createReadStream("your_target.mp4");
          await upload(s3FileName, fileStream);
        })
        .videoCodec("libx264")
        .toFormat("mp4")
        .saveToFile("your_target.mp4", function (stdout, stderr) {
          console.log("file has been converted succesfully");
        });

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
  const { askMessage } = body;

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
        await upload(s3FileName, data);
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

const downloadFile = (filePath, bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };
  s3.getObject(params, (err, data) => {
    if (err) console.error(err);
    fs.writeFileSync(filePath, data.Body.toString());
    console.log(`${filePath} has been created!`);
  });
};
