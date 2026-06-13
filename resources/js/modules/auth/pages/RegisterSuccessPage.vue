<template>
    <AuthPageShell>
        <!-- Brand -->
        <div class="mb-8 flex items-center justify-center gap-3">
            <span class="material-symbols-outlined text-[40px] text-primary">medical_services</span>
            <h1 class="text-2xl font-bold text-primary">
                PulseCare Medical
            </h1>
        </div>

        <div class="overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-sm md:p-8">
            <div class="text-center">
                <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <span class="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                </div>

                <h2 class="mb-2 text-[32px] font-semibold leading-10 tracking-tight text-on-surface">
                    ¡Registro exitoso!
                </h2>
                <p class="mb-6 text-base text-on-surface-variant">
                    El paciente ha sido registrado correctamente en el hospital indicado.
                </p>

                <div
                    v-if="registeredUser"
                    class="mb-8 rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4 text-left"
                >
                    <p class="mb-3 text-sm font-semibold text-on-surface-variant">
                        Resumen del registro
                    </p>
                    <dl class="space-y-2 text-sm">
                        <div class="flex justify-between gap-4">
                            <dt class="text-on-surface-variant">
                                Nombre
                            </dt>
                            <dd class="font-medium text-on-surface">
                                {{ registeredUser.name }}
                            </dd>
                        </div>
                        <div class="flex justify-between gap-4">
                            <dt class="text-on-surface-variant">
                                Correo
                            </dt>
                            <dd class="font-medium text-on-surface">
                                {{ registeredUser.email }}
                            </dd>
                        </div>
                        <div
                            v-if="registeredUser.roles?.[0]"
                            class="flex justify-between gap-4"
                        >
                            <dt class="text-on-surface-variant">
                                Rol asignado
                            </dt>
                            <dd class="font-medium text-on-surface">
                                {{ registeredUser.roles[0].name }}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div>
                    <button
                        type="button"
                        class="w-full rounded-lg bg-primary-container py-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary active:scale-[0.98]"
                        @click="registerAgain"
                    >
                        Registrar otro paciente
                    </button>
                </div>
            </div>
        </div>

        <footer class="mt-8 px-6 text-center">
            <p class="text-xs font-semibold text-on-surface-variant opacity-70">
                © 2024 PulseCare Medical Systems. HIPAA Compliant Environment.
            </p>
        </footer>
    </AuthPageShell>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AuthPageShell from '@/modules/auth/layouts/AuthPageShell.vue';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const auth = useAuthStore();

const registeredUser = computed(() => auth.user);

onMounted(() => {
    if (! auth.token || ! auth.user) {
        router.replace({ name: 'register' });
    }
});

function registerAgain() {
    auth.clearSession();
    router.push({ name: 'register' });
}
</script>
