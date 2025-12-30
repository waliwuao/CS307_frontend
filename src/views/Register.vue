<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const form = reactive({
  name: '',
  password: '',
  gender: 'UNKNOWN',
  birthday: '2000-01-01'
});
const loading = ref(false);
const resultId = ref(null);

const handleRegister = async () => {
  loading.value = true;
  try {
    const id = await auth.register(form);
    if (id !== -1) {
      resultId.value = id;
    } else {
      alert('Registration Failed: Invalid Data or Name Taken');
    }
  } catch (e) {
    alert('System Error');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-900/30 to-purple-900/30 rounded-full blur-[100px]"></div>

    <div class="w-full max-w-lg p-8 glass-panel rounded-2xl relative z-10 animate-fade-in border border-white/10">
      <div v-if="!resultId">
        <div class="text-center mb-8">
           <h2 class="text-2xl font-bold mb-2">Join the Community</h2>
           <p class="text-slate-400">Create your culinary identity</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
             <div>
               <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Display Name</label>
               <input v-model="form.name" type="text" required class="input-field" placeholder="Chef Name" />
             </div>
             <div>
               <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Password</label>
               <input v-model="form.password" type="password" required class="input-field" placeholder="••••••••" />
             </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Gender</label>
              <div class="relative">
                 <select v-model="form.gender" class="input-field appearance-none cursor-pointer">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="UNKNOWN">Unknown</option>
                 </select>
                 <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">▼</div>
              </div>
            </div>
            <div>
              <label class="text-xs font-bold uppercase text-slate-500 mb-1 block">Birthday</label>
              <input v-model="form.birthday" type="date" required class="input-field" />
            </div>
          </div>

          <button type="submit" :disabled="loading" class="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.01] transition-transform text-white">
            {{ loading ? 'Processing...' : 'Register Account' }}
          </button>
        </form>
      </div>

      <div v-else class="text-center space-y-8 py-8">
        <div class="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
          <svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <div>
            <h3 class="text-2xl font-bold text-white mb-2">Account Created</h3>
            <p class="text-slate-400">Your digital kitchen is ready.</p>
        </div>
        <div class="bg-black/30 p-6 rounded-xl border border-white/10">
          <p class="text-xs text-slate-500 uppercase tracking-widest mb-2">Your Login ID</p>
          <p class="text-5xl font-mono text-indigo-400 font-bold tracking-wider">{{ resultId }}</p>
        </div>
        <button @click="router.push('/login')" class="w-full py-3.5 rounded-xl bg-white text-dark font-bold hover:bg-slate-200 transition-colors">
          Proceed to Login
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply w-full px-4 py-3 rounded-xl bg-dark/50 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors text-white;
}
</style>