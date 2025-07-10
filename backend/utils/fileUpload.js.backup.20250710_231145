const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// 配置存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = '';
        
        if (file.fieldname === 'image') {
            uploadPath = path.join(__dirname, '../uploads/images');
        } else if (file.fieldname === 'music') {
            uploadPath = path.join(__dirname, '../uploads/music');
        } else if (file.fieldname === 'avatar') {
            uploadPath = path.join(__dirname, '../uploads/avatars');
        } else {
            uploadPath = path.join(__dirname, '../uploads');
        }
        
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'image') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只能上传图片文件'), false);
        }
    } else if (file.fieldname === 'music') {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('只能上传音频文件'), false);
        }
    } else if (file.fieldname === 'avatar') {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('头像只能上传图片文件'), false);
        }
    } else {
        cb(null, true);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter: fileFilter
});

module.exports = upload;
