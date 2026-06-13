import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import LoginPage from '@/modules/auth/pages/LoginPage.vue';
import RegisterPage from '@/modules/auth/pages/RegisterPage.vue';
import { authGuard } from '@/router/guards';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'register',
            component: RegisterPage,
            meta: { guest: true, layout: 'auth' },
        },
        {
            path: '/register',
            redirect: { name: 'register' },
        },
        {
            path: '/inicio',
            name: 'home',
            component: HomePage,
        },
        {
            path: '/login',
            name: 'login',
            component: LoginPage,
            meta: { guest: true },
        },
    ],
});

router.beforeEach(authGuard);

export default router;
