<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/api';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const profile = ref(null);
const loading = ref(true);

// 编辑模态框状态
const showEditModal = ref(false);
const editForm = reactive({ gender: '', age: '' });
const saving = ref(false);

// 计算属性
const isOwnProfile = computed(() => auth.user && auth.user.id == (profile.value?.authorId));
const currentUserId = computed(() => auth.user?.id);

// 检查我是否关注了这个用户
const isFollowing = computed(() => {
  if (!profile.value || !profile.value.followerUsers || !currentUserId.value) return false;
  // 后端返回的是 long[]，在 JS 中转为 Array
  return profile.value.followerUsers.includes(currentUserId.value);
});

const fetchProfile = async () => {
  const targetId = route.params.id || auth.user?.id;
  if(!targetId) return;
  
  loading.value = true;
  try {
    const res = await api.get(`/user/${targetId}`);
    profile.value = res.data;
    
    // 初始化编辑表单
    editForm.gender = profile.value.gender || 'UNKNOWN';
    editForm.age = profile.value.age || '';
  } catch(e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

// 关注/取关逻辑
const toggleFollow = async () => {
  if (!auth.isAuthenticated) return router.push('/login');
  
  // 乐观更新 UI (Optimistic UI Update)
  const wasFollowing = isFollowing.value;
  if (wasFollowing) {
     profile.value.followers--;
     profile.value.followerUsers = profile.value.followerUsers.filter(id => id !== currentUserId.value);
  } else {
     profile.value.followers++;
     profile.value.followerUsers.push(currentUserId.value);
  }

  try {
    // 后端接口：POST /follow/{id} 返回布尔值 (true=关注成功, false=取关成功)
    await api.post(`/user/follow/${profile.value.authorId}`);
  } catch (e) {
    // 失败回滚
    await fetchProfile();
    alert('Action failed');
  }
};

// 保存个人资料
const saveProfile = async () => {
  saving.value = true;
  try {
    // PUT /user/profile?gender=...&age=...
    await api.put('/user/profile', null, {
      params: {
        gender: editForm.gender,
        age: editForm.age
      }
    });
    showEditModal.value = false;
    await fetchProfile(); // 刷新数据
  } catch (e) {
    alert('Update failed');
  } finally {
    saving.value = false;
  }
};

const openEdit = () => {
    editForm.gender = profile.value.gender || 'UNKNOWN';
    editForm.age = profile.value.age || 18;
    showEditModal.value = true;
};

onMounted(fetchProfile);
</script>

<template>
  <div v-if="loading" class="min-h-screen bg-darker flex items-center justify-center">
     <div class="animate-pulse text-indigo-400 font-mono">LOADING PROFILE...</div>
  </div>

  <div v-else-if="profile" class="min-h-screen bg-darker pt-24 pb-20 px-4">
     
     <!-- 主卡片 -->
     <div class="max-w-4xl mx-auto glass-panel rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
        <!-- 背景装饰 -->
        <div class="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent"></div>
        <div class="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]"></div>
        
        <div class="relative z-10">
           <!-- 头像 -->
           <div class="w-32 h-32 mx-auto bg-gradient-to-tr from-indigo-400 to-pink-500 rounded-full mb-6 p-1 shadow-2xl shadow-indigo-500/30">
              <div class="w-full h-full bg-surface rounded-full flex items-center justify-center text-5xl font-bold text-white">
                  {{ profile.authorName.charAt(0).toUpperCase() }}
              </div>
           </div>
           
           <h1 class="text-4xl font-bold mb-2 text-white">{{ profile.authorName }}</h1>
           <div class="flex justify-center gap-3 mb-8">
               <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono text-xs">
                  ID: {{ profile.authorId }}
               </span>
               <span v-if="profile.gender !== 'UNKNOWN'" class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono text-xs">
                  {{ profile.gender }}
               </span>
               <span v-if="profile.age" class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono text-xs">
                  {{ profile.age }} YO
               </span>
           </div>

           <!-- 关注数据 -->
           <div class="flex justify-center gap-16 mb-10">
              <div class="flex flex-col items-center">
                 <span class="text-4xl font-bold text-white transition-all">{{ profile.followers }}</span>
                 <span class="text-xs text-slate-500 uppercase tracking-widest mt-1">Followers</span>
              </div>
              <div class="w-px bg-white/10 h-12"></div>
              <div class="flex flex-col items-center">
                 <span class="text-4xl font-bold text-white">{{ profile.following }}</span>
                 <span class="text-xs text-slate-500 uppercase tracking-widest mt-1">Following</span>
              </div>
           </div>

           <!-- 操作按钮 -->
           <div v-if="isOwnProfile" class="flex gap-4 justify-center">
               <button @click="openEdit" class="px-8 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all font-bold text-white backdrop-blur-md flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Edit Profile
               </button>
           </div>
           
           <div v-else class="flex gap-4 justify-center">
               <button 
                 @click="toggleFollow" 
                 class="px-8 py-3 rounded-xl transition-all font-bold text-white shadow-lg flex items-center gap-2 min-w-[160px] justify-center"
                 :class="isFollowing ? 'bg-surface border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30'"
               >
                  <span v-if="isFollowing">Following</span>
                  <span v-else>Follow Chef</span>
               </button>
           </div>
        </div>
     </div>
     
     <!-- 编辑模态框 -->
     <transition name="fade">
       <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div class="w-full max-w-md bg-[#1e293b] rounded-2xl p-6 border border-white/10 shadow-2xl transform transition-all">
             <h2 class="text-xl font-bold text-white mb-6">Edit Profile</h2>
             
             <div class="space-y-4 mb-8">
                <div>
                   <label class="text-xs text-slate-500 uppercase font-bold mb-2 block">Gender</label>
                   <select v-model="editForm.gender" class="w-full bg-black/30 text-white rounded-lg px-4 py-3 border border-white/10 outline-none focus:border-indigo-500">
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="UNKNOWN">Hidden</option>
                   </select>
                </div>
                <div>
                   <label class="text-xs text-slate-500 uppercase font-bold mb-2 block">Age</label>
                   <input v-model="editForm.age" type="number" class="w-full bg-black/30 text-white rounded-lg px-4 py-3 border border-white/10 outline-none focus:border-indigo-500" />
                </div>
             </div>
             
             <div class="flex gap-3">
                <button @click="showEditModal = false" class="flex-1 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition-colors">Cancel</button>
                <button @click="saveProfile" :disabled="saving" class="flex-1 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-lg shadow-indigo-500/20">
                   {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
             </div>
          </div>
       </div>
     </transition>

  </div>
</template>

<style scoped>
/* 简单的淡入淡出动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>