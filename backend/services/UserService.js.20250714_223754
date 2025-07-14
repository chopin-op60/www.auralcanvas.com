const BaseService = require('./BaseService');
const bcrypt = require('bcryptjs');

class UserService extends BaseService {
    constructor() {
        super('users');
    }

    async createUser(userData) {
        // 检查用户名和邮箱是否已存在
        await this.checkUserExists(userData.username, userData.email);
        
        // 加密密码
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(userData.password, saltRounds);
        
        // 准备用户数据
        const userDataWithHash = {
            username: userData.username,
            email: userData.email,
            password_hash: passwordHash,
            avatar: userData.avatar || null
        };
        
        return await this.create(userDataWithHash);
    }

    async findByUsername(username) {
        const [rows] = await this.db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0] || null;
    }

    async findByEmail(email) {
        const [rows] = await this.db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    }

    async checkUserExists(username, email) {
        const existingUser = await this.findByUsername(username);
        if (existingUser) {
            throw new Error('用户名已存在');
        }
        
        const existingEmail = await this.findByEmail(email);
        if (existingEmail) {
            throw new Error('邮箱已被使用');
        }
    }

    async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    async getUserProfile(id) {
        const [rows] = await this.db.execute(
            'SELECT id, username, email, avatar, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    async updateProfile(id, profileData) {
        const allowedFields = ['username', 'email', 'avatar'];
        const updateData = {};
        
        // 只允许更新特定字段
        for (const field of allowedFields) {
            if (profileData[field] !== undefined) {
                updateData[field] = profileData[field];
            }
        }
        
        if (Object.keys(updateData).length === 0) {
            throw new Error('没有有效的更新数据');
        }
        
        return await this.update(id, updateData);
    }
}

module.exports = UserService;
