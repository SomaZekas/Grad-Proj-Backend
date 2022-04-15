const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// dotenv file
const CLOUNDINARY_CLOUD_NAME = 'dodmtp0m2';
const CLOUDINARY_KEY = '872594197768919';
const CLOUDINARY_SECRET = 'caLYZKrjQcANYesu0IPYCt4vJJQ';

cloudinary.config({
    cloud_name: CLOUNDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_KEY,
    api_secret: CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'test',
        allowedFormats: ['jepg', 'png', 'jpg'],
        use_filename: true,
        public_id: (req, file) => {
            const timestamp = Date.now();
            return timestamp + '_' + file.originalname;
        }
    } 
});

module.exports = {
    cloudinary,
    storage
}