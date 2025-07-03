// 用户数据验证
class UserValidator {
    // 验证注册数据
    validateRegister({ username, email, password }) {
        const errors = [];

        // 用户名验证
        if (!username || typeof username !== 'string') {
            errors.push('用户名不能为空');
        } else if (username.length < 3 || username.length > 20) {
            errors.push('用户名长度必须在3-20个字符之间');
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errors.push('用户名只能包含字母、数字和下划线');
        }

        // 邮箱验证
        if (!email || typeof email !== 'string') {
            errors.push('邮箱不能为空');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('邮箱格式不正确');
        }

        // 密码验证
        if (!password || typeof password !== 'string') {
            errors.push('密码不能为空');
        } else if (password.length < 6) {
            errors.push('密码长度至少6个字符');
        }

        return errors;
    }

    // 验证登录数据
    validateLogin({ username, password }) {
        const errors = [];

        // 用户名验证
        if (!username || typeof username !== 'string') {
            errors.push('用户名不能为空');
        }

        // 密码验证
        if (!password || typeof password !== 'string') {
            errors.push('密码不能为空');
        }

        return errors;
    }

    // 验证更新用户数据
    validateUpdate(data) {
        const errors = [];
        const { username, email } = data;

        // 如果提供了用户名，验证格式
        if (username) {
            if (username.length < 3 || username.length > 20) {
                errors.push('用户名长度必须在3-20个字符之间');
            } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                errors.push('用户名只能包含字母、数字和下划线');
            }
        }

        // 如果提供了邮箱，验证格式
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('邮箱格式不正确');
        }

        return errors;
    }
}

module.exports = new UserValidator();
