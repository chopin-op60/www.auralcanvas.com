const db = require('../config/database');

class BaseService {
    constructor(tableName) {
        this.tableName = tableName;
        this.db = db;
    }

    // 通用查询方法
    async findById(id) {
        const [rows] = await this.db.execute(
            `SELECT * FROM ${this.tableName} WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    // 通用创建方法
    async create(data) {
        const fields = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);

        const [result] = await this.db.execute(
            `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`,
            values
        );
        
        return await this.findById(result.insertId);
    }

    // 通用更新方法
    async update(id, data) {
        const fields = Object.keys(data).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(data), id];

        await this.db.execute(
            `UPDATE ${this.tableName} SET ${fields} WHERE id = ?`,
            values
        );
        
        return await this.findById(id);
    }

    // 通用删除方法
    async delete(id) {
        const [result] = await this.db.execute(
            `DELETE FROM ${this.tableName} WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }

    // 分页查询
    async findWithPagination(offset, limit, whereClause = '', params = []) {
        const query = `SELECT * FROM ${this.tableName} ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        const [rows] = await this.db.execute(query, [...params, limit, offset]);
        
        const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
        const [countResult] = await this.db.execute(countQuery, params);
        
        return {
            data: rows,
            total: countResult[0].total
        };
    }
}

module.exports = BaseService;
