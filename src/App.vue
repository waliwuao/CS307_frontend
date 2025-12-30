<script setup>
import NavBar from '@/components/NavBar.vue';
</script>

<template>
  <div class="min-h-screen bg-darker text-slate-200 font-sans selection:bg-indigo-500 selection:text-white">
    <NavBar />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>