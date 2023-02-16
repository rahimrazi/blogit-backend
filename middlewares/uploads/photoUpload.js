const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const uuid = require('uuid');

//storage given by multer
const multerStorage = multer.memoryStorage();

//file type checking
const multerFilter = (req, file, cb) => {
  //check file type
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    //rejected files
    cb(
      {
        message: "Unsupported file format",
      },
      false
    );
  }
};

const photoUpload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 2000000 },
});

//profile image resize
const profilePhotoResize = async (req, res, next) => {
  // check if there is no file
  if (!req.file) return next();

  req.file.filename = `user-${uuid.v4()}-${req?.file?.originalname}`;

  await sharp(req?.file?.buffer)
    .resize(250, 250)
    .toFormat("jpg")
    .jpeg({ quality: 90 })
    .toFile(path.join(`public/images/profile/${req.file.filename}`));
  next();
};

//post image resize
const postImageResize = async (req, res, next) => {
  // check if there is no file
  if (!req.file) return next();

  req.file.filename = `user-${uuid.v4()}-${req?.file?.originalname}`;

  await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat("jpg")
    .jpeg({ quality: 90 })
    .toFile(path.join(`public/images/posts/${req?.file?.filename}`));
  next();
};
module.exports = { photoUpload, profilePhotoResize,postImageResize };
