const db = require('./config/database');

async function testDatabaseConnection() {
    try {
        console.log('🔍 Testing database connection...');
        
        // 基础连接测试
        const [rows] = await db.execute('SELECT 1 as test');
        console.log('✅ Database connection successful:', rows[0]);
        
        // 测试查询用户表
        const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
        console.log('✅ Users table accessible, count:', users[0].count);
        
        // 测试查询帖子表
        const [posts] = await db.execute('SELECT COUNT(*) as count FROM posts');
        console.log('✅ Posts table accessible, count:', posts[0].count);
        
        // 测试查询评论表
        const [comments] = await db.execute('SELECT COUNT(*) as count FROM comments');
        console.log('✅ Comments table accessible, count:', comments[0].count);
        
        // 测试查询点赞表
        const [likes] = await db.execute('SELECT COUNT(*) as count FROM likes');
        console.log('✅ Likes table accessible, count:', likes[0].count);
        
        console.log('🎉 All database tests passed!');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Please check:');
        console.error('1. MySQL service is running');
        console.error('2. Database credentials in .env file');
        console.error('3. Database and tables exist');
    } finally {
        // 关闭连接池
        await db.end();
        process.exit();
    }
}

testDatabaseConnection();
