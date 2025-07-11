const BaseController = require('./BaseController');
const UserService = require('../services/UserService');
const userValidator = require('../validators/userValidator');
const jwt = require('jsonwebtoken');

class AuthController extends BaseController {
    constructor() {
        super();
        this.userService = new UserService();
    }

    // User registration
    register = this.handleAsync(async (req, res) => {
        const { username, email, password } = req.body;

        // Data validation
        const validationErrors = userValidator.validateRegister({ username, email, password });
        if (validationErrors.length > 0) {
            return this.sendError(res, validationErrors.join(', '), 400);
        }

        try {
            const user = await this.userService.createUser({ username, email, password });
            
            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Return user info (without password)
            const userResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                created_at: user.created_at
            };

            this.sendSuccess(res, { user: userResponse, token }, 'Registration successful', 201);
        } catch (error) {
            this.sendError(res, error.message, 400);
        }
    });

    // User login
    login = this.handleAsync(async (req, res) => {
        const { username, password } = req.body;

        // Data validation
        const validationErrors = userValidator.validateLogin({ username, password });
        if (validationErrors.length > 0) {
            return this.sendError(res, validationErrors.join(', '), 400);
        }

        try {
            // Find user
            const user = await this.userService.findByUsername(username);
            if (!user) {
                return this.sendError(res, 'Invalid username or password', 401);
            }

            // Validate password
            const isValidPassword = await this.userService.validatePassword(password, user.password_hash);
            if (!isValidPassword) {
                return this.sendError(res, 'Invalid username or password', 401);
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Return user info (without password)
            const userResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                created_at: user.created_at
            };

            this.sendSuccess(res, { user: userResponse, token }, 'Login successful');
        } catch (error) {
            this.sendError(res, 'Login failed', 500, error.message);
        }
    });

    // Token verification endpoint
    verify = this.handleAsync(async (req, res) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return this.sendError(res, 'No token provided', 401);
            }

            // Verify JWT secret exists
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET not set');
                return this.sendError(res, 'Server configuration error', 500);
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await this.userService.findById(decoded.id);
                
                if (!user) {
                    return this.sendError(res, 'User not found', 401);
                }

                // Return user info (without password)
                const userResponse = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar,
                    created_at: user.created_at
                };

                this.sendSuccess(res, userResponse, 'Token verification successful');
            } catch (jwtError) {
                console.error('JWT verification error:', jwtError.message);
                return this.sendError(res, 'Invalid token', 401);
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            this.sendError(res, 'Verification process error', 500);
        }
    });

    // Get user profile
    profile = this.handleAsync(async (req, res) => {
        try {
            const user = await this.userService.findById(req.user.id);
            if (!user) {
                return this.sendError(res, 'User not found', 404);
            }

            // Return user info (without password)
            const userResponse = {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                created_at: user.created_at
            };

            this.sendSuccess(res, userResponse, 'User profile retrieved successfully');
        } catch (error) {
            this.sendError(res, 'Failed to get user profile', 500, error.message);
        }
    });

    // Test endpoint
    test = this.handleAsync(async (req, res) => {
        this.sendSuccess(res, { message: 'Auth controller working with database!' }, 'Authentication module test successful');
    });
}

module.exports = new AuthController();
