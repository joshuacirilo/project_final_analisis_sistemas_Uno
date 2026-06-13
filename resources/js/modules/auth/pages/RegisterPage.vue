<template>
    <AuthPageShell>
        <template #alert>
            <Transition name="alert">
                <div
                    v-if="successMessage"
                    class="flex items-center gap-2 rounded-xl border border-green-200 bg-green-100 px-6 py-4 text-green-800 shadow-lg"
                    role="status"
                >
                    <span class="material-symbols-outlined text-green-600">check_circle</span>
                    <span class="text-sm font-medium">{{ successMessage }}</span>
                </div>
            </Transition>

            <Transition name="alert">
                <div
                    v-if="globalError"
                    class="mt-3 flex items-center gap-2 rounded-xl border border-outline-variant bg-error-container px-6 py-4 text-on-error-container shadow-lg"
                    role="alert"
                >
                    <span class="material-symbols-outlined">report</span>
                    <span class="flex-1 text-sm font-medium">{{ globalError }}</span>
                    <button
                        type="button"
                        class="ml-auto text-on-error-container transition-opacity hover:opacity-70"
                        aria-label="Cerrar alerta"
                        @click="globalError = ''"
                    >
                        <span class="material-symbols-outlined text-base">close</span>
                    </button>
                </div>
            </Transition>
        </template>

        <!-- Brand -->
        <div class="mb-8 flex items-center justify-center gap-3">
            <span class="material-symbols-outlined text-[40px] text-primary">medical_services</span>
            <h1 class="text-2xl font-bold text-primary">
                PulseCare Medical
            </h1>
        </div>

        <!-- Card -->
        <div class="overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-sm md:p-8">
            <div class="mb-8 text-center">
                <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-container">
                    <span class="material-symbols-outlined text-on-primary-container">security</span>
                </div>
                <h2 class="mb-1 text-[32px] font-semibold leading-10 tracking-tight text-on-surface">
                    Crear cuenta
                </h2>
                <p class="text-base text-on-surface-variant">
                    Regístrate en el hospital correspondiente
                </p>
            </div>

            <form
                class="space-y-6"
                novalidate
                @submit.prevent="handleSubmit"
            >
                <!-- Tenant ID -->
                <div
                    class="auth-field space-y-1 transition-transform"
                    :class="{ 'scale-[1.01]': focusedField === 'tenantId' }"
                >
                    <label
                        class="text-sm font-medium text-on-surface"
                        for="tenant-id"
                    >
                        ID de tenant (UUID)
                    </label>
                    <input
                        id="tenant-id"
                        v-model="form.tenantId"
                        class="w-full rounded-lg border bg-surface px-4 py-2.5 text-base text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1"
                        :class="fieldBorderClass('tenantId')"
                        type="text"
                        placeholder="00000000-0000-4000-8000-000000000001"
                        autocomplete="off"
                        @focus="focusedField = 'tenantId'"
                        @blur="onFieldBlur('tenantId')"
                    >
                    <p
                        v-if="errors.tenantId"
                        class="flex items-center gap-1 text-xs font-semibold text-error"
                    >
                        <span class="material-symbols-outlined text-sm">error</span>
                        {{ errors.tenantId }}
                    </p>
                    <p
                        v-else
                        class="text-xs font-semibold text-on-surface-variant"
                    >
                        UUID del hospital al que te registras
                    </p>
                </div>

                <!-- Name -->
                <div
                    class="auth-field space-y-1 transition-transform"
                    :class="{ 'scale-[1.01]': focusedField === 'name' }"
                >
                    <label
                        class="text-sm font-medium text-on-surface"
                        for="full-name"
                    >
                        Nombre completo
                    </label>
                    <input
                        id="full-name"
                        v-model="form.name"
                        class="w-full rounded-lg border bg-surface px-4 py-2.5 text-base text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1"
                        :class="fieldBorderClass('name')"
                        type="text"
                        placeholder="María López"
                        autocomplete="name"
                        @focus="focusedField = 'name'"
                        @blur="onFieldBlur('name')"
                    >
                    <p
                        v-if="errors.name"
                        class="flex items-center gap-1 text-xs font-semibold text-error"
                    >
                        <span class="material-symbols-outlined text-sm">error</span>
                        {{ errors.name }}
                    </p>
                </div>

                <!-- Email -->
                <div
                    class="auth-field space-y-1 transition-transform"
                    :class="{ 'scale-[1.01]': focusedField === 'email' }"
                >
                    <label
                        class="text-sm font-medium text-on-surface"
                        for="email"
                    >
                        Correo electrónico
                    </label>
                    <input
                        id="email"
                        v-model="form.email"
                        class="w-full rounded-lg border bg-surface px-4 py-2.5 text-base text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1"
                        :class="fieldBorderClass('email')"
                        type="email"
                        placeholder="maria@example.com"
                        autocomplete="email"
                        @focus="focusedField = 'email'"
                        @blur="onFieldBlur('email')"
                    >
                    <p
                        v-if="errors.email"
                        class="flex items-center gap-1 text-xs font-semibold text-error"
                    >
                        <span class="material-symbols-outlined text-sm">error</span>
                        {{ errors.email }}
                    </p>
                </div>

                <!-- Password -->
                <div
                    class="auth-field space-y-1 transition-transform"
                    :class="{ 'scale-[1.01]': focusedField === 'password' }"
                >
                    <label
                        class="text-sm font-medium text-on-surface"
                        for="password"
                    >
                        Contraseña
                    </label>
                    <div class="relative">
                        <input
                            id="password"
                            v-model="form.password"
                            class="w-full rounded-lg border bg-surface py-2.5 pl-4 pr-12 text-base text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1"
                            :class="fieldBorderClass('password')"
                            :type="showPassword ? 'text' : 'password'"
                            placeholder="Ingresa tu contraseña"
                            autocomplete="new-password"
                            @focus="focusedField = 'password'"
                            @blur="onFieldBlur('password')"
                        >
                        <button
                            type="button"
                            class="absolute top-1/2 right-4 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
                            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                            @click="showPassword = !showPassword"
                        >
                            <span class="material-symbols-outlined">
                                {{ showPassword ? 'visibility_off' : 'visibility' }}
                            </span>
                        </button>
                    </div>
                    <p
                        v-if="errors.password"
                        class="flex items-center gap-1 text-xs font-semibold text-error"
                    >
                        <span class="material-symbols-outlined text-sm">error</span>
                        {{ errors.password }}
                    </p>
                    <p
                        v-else
                        class="text-xs font-semibold text-on-surface-variant"
                    >
                        Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo
                    </p>
                </div>

                <!-- Confirm password -->
                <div
                    class="auth-field space-y-1 transition-transform"
                    :class="{ 'scale-[1.01]': focusedField === 'passwordConfirmation' }"
                >
                    <label
                        class="text-sm font-medium text-on-surface"
                        for="confirm-password"
                    >
                        Confirmar contraseña
                    </label>
                    <div class="relative">
                        <input
                            id="confirm-password"
                            v-model="form.passwordConfirmation"
                            class="w-full rounded-lg border bg-surface py-2.5 pl-4 pr-12 text-base text-on-surface transition-all placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-1"
                            :class="fieldBorderClass('passwordConfirmation')"
                            :type="showPasswordConfirmation ? 'text' : 'password'"
                            placeholder="Confirma tu contraseña"
                            autocomplete="new-password"
                            @focus="focusedField = 'passwordConfirmation'"
                            @blur="onFieldBlur('passwordConfirmation')"
                        >
                        <button
                            type="button"
                            class="absolute top-1/2 right-4 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-primary"
                            :aria-label="showPasswordConfirmation ? 'Ocultar confirmación' : 'Mostrar confirmación'"
                            @click="showPasswordConfirmation = !showPasswordConfirmation"
                        >
                            <span class="material-symbols-outlined">
                                {{ showPasswordConfirmation ? 'visibility_off' : 'visibility' }}
                            </span>
                        </button>
                    </div>
                    <p
                        v-if="errors.passwordConfirmation"
                        class="flex items-center gap-1 text-xs font-semibold text-error"
                    >
                        <span class="material-symbols-outlined text-sm">error</span>
                        {{ errors.passwordConfirmation }}
                    </p>
                </div>

                <!-- Submit -->
                <div class="pt-2">
                    <button
                        type="submit"
                        class="w-full rounded-lg bg-primary-container py-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                        :disabled="isSubmitting"
                    >
                        {{ isSubmitting ? 'Validando…' : 'Registrarse' }}
                    </button>
                </div>

                <!-- Login link -->
                <div class="pt-2 text-center">
                    <router-link
                        class="text-sm font-medium text-primary transition-all hover:underline"
                        :to="{ name: 'login' }"
                    >
                        ¿Ya tienes una cuenta? Inicia sesión
                    </router-link>
                </div>
            </form>
        </div>

        <!-- Footer -->
        <footer class="mt-8 px-6 text-center">
            <p class="text-xs font-semibold text-on-surface-variant opacity-70">
                © 2024 PulseCare Medical Systems. HIPAA Compliant Environment.
            </p>
            <div class="mt-2 flex justify-center gap-6">
                <a
                    class="text-xs font-semibold text-on-surface-variant underline decoration-outline-variant hover:text-primary"
                    href="#"
                    @click.prevent
                >
                    Privacy Policy
                </a>
                <a
                    class="text-xs font-semibold text-on-surface-variant underline decoration-outline-variant hover:text-primary"
                    href="#"
                    @click.prevent
                >
                    Terms of Service
                </a>
            </div>
        </footer>
    </AuthPageShell>
