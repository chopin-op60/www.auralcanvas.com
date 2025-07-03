const BaseController = require('./BaseController');
const UserService = require('../services/UserService');
const userValidator = require('../validators/userValidator');
const jwt = require('jsonwebtoken');

class AuthController extends BaseController {
    constructor() {
        super();
        this.userService = new UserService();
    }

    // 用户注册
    register = this.handleAsync(async (req, res) => {
        const { username, email, password } = req.body;

        // 数据验证
        const validationErrors = userValidator.validateRegister({ username, email, password });
        if (validationErrors.length > 0) {
            return this.sendError(res, validationErrors.join(', '), 400);
        }

        try {
            const user = await this.userService.createUser({ username, email, password });
            
            // 生成 JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // 返回用户信息（不包含密码）
            const userResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                created_at: user.created_at
            };

            this.sendSuccess(res, { user: userResponse, token }, '注册成功', 201);
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });

    // 用户登录
    login = this.handleAsync(async (req, res) => {
        const { username, password } = req.body;

        // 数据验证
        const validationErrors = userValidator.validateLogin({ username, password });
        if (validationErrors.length > 0) {
            return this.sendError(res, validationErrors.join(', '), 400);
        }

        try {
            // 查找用户
            const user = await this.userService.findByUsername(username);
            if (!user) {
                return this.sendError(res, '用户名或密码错误', 401);
            }

            // 验证密码
            const isValidPassword = await this.userService.validatePassword(password, user.password_hash);
            if (!isValidPassword) {
                return this.sendError(res, '用户名或密码错误', 401);
            }

            // 生成 JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // 返回用户信息（不包含密码）
            const userResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                created_at: user.created_at
            };

            this.sendSuccess(res, { user: userResponse, token }, '登录成功');
        } catch (error) {
            this.sendError(res, '登录失败', 500, error.message);
        }
    });

    // Token验证接口
    verify = this.handleAsync(async (req, res) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return this.sendError(res, '没有提供token', 401);
            }

            // 验证JWT密钥是否存在
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET未设置');
                return this.sendError(res, '服务器配置错误', 500);
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await this.userService.findById(decoded.id);
                
                if (!user) {
                    return this.sendError(res, '用户不存在', 401);
                }

                // 返回用户信息（不包含密码）
                const userResponse = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                    created_at: user.created_at
                };

                this.sendSuccess(res, userResponse, 'Token验证成功');
            } catch (jwtError) {
                console.error('JWT验证错误:', jwtError.message);
                return this.sendError(res, 'Token无效', 401);
            }
        } catch (error) {
            console.error('Token验证失败:', error);
            this.sendError(res, '验证过程出错', 500);
        }
    });

    // 获取用户信息
    profile = this.handleAsync(async (req, res) => {
        try {
            const user = await this.userService.findById(req.user.id);
            if (!user) {
                return this.sendError(res, '用户不存在', 404);
            }

            // 返回用户信息（不包含密码）
            const userResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                created_at: user.created_at
            };

            this.sendSuccess(res, userResponse, '获取用户信息成功');
        } catch (error) {
            this.sendError(res, '获取用户信息失败', 500, error.message);
        }
    });

    // 测试接口
    test = this.handleAsync(async (req, res) => {
        this.sendSuccess(res, { message: 'Auth controller working with database!' }, '认证模块测试成功');
    });
}

module.exports = new AuthController();
