import { createRouter, createWebHistory } from 'vue-router'
import DataSetManage from '../views/DataSetManageView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dataset',
      name: 'dataset',
      component: DataSetManage,
    },
    {
      path: '/newTask',
      name: 'logPredict',
      component: () => import('../views/WellLogPredicate.vue'),
    },
    {
      path: '/showWellLog',
      name: 'showWellLog',
      component: () => import('../views/WellLogShow.vue'),
    },
    {
      path: '/watchWellLog',
      name: 'watchWellLog',
      component: () => import('../views/WellLogWatch.vue'),
    },
    {
      path: '/showTasks',
      name: 'showTasks',
      component: () => import('../views/TaskResultShow.vue'),
    },
  ],
})

export default router
