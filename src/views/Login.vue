<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const id = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const success = await auth.login(id.value, password.value);
    if (success) {
      router.push('/');
    } else {
      error.value = 'Invalid Credentials';
    }
  } catch (e) {
    error.value = 'Login Failed';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden">
    <!-- Dynamic Background -->
    <div class="absolute inset-0 bg-darker">
       <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
       <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-blob"></div>
    </div>

    <div class="w-full max-w-md p-8 glass-panel rounded-2xl relative z-10 animate-fade-in border border-white/10">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
           </svg>
        </div>
        <h2 class="text-2xl font-bold text-white">Welcome Back</h2>
        <p class="text-slate-400">Enter your credentials to access</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Author ID</label>
          <input v-model="id" type="number" required class="w-full px-4 py-3 rounded-xl bg-dark/50 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors text-white" placeholder="Your ID" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider">Password</label>
          <input v-model="password" type="password" required class="w-full px-4 py-3 rounded-xl bg-dark/50 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors text-white" placeholder="••••••••" />
        </div>

        <div v-if="error" class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{{ error }}</div>

        <button type="submit" :disabled="loading" class="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="loading">Authenticating...</span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="mt-8 text-center pt-6 border-t border-white/5">
        <router-link to="/register" class="text-sm text-slate-400 hover:text-white transition-colors">Create a new account</router-link>
      </div>
    </div>
  </div>
</template>