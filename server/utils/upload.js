const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, 'uploads');
    },
    filename(req, file, done) {
      done(null, `${Date.now()}_${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// const storage = new Storage();

const uploadGCS = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
});

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: { client_email: process.env.GCLOUD_CLIENT_EMAIL, private_key: process.env.GCLOUD_PRIVATE_KEY },
});

const bucket = storage.bucket(process.env.GCLOUD_BUCKET);

module.exports = { upload, uploadGCS, bucket };
