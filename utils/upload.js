const { uploadToS3 } = require("../aws/s3");
const {
  createThumbNail,
  removeLocalFile,
} = require("../utils/createThumbNail");
const fs = require("fs");

const upload = (s3FileName, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const uploadResponse = await uploadToS3(s3FileName, data, ".mp4");
      const thumbNailPath = await createThumbNail(uploadResponse);
      const fileStream = fs.createReadStream(thumbNailPath);

      await uploadToS3(s3FileName, fileStream, ".jpg");
      removeLocalFile(thumbNailPath);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { upload };
