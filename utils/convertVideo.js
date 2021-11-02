var ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const { nanoid } = require("nanoid");

async function convertVideo(data) {
  const fileName = await downloadVideo(data);
  return new Promise((resolve, reject) => {
    ffmpeg(`./thumbnail/${fileName}`)
      .on("end", async function () {
        console.log("Finished processing");
        const fileStream = fs.createReadStream(
          `./thumbnail/target_${fileName}`
        );
        resolve({
          fileStream,
          filePaths: [
            `./thumbnail/${fileName}`,
            `./thumbnail/target_${fileName}`,
          ],
        });
      })
      .on("error", (e) => {
        console.log("error", e);
        reject();
      })
      .videoCodec("libx264")
      .toFormat("mp4")
      .output(`./thumbnail/target_${fileName}`)
      .run();
  });
}

function downloadVideo(data) {
  const fileName = `${nanoid()}.mp4`;
  return new Promise((resolve, reject) => {
    fs.writeFile(`./thumbnail/${fileName}`, data, function (err) {
      if (err) reject();
      console.log("file saved");
      resolve(fileName);
    });
  });
}

module.exports = { convertVideo, downloadVideo };
