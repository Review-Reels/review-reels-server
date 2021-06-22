const router = require("express").Router();

const { uploadToS3, signedUrl } = require("../s3");

router.post("/upload_video", async (req, res) => {
  let { name, data } = req.files.flename;
  try {
    uploadToS3(name, data)
      .then((data) => {
        console.log(data);
        signedUrl(name)
          .then((data) => {
            res.json(data);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
    //   .on("httpUploadProgress", function (progress) {
    //     let progressPercentage = Math.round(
    //       (progress.loaded / progress.total) * 100
    //     );
    //     console.log(progressPercentage);
    //   })
    //   .send(function (err, data) {
    //     console.log(data);
    //     res.json(data);
    //   });
  } catch (e) {
    console.log(e);
    res.status(400).json(e.errors);
  }
});

module.exports = router;
