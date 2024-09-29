const AWS = require("aws-sdk");
const fs = require("fs");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

function uploadToS3(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const params = {
    Bucket: "your-s3-bucket",
    Key: `backups/${filePath.split("/").pop()}`,
    Body: fileStream,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.log(`Error uploading to S3: ${err}`);
    } else {
      console.log(`Backup uploaded to S3: ${data.Location}`);
    }
  });
}

module.exports = { uploadToS3 };
