class BaseController {
    constructor() {
        this.handleAsync = this.handleAsync.bind(this);
    }

    // 异步错误处理包装器
    handleAsync(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

    // 统一响应格式
    sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    sendError(res, message = 'Error', statusCode = 400, error = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            error: process.env.NODE_ENV === 'development' ? error : null,
            timestamp: new Date().toISOString()
        });
    }

    // 分页辅助函数
    getPagination(req) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        return { page, limit, offset };
    }
}

module.exports = BaseController;
