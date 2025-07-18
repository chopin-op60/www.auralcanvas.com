const BaseService = require('../BaseService');

class AIAgentService extends BaseService {
    constructor() {
        super('user_ai_agents');
    }

    // 获取用户AI代理配置
    async getUserAgent(userId) {
        try {
            const [rows] = await this.db.execute(
                'SELECT * FROM user_ai_agents WHERE user_id = ?',
                [userId]
            );
            
            if (rows.length === 0) {
                // 创建默认配置
                return await this.createDefaultAgent(userId);
            }
            
            return rows[0];
        } catch (error) {
            throw new Error(`Failed to get user agent: ${error.message}`);
        }
    }

    // 创建默认AI代理配置
    async createDefaultAgent(userId) {
        const defaultAgent = {
            user_id: userId,
            status: 'disabled',
            agent_name: null,
            agent_description: null,
            privacy_level: 'friends'
        };

        return await this.create(defaultAgent);
    }

    // 更新AI代理配置
    async updateAgentConfig(userId, configData) {
        try {
            console.log('=== AIAgentService.updateAgentConfig ===');
            console.log('User ID:', userId);
            console.log('Config data received:', JSON.stringify(configData, null, 2));
            
            const existing = await this.getUserAgent(userId);
            console.log('Existing agent:', JSON.stringify(existing, null, 2));
            
            const allowedFields = [
                'status', 'agent_name', 'agent_description', 
                'external_agent_id', 'external_script_code', 
                'external_platform_url', 'privacy_level'
            ];

            const updateData = {};
            allowedFields.forEach(field => {
                if (configData[field] !== undefined) {
                    updateData[field] = configData[field];
                    console.log(`Setting ${field}:`, configData[field]?.length ? `${configData[field].length} chars` : configData[field]);
                }
            });

            console.log('Update data prepared:', JSON.stringify(updateData, null, 2));

            // 如果设置了外部脚本代码，自动更新状态
            if (updateData.external_script_code && updateData.external_script_code.trim()) {
                updateData.status = 'configured';
                console.log('Auto-setting status to configured due to script code');
            }

            console.log('Final update data:', JSON.stringify(updateData, null, 2));
            
            const result = await this.update(existing.id, updateData);
            console.log('Update result:', JSON.stringify(result, null, 2));
            
            return result;
        } catch (error) {
            console.error('Error in updateAgentConfig:', error);
            throw new Error(`Failed to update agent config: ${error.message}`);
        }
    }

    // 激活AI代理
    async activateAgent(userId) {
        try {
            console.log('=== AIAgentService.activateAgent ===');
            console.log('User ID:', userId);
            
            const agent = await this.getUserAgent(userId);
            console.log('Agent data for activation:', JSON.stringify(agent, null, 2));
            
            console.log('Checking external_script_code:');
            console.log('- Value:', agent.external_script_code);
            console.log('- Type:', typeof agent.external_script_code);
            console.log('- Length:', agent.external_script_code ? agent.external_script_code.length : 'null');
            console.log('- Trimmed length:', agent.external_script_code ? agent.external_script_code.trim().length : 'null');
            
            if (!agent.external_script_code || !agent.external_script_code.trim()) {
                console.log('ERROR: No external script code found - cannot activate');
                throw new Error('Cannot activate agent without external script code');
            }

            console.log('Script code validation passed, proceeding with activation');
            
            const result = await this.update(agent.id, { 
                status: 'active',
                last_knowledge_update: new Date()
            });
            
            console.log('Activation result:', JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error('Error in activateAgent:', error);
            throw error;
        }
    }

    // 停用AI代理
    async deactivateAgent(userId) {
        try {
            const agent = await this.getUserAgent(userId);
            return await this.update(agent.id, { status: 'disabled' });
        } catch (error) {
            throw error;
        }
    }

    // 获取公开可用的AI代理列表
    async getPublicAgents(offset = 0, limit = 20) {
        try {
            const safeOffset = parseInt(offset) || 0;
            const safeLimit = parseInt(limit) || 20;

            const query = `
                SELECT 
                    a.id, a.user_id, a.agent_name, a.agent_description,
                    a.status, a.created_at, a.updated_at,
                    u.username, u.avatar
                FROM user_ai_agents a
                JOIN users u ON a.user_id = u.id
                WHERE a.status = 'active' AND a.privacy_level = 'public'
                ORDER BY a.updated_at DESC
                LIMIT ${safeLimit} OFFSET ${safeOffset}
            `;

            const [agents] = await this.db.execute(query);

            const countQuery = `
                SELECT COUNT(*) as total 
                FROM user_ai_agents a
                WHERE a.status = 'active' AND a.privacy_level = 'public'
            `;
            const [countResult] = await this.db.execute(countQuery);

            return {
                data: agents,
                total: countResult[0].total
            };
        } catch (error) {
            console.error('Error in getPublicAgents:', error);
            throw error;
        }
    }

    // 验证用户是否可以访问特定AI代理
    async canAccessAgent(agentUserId, currentUserId = null) {
        try {
            const agent = await this.getUserAgent(agentUserId);

            if (!agent || agent.status !== 'active') {
                return false;
            }

            // 公开代理任何人都可以访问
            if (agent.privacy_level === 'public') {
                return true;
            }

            // 私有代理只有本人可以访问
            if (agent.privacy_level === 'private') {
                return currentUserId === agentUserId;
            }

            // 好友可见需要检查好友关系
            if (agent.privacy_level === 'friends') {
                if (currentUserId === agentUserId) {
                    return true;
                }

                if (!currentUserId) {
                    return false;
                }

                // 检查好友关系
                const [friendship] = await this.db.execute(
                    `SELECT id FROM friends 
                     WHERE ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
                     AND status = 'accepted'`,
                    [currentUserId, agentUserId, agentUserId, currentUserId]
                );

                return friendship.length > 0;
            }

            return false;
        } catch (error) {
            console.error('Error in canAccessAgent:', error);
            throw error;
        }
    }

    // 更新知识库更新时间
    async updateKnowledgeTimestamp(userId) {
        try {
            const agent = await this.getUserAgent(userId);
            return await this.update(agent.id, { 
                last_knowledge_update: new Date()
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AIAgentService;
