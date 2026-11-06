const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

let upload;

const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'emjay_brewery/bills',
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    },
  });

  upload = multer({ storage: storage });
} else {
  // Graceful fallback to local disk storage when Cloudinary credentials are not configured
  const uploadDir = path.join(__dirname, '../uploads/bills');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'bill-' + uniqueSuffix + ext);
    }
  });

  upload = multer({ storage: diskStorage });
}

module.exports = { cloudinary, upload };
