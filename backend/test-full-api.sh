#!/bin/bash

BASE_URL="http://localhost:3000"

echo "🚀 开始测试 AuralCanvas API"
echo "========================="

# 测试健康检查
echo "1️⃣ 测试健康检查..."
curl -s "$BASE_URL/api/health" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/health"
echo -e "\n"

# 测试认证模块
echo "2️⃣ 测试认证模块..."
curl -s "$BASE_URL/api/auth/test" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/auth/test"
echo -e "\n"

# 测试用户注册
echo "3️⃣ 测试用户注册..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser01",
    "email": "test01@auralcanvas.fun",
    "password": "123456"
  }')

echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo -e "\n"

# 从注册响应中提取token（如果成功）
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token' 2>/dev/null)

# 测试用户登录
echo "4️⃣ 测试用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser01",
    "password": "123456"
  }')

echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
echo -e "\n"

# 如果登录成功，更新token
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)
fi

# 测试帖子接口
echo "5️⃣ 测试帖子列表..."
curl -s "$BASE_URL/api/posts/test" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/posts/test"
echo -e "\n"

# 测试用户接口
echo "6️⃣ 测试用户接口..."
curl -s "$BASE_URL/api/users/test" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/users/test"
echo -e "\n"

echo "✅ API测试完成！"

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "🔑 获得的用户Token: $TOKEN"
    echo "💡 可以使用此token进行后续的认证测试"
fi
