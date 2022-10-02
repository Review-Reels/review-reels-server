const { uploadToS3 } = require("../aws/s3");
const {
  createThumbNail,
  removeLocalFile,
} = require("../utils/createThumbNail");

const { convertVideo } = require("../utils/convertVideo");
const fs = require("fs");

const upload = (s3FileName, data, extension) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (extension == "ios") {
        console.log(platform);
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
      } else {
        const uploadResponse = await uploadToS3(s3FileName, data, extension);
        const thumbNailPath = await createThumbNail(uploadResponse);
        const fileStream = fs.createReadStream(thumbNailPath);
        await uploadToS3(s3FileName, fileStream, ".jpg");
        removeLocalFile(thumbNailPath);
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { upload };