</template>

<script setup>
import { reactive, ref } from 'vue';
import AuthPageShell from '@/modules/auth/layouts/AuthPageShell.vue';
import { validateRegisterForm } from '@/modules/auth/composables/useRegisterValidation';

const DEMO_TENANT_ID = '00000000-0000-4000-8000-000000000001';

const form = reactive({
    tenantId: DEMO_TENANT_ID,
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
});

const errors = reactive({
    tenantId: '',
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
});

const focusedField = ref('');
const showPassword = ref(false);
const showPasswordConfirmation = ref(false);
const isSubmitting = ref(false);
const successMessage = ref('');
const globalError = ref('');

function clearErrors() {
    Object.keys(errors).forEach((key) => {
        errors[key] = '';
    });
}

function fieldBorderClass(field) {
    if (errors[field]) {
        return 'border-error focus:border-error focus:ring-error';
    }

    return 'border-outline-variant focus:border-primary focus:ring-primary';
}

function validateField(field) {
    const result = validateRegisterForm(form);
    errors[field] = result.errors[field] ?? '';
}

function onFieldBlur(field) {
    focusedField.value = '';
    validateField(field);
}

function handleSubmit() {
    clearErrors();
    successMessage.value = '';
    globalError.value = '';
    isSubmitting.value = true;

    const { errors: validationErrors, isValid } = validateRegisterForm(form);

    Object.assign(errors, {
        tenantId: validationErrors.tenantId ?? '',
        name: validationErrors.name ?? '',
        email: validationErrors.email ?? '',
        password: validationErrors.password ?? '',
        passwordConfirmation: validationErrors.passwordConfirmation ?? '',
    });

    setTimeout(() => {
        isSubmitting.value = false;

        if (! isValid) {
            return;
        }

        // Simulación UI: tenant demo válido → éxito; otro UUID → error global
        if (form.tenantId.trim() !== DEMO_TENANT_ID) {
            globalError.value = 'El hospital indicado no existe';
            errors.tenantId = 'El hospital indicado no existe';

            return;
        }

        successMessage.value = 'Usuario registrado correctamente';
    }, 400);
}
</script>

<style scoped>
.alert-enter-active,
.alert-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}

.alert-enter-from,
.alert-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
