const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保目录存在
const ensureDirectoryExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
};

// 配置存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Profile file upload:', { 
            fieldname: file.fieldname, 
            mimetype: file.mimetype, 
            originalname: file.originalname
        });
        
        let uploadPath = '';
        
        // 根据字段名确定存储路径
        if (file.fieldname === 'avatar') {
            uploadPath = path.join(__dirname, '../uploads/avatars');
        } else if (file.fieldname === 'cover_image') {
            uploadPath = path.join(__dirname, '../uploads/covers');
        } else {
            uploadPath = path.join(__dirname, '../uploads/misc');
        }
        
        ensureDirectoryExists(uploadPath);
        console.log(`File will be saved to: ${uploadPath}`);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = `${uniqueSuffix}${ext}`;
        
        console.log(`Generated filename: ${filename}`);
        cb(null, filename);
    }
});

// 文件过滤器 - 只允许图片
const fileFilter = (req, file, cb) => {
    console.log('Profile file filter:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname
    });

    const allowedImageTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 
        'image/gif', 'image/webp'
    ];
    
    if (allowedImageTypes.includes(file.mimetype)) {
        console.log('✅ Profile image approved');
        cb(null, true);
    } else {
        console.log('❌ Profile file rejected - not an image');
        cb(new Error('Only image files are allowed for profile'), false);
    }
};

const profileUpload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB for profile images
        files: 2 // avatar + cover image
    },
    fileFilter: fileFilter
});

module.exports = profileUpload;
