import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import { Storage } from '@ionic/storage';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/TabsPage',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tab3'
      },
      {
        path: 'takePicture',
        component: () => import('@/views/TakePicturePage.vue'),
        beforeEnter: async () => { return await isLogged() }
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

async function isLogged() {
  const storage = new Storage();
  await storage.create();


  const profile = await fetch(process.env.VUE_APP_BACKEND_URL + '/api/users/profile', {
    method: "GET",
    headers: {
        "Authorization": "Bearer " + await storage.get('userAccessToken'),
    }
  })
  if (profile.ok) {
    return true;
  } else {
    return 'login';
  }
}

export default router
