<template>
    <div class="auth-shell">
        <div
            class="medical-pattern pointer-events-none fixed inset-0"
            aria-hidden="true"
        />

        <div
            v-if="$slots.alert"
            class="fixed top-8 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2"
        >
            <slot name="alert" />
        </div>

        <main class="relative z-10 flex min-h-screen w-full items-center justify-center overflow-x-hidden p-4 md:p-6">
            <div class="w-full max-w-[520px]">
                <slot />
            </div>
        </main>
    </div>
</template>

<script setup>
</script>

<style scoped>
.auth-shell {
    background-color: var(--color-background, #f8f9ff);
    color: var(--color-on-surface, #011d35);
    min-height: max(884px, 100dvh);
}
</style>
