const { uploadToS3 } = require("../aws/s3");
const {
  createThumbNail,
  removeLocalFile,
} = require("../utils/createThumbNail");

const { convertVideo } = require("../utils/convertVideo");
const fs = require("fs");

const upload = (s3FileName, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const convertedStream = await convertVideo(data);
      const uploadResponse = await uploadToS3(
        s3FileName,
        convertedStream.fileStream,
        ".mp4"
      );
      convertedStream.filePaths.map(async (path, index) => {
        if (index == 0) {
          const thumbNailPath = await createThumbNail(path);
          const fileStream = fs.createReadStream(thumbNailPath);
          await uploadToS3(s3FileName, fileStream, ".jpg");
          removeLocalFile(thumbNailPath);
        }
        removeLocalFile(path);
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { upload };
