const multer = require('multer');
const multerGoogleStorage = require('multer-cloud-storage');
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});
// multerGoogleStorage.default
const uploadGoogleStorage = multer({
  storage: multerGoogleStorage.storageEngine({
    acl: 'publicRead',
    keyFilename: `${__dirname}/../googleStorageKey.json`,
    // destination: 'uploads/',
    // filename(req, file, cb) {
    //   cb(null, `${Date.now()}_${path.basename(file.originalname.replace(' ', '_'))}`);
    // },
    // filename: 'ssdf',
  }),
  limits: { fileSize: 5 * 1024 * 1024 /* 5MB */ },
});

module.exports = { upload, uploadGoogleStorage };
