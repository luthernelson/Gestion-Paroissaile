import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: 'reports/members',
        component: () => import('@/views/MembersReport.vue')
      },
      {
        path: 'reports/collections',
        component: () => import('@/views/CollectionsReport.vue')
      }
    ]
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
