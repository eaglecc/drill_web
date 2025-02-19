<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

body {
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>

<style scoped>
/* 组件局部样式 */
</style>