// User data validation
class UserValidator {
    // Validate registration data
    validateRegister({ username, email, password }) {
        const errors = [];

        // Username validation
        if (!username || typeof username !== 'string') {
            errors.push('Username cannot be empty');
        } else if (username.length < 3 || username.length > 20) {
            errors.push('Username must be between 3-20 characters');
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errors.push('Username can only contain letters, numbers and underscores');
        }

        // Email validation
        if (!email || typeof email !== 'string') {
            errors.push('Email cannot be empty');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format');
        }

        // Password validation
        if (!password || typeof password !== 'string') {
            errors.push('Password cannot be empty');
        } else if (password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }

        return errors;
    }

    // Validate login data
    validateLogin({ username, password }) {
        const errors = [];

        // Username validation
        if (!username || typeof username !== 'string') {
            errors.push('Username cannot be empty');
        }

        // Password validation
        if (!password || typeof password !== 'string') {
            errors.push('Password cannot be empty');
        }

        return errors;
    }

    // Validate user update data
    validateUpdate(data) {
        const errors = [];
        const { username, email } = data;

        // If username is provided, validate format
        if (username) {
            if (username.length < 3 || username.length > 20) {
                errors.push('Username must be between 3-20 characters');
            } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                errors.push('Username can only contain letters, numbers and underscores');
            }
        }

        // If email is provided, validate format
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Invalid email format');
        }

        return errors;
    }
}

module.exports = new UserValidator();
