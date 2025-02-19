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
      path: '/',
      name: 'showWellLog',
      component: () => import('../views/WellLogWatch.vue'),
    },
  ],
})

export default router
