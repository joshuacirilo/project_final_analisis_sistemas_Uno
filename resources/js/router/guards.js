export function authGuard(to, from, next) {
    const token = localStorage.getItem('auth_token');

    if (to.name === 'register' && token) {
        next({ name: 'register-success' });

        return;
    }

    if (to.name === 'register-success' && ! token) {
        next({ name: 'register' });

        return;
    }

    next();
}
