const express = require('express');
const router = express.Router();
const AIController = require('../controllers/ai/AIController');
const auth = require('../middleware/auth');

// 测试路由
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'AI Agent API is ready!',
        features: [
            'Knowledge base extraction',
            'Document generation',
            'Agent configuration',
            'Privacy controls',
            'External platform integration'
        ],
        timestamp: new Date().toISOString()
    });
});

// 知识库管理路由（需要认证）
router.get('/knowledge/selection', auth, AIController.getKnowledgeSelection);
router.put('/knowledge/selection', auth, AIController.updateKnowledgeSelection);
router.get('/knowledge/preview', auth, AIController.previewKnowledgeBase);
router.get('/knowledge/download', auth, AIController.downloadKnowledgeDocument);

// AI代理配置路由（需要认证）
router.get('/agent/config', auth, AIController.getAgentConfig);
router.put('/agent/config', auth, AIController.updateAgentConfig);
router.post('/agent/activate', auth, AIController.activateAgent);
router.post('/agent/deactivate', auth, AIController.deactivateAgent);

// 公开AI代理路由（不需要认证）
router.get('/agents/public', AIController.getPublicAgents);

// 访问特定用户AI代理（需要认证以检查权限）
router.get('/agents/user/:userId', auth, AIController.getUserAgent);

module.exports = router;
