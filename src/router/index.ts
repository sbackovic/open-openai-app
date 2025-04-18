import {createRouter, createWebHistory} from 'vue-router'
import Chat from '../components/Chat.vue';

const routes = [
  {
    path: '/',
    name: 'Chat',
    component: Chat,
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router
