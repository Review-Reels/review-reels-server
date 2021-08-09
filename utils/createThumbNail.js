var ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const { nanoid } = require("nanoid");

const createThumbNail = (fileContent) => {
  const fileName = `${nanoid()}.jpg`;
  const path = "./thumbnail";
  return new Promise((resolve, reject) => {
    ffmpeg({
      source: fileContent,
    })
      .on("end", () => {
        resolve(`${path}/${fileName}`);
      })
      .on("error", () => {
        reject();
      })
      .takeScreenshots(
        {
          count: 1,
          filename: fileName,
        },
        path
      );
  });
};

const removeLocalFile = (path) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.error(err);
  }
};

module.exports = { createThumbNail, removeLocalFile };
