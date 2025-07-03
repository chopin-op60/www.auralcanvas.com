module.exports = {
    apps: [{
        name: 'auralcanvas-api',
        script: 'app.js',
        cwd: '/var/www/auralcanvas/backend',
        instances: 1,
        exec_mode: 'fork',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        autorestart: true,
        watch: false,
        max_memory_restart: '1G'
    }]
};
