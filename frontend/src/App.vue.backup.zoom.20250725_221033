<template>
  <div id="app">
    <AppLayout v-if="showLayout" />
    <router-view v-else />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const userStore = useUserStore()

// 是否显示布局
const showLayout = computed(() => {
  const noLayoutRoutes = ['Login', 'Register']
  return !noLayoutRoutes.includes(route.name)
})

// 初始化用户信息
onMounted(async () => {
  if (userStore.token) {
    try {
      await userStore.fetchUserInfo()
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
})
</script>

<style>
#app {
  height: 100%;
}
</style>
