<template>
    <component :is="layoutComponent">
        <router-view />
    </component>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/shared/components/AppLayout.vue';

const route = useRoute();

const layoutComponent = computed(() => (
    route.meta.layout === 'auth' ? 'div' : AppLayout
));
</script>
