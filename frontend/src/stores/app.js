import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const loading = ref(false)
  const sidebar = ref({
    opened: true,
    withoutAnimation: false
  })
  const device = ref('desktop')
  const size = ref('default')

  // 设置加载状态
  function setLoading(status) {
    loading.value = status
  }

  // 切换侧边栏
  function toggleSidebar() {
    sidebar.value.opened = !sidebar.value.opened
    sidebar.value.withoutAnimation = false
  }

  // 关闭侧边栏
  function closeSidebar(withoutAnimation) {
    sidebar.value.opened = false
    sidebar.value.withoutAnimation = withoutAnimation
  }

  // 设置设备类型
  function setDevice(type) {
    device.value = type
  }

  // 设置组件大小
  function setSize(val) {
    size.value = val
  }

  return {
    // 状态
    loading,
    sidebar,
    device,
    size,
    
    // 方法
    setLoading,
    toggleSidebar,
    closeSidebar,
    setDevice,
    setSize
  }
})
