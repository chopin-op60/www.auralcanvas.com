<template>
  <div class="error-page">
    <div class="error-content">
      <h1>404</h1>
      <p>页面不存在</p>
      <el-button type="primary" @click="$router.push('/home')">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  
  .error-content {
    text-align: center;
    
    h1 {
      font-size: 6rem;
      color: #409EFF;
      margin-bottom: 20px;
    }
    
    p {
      font-size: 1.5rem;
      color: #606266;
      margin-bottom: 30px;
    }
  }
}
</style>
