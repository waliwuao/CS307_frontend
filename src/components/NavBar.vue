<script setup>
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const auth = useAuthStore();
const router = useRouter();
const currentUserId = computed(() => auth.user?.id);

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
</script>

<template>
  <nav class="fixed top-0 w-full z-50 glass-panel border-b border-white/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center cursor-pointer" @click="router.push('/')">
           <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 mr-2 flex items-center justify-center">
             <span class="font-bold text-white">S</span>
           </div>
          <span class="text-xl font-bold tracking-tighter text-white">SUSTC <span class="text-indigo-400">KITCHEN</span></span>
        </div>
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-8">
            <router-link to="/" class="hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-400">Discover</router-link>
            
            <template v-if="auth.isAuthenticated">
              <router-link to="/create" class="hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-400">New Recipe</router-link>
              <router-link :to="`/profile/${currentUserId}`" class="hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-400">Profile</router-link>
              <button @click="handleLogout" class="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all border border-white/10">
                Logout
              </button>
            </template>
            
            <template v-else>
               <router-link to="/login" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">
                 Sign In
               </router-link>
            </template>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <div class="h-16"></div>
</template>