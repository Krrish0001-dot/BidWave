const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials:{
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function(req,file,cb){
            const fileName = `auctions/${Date.now()}-${file.originalname}`;
            cb(null,fileName);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024},
    fileFilter: function(req,file,cb){
        if(file.mimetype.startsWith('image/')){
            cb(null,true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

module.exports = upload;