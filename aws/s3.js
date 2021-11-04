const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

const uploadToS3 = (fileName, fileContent, fileExtension = ".webm") => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName + fileExtension,
    Body: fileContent,
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, async (err, data) => {
      if (err) {
        reject(err);
      }

      resolve(data.Location);
    });
  });
};

const deleteFromS3 = (fileName) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

const signedUrl = (fileName) => {
  return s3.getSignedUrlPromise("getObject", {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Expires: 604800,
  });
};

module.exports = { uploadToS3, signedUrl, deleteFromS3 };
