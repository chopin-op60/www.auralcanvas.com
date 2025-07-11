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
        console.log('=== File Upload Destination ===');
        console.log('Processing file upload:', { 
            fieldname: file.fieldname, 
            mimetype: file.mimetype, 
            originalname: file.originalname,
            size: file.size || 'unknown'
        });
        
        let uploadPath = '';
        
        // 根据文件类型确定存储路径
        if (file.mimetype.startsWith('image/')) {
            uploadPath = path.join(__dirname, '../uploads/images');
        } else if (file.mimetype.startsWith('audio/')) {
            uploadPath = path.join(__dirname, '../uploads/music');
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
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${uniqueSuffix}_${baseName}${ext}`;
        
        console.log(`Generated filename: ${filename}`);
        cb(null, filename);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    console.log('=== File Filter Check ===');
    console.log('File filter input:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname,
        size: file.size || 'unknown'
    });

    const allowedImageTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 
        'image/gif', 'image/webp', 'image/bmp'
    ];
    const allowedAudioTypes = [
        'audio/mpeg', 'audio/mp3', 'audio/wav', 
        'audio/m4a', 'audio/ogg', 'audio/flac'
    ];
    const allowedTypes = [...allowedImageTypes, ...allowedAudioTypes];
    
    if (allowedTypes.includes(file.mimetype)) {
        console.log('✅ File approved:', file.mimetype);
        cb(null, true);
    } else {
        console.log('❌ File rejected - unsupported type:', file.mimetype);
        cb(new Error(`File type ${file.mimetype} is not supported`), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB per file
        files: 10 // 最多10个文件
    },
    fileFilter: fileFilter
});

// 添加调试中间件
const debugUpload = (req, res, next) => {
    console.log('=== Pre-Upload Debug ===');
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('Content-Length:', req.get('Content-Length'));
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    const originalArrayHandler = upload.array('files', 10);
    
    return originalArrayHandler(req, res, (err) => {
        console.log('=== Post-Upload Debug ===');
        console.log('Upload error:', err ? err.message : 'None');
        console.log('Files received:', req.files ? req.files.length : 0);
        
        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                console.log(`File ${index}:`, {
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    destination: file.destination,
                    filename: file.filename,
                    path: file.path
                });
            });
        } else {
            console.log('❌ No files received in req.files');
        }
        
        next(err);
    });
};

module.exports = { upload, debugUpload };
