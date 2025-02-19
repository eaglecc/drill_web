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
      path: '/',
      name: 'logPredict',
      component: () => import('../views/WellLogPredicate.vue'),
    },
  ],
})

export default router
