import { createRouter, createWebHistory } from 'vue-router';
import RegisterPage from '@/modules/auth/pages/RegisterPage.vue';
import RegisterSuccessPage from '@/modules/auth/pages/RegisterSuccessPage.vue';
import { authGuard } from '@/router/guards';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'register',
            component: RegisterPage,
        },
        {
            path: '/register',
            redirect: { name: 'register' },
        },
        {
            path: '/registro-exitoso',
            name: 'register-success',
            component: RegisterSuccessPage,
        },
        {
            path: '/inicio',
            redirect: { name: 'register' },
        },
        {
            path: '/login',
            redirect: { name: 'register' },
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: { name: 'register' },
        },
    ],
});

router.beforeEach(authGuard);

export default router;
