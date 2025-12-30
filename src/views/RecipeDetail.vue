<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import { useAuthStore } from '@/stores/auth';
import EnvelopeIntro from '@/components/EnvelopeIntro.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const recipe = ref(null);
const reviews = ref([]);

// 状态控制
const loading = ref(true);
const showEnvelope = ref(true);
const showContent = ref(false);
const submittingReview = ref(false);
const newReview = ref({ rating: 5, content: '' });

// 关注状态
const isFollowing = ref(false);
const followLoading = ref(false);

// 动态背景
const bgGradient = computed(() => {
  if(!recipe.value) return 'bg-darker';
  const id = recipe.value.recipeId;
  const variants = [
    'from-indigo-900/20 to-darker',
    'from-purple-900/20 to-darker',
    'from-rose-900/20 to-darker',
    'from-teal-900/20 to-darker'
  ];
  return variants[id % variants.length];
});

// 检查关注状态
const checkFollowStatus = async (authorId) => {
  if (!auth.isAuthenticated || !auth.user.id) return;
  if (auth.user.id == authorId) return; // 自己不能关注自己

  try {
    // 获取作者详情，查看其粉丝列表
    const res = await api.get(`/user/${authorId}`);
    const followerUsers = res.data.followerUsers || [];
    // 判断当前用户ID是否在作者的粉丝列表中
    isFollowing.value = followerUsers.includes(auth.user.id);
  } catch (e) {
    console.error("Failed to check follow status", e);
  }
};

const fetchDetails = async () => {
  try {
    const [recipeRes, reviewRes] = await Promise.all([
      api.get(`/recipe/${route.params.id}`),
      api.get(`/review/recipe/${route.params.id}`)
    ]);
    recipe.value = recipeRes.data;
    reviews.value = reviewRes.data.items;
    
    // 获取完食谱后，检查是否关注了作者
    if (recipe.value && recipe.value.authorId) {
        await checkFollowStatus(recipe.value.authorId);
    }

  } catch (e) {
    console.error(e);
    showEnvelope.value = false;
    showContent.value = true;
  } finally {
    loading.value = false;
  }
};

const toggleFollow = async () => {
  if (!auth.isAuthenticated) {
     if(confirm('Login required to follow authors. Go to login?')) {
         router.push({ name: 'Login', query: { redirect: route.fullPath } });
     }
     return;
  }
  
  if (recipe.value.authorId == auth.user.id) return;

  // 乐观更新 UI
  const originalState = isFollowing.value;
  isFollowing.value = !isFollowing.value;
  followLoading.value = true;

  try {
     await api.post(`/user/follow/${recipe.value.authorId}`);
     // 成功不需要做额外处理，UI已经更新
  } catch (e) {
     // 失败回滚
     isFollowing.value = originalState;
     alert('Follow action failed');
  } finally {
     followLoading.value = false;
  }
};

const onEnvelopeFinished = () => {
  showEnvelope.value = false;
  showContent.value = true;
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
};

const submitReview = async () => {
  if(!auth.isAuthenticated) {
     if(confirm('You need to login to post a review. Go to login page?')) {
        router.push({ name: 'Login', query: { redirect: route.fullPath } });
     }
     return;
  }
  
  submittingReview.value = true;
  try {
    await api.post('/review', newReview.value.content, {
      params: { recipeId: route.params.id, rating: newReview.value.rating },
      headers: { 'Content-Type': 'text/plain' }
    });
    newReview.value.content = '';
    await fetchDetails(); 
  } catch (e) {
    alert('Failed to post review');
  } finally {
    submittingReview.value = false;
  }
};

const formatDuration = (iso) => iso ? iso.replace('PT', '').toLowerCase() : '-';

onMounted(fetchDetails);
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center min-h-screen bg-darker">
  </div>

  <div v-else>
    <EnvelopeIntro 
      v-if="showEnvelope" 
      :title="recipe.name" 
      :category="recipe.recipeCategory" 
      :author="recipe.authorName" 
      @finish="onEnvelopeFinished" 
    />

    <transition name="fade-up">
      <div v-if="showContent" :class="`min-h-screen bg-gradient-to-b ${bgGradient} pb-20 pt-24 relative`">
        
        <div class="fixed top-24 left-4 z-40 md:left-8">
           <button @click="goBack" class="group flex items-center gap-2 px-4 py-2 rounded-full bg-surface/30 backdrop-blur-md border border-white/10 text-slate-300 hover:bg-surface/60 hover:text-white hover:border-indigo-500/50 transition-all duration-300 shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              <span class="text-sm font-medium">Back</span>
           </button>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div class="border-b border-white/10 pb-8 mb-8">
            <div class="flex flex-col md:flex-row gap-6 md:items-start justify-between">
               <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <span class="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                        {{ recipe.recipeCategory || 'Collection' }}
                    </span>
                    <span class="text-slate-500 text-xs">Published on {{ new Date(recipe.datePublished).toLocaleDateString() }}</span>
                  </div>
                  
                  <h1 class="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">{{ recipe.name }}</h1>
                  
                  <div class="flex flex-wrap items-center gap-6 text-slate-300 font-mono text-xs">
                    <div class="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                      <span class="text-indigo-400">PREP</span>
                      <span>{{ formatDuration(recipe.prepTime) }}</span>
                    </div>
                    <div class="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                       <span class="text-orange-400">COOK</span>
                       <span>{{ formatDuration(recipe.cookTime) }}</span>
                    </div>
                    <div class="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                       <span class="text-green-400">YIELD</span>
                       <span>{{ recipe.recipeYield }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-yellow-400">
                       <span class="text-lg">★</span>
                       <span class="font-bold">{{ recipe.aggregatedRating ? recipe.aggregatedRating.toFixed(1) : 'N/A' }}</span>
                       <span class="text-slate-500">({{ recipe.reviewCount }})</span>
                    </div>
                  </div>
               </div>
               
               <!-- Author Info & Follow Button -->
               <div class="flex items-center gap-4 bg-surface/80 p-3 pr-5 rounded-xl border border-white/10 shadow-lg">
                   <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:scale-105 transition-transform" @click="router.push(`/profile/${recipe.authorId}`)">
                       {{ recipe.authorName.charAt(0).toUpperCase() }}
                   </div>
                   <div class="text-sm cursor-pointer" @click="router.push(`/profile/${recipe.authorId}`)">
                       <p class="text-slate-400 text-[10px] uppercase tracking-wider">Author</p>
                       <p class="font-bold text-white hover:text-indigo-400 transition-colors">{{ recipe.authorName }}</p>
                   </div>
                   
                   <!-- 分割线 -->
                   <div class="w-px h-8 bg-white/10 mx-1"></div>

                   <!-- Follow Heart Button -->
                   <button 
                     @click="toggleFollow" 
                     :disabled="followLoading || (auth.isAuthenticated && auth.user.id == recipe.authorId)"
                     class="group relative flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-90"
                     :title="isFollowing ? 'Unfollow' : 'Follow'"
                   >
                     <svg 
                       xmlns="http://www.w3.org/2000/svg" 
                       viewBox="0 0 24 24" 
                       stroke-width="2" 
                       stroke="currentColor" 
                       class="w-6 h-6 transition-all duration-300"
                       :class="isFollowing 
                          ? 'fill-rose-500 stroke-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                          : 'fill-transparent stroke-slate-400 group-hover:stroke-rose-400'"
                     >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                     </svg>
                   </button>
               </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div class="lg:col-span-8 space-y-10">
              <section>
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <span class="w-1 h-6 bg-indigo-500 rounded-full"></span>
                   Preparation & Method
                </h3>
                <div class="text-slate-300 leading-relaxed text-base whitespace-pre-wrap font-light">
                   {{ recipe.description }}
                </div>
              </section>

              <section class="pt-10 border-t border-white/5">
                <h3 class="text-lg font-bold text-white mb-6">Reviews ({{ reviews.length }})</h3>
                
                <div class="mb-8">
                  <div class="bg-surface/30 p-4 rounded-xl border border-white/5">
                    <textarea v-model="newReview.content" placeholder="Write your review (Log in required)..." class="w-full bg-transparent outline-none text-white min-h-[80px] placeholder-slate-600 text-sm mb-3"></textarea>
                    <div class="flex justify-between items-center">
                       <div class="flex gap-1">
                          <button v-for="i in 5" :key="i" @click="newReview.rating = i" 
                            class="text-lg transition-transform hover:scale-110" 
                            :class="i <= newReview.rating ? 'text-yellow-400' : 'text-slate-700'">★</button>
                       </div>
                       <button @click="submitReview" :disabled="submittingReview" class="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-500 transition-colors">
                         Submit
                       </button>
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <div v-for="rev in reviews" :key="rev.reviewId" class="pb-4 border-b border-white/5 last:border-0">
                    <div class="flex justify-between items-center mb-2">
                      <span class="font-bold text-indigo-300 text-sm">{{ rev.authorName }}</span>
                      <span class="text-yellow-500 text-xs">★ {{ rev.rating }}</span>
                    </div>
                    <p class="text-slate-400 text-sm">{{ rev.review }}</p>
                  </div>
                </div>
              </section>
            </div>

            <div class="lg:col-span-4 space-y-8">
              <div class="bg-surface/40 rounded-2xl p-6 border border-white/5">
                 <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Ingredients</h3>
                 <ul class="space-y-3">
                    <li v-for="(ing, idx) in recipe.recipeIngredientParts" :key="idx" 
                        class="flex items-start gap-3 text-sm text-slate-300">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                        <span class="capitalize">{{ ing }}</span>
                    </li>
                 </ul>
              </div>

              <div class="bg-surface/40 rounded-2xl p-6 border border-white/5">
                <h3 class="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Nutrition</h3>
                <div class="grid grid-cols-2 gap-4">
                   <div class="p-3 bg-black/20 rounded-lg text-center">
                      <div class="text-lg font-bold text-white">{{ recipe.calories }}</div>
                      <div class="text-[10px] text-slate-500 uppercase">Calories</div>
                   </div>
                   <div class="p-3 bg-black/20 rounded-lg text-center">
                      <div class="text-lg font-bold text-white">{{ recipe.proteinContent }}g</div>
                      <div class="text-[10px] text-slate-500 uppercase">Protein</div>
                   </div>
                   <div class="p-3 bg-black/20 rounded-lg text-center">
                      <div class="text-lg font-bold text-white">{{ recipe.fatContent }}g</div>
                      <div class="text-[10px] text-slate-500 uppercase">Fat</div>
                   </div>
                   <div class="p-3 bg-black/20 rounded-lg text-center">
                      <div class="text-lg font-bold text-white">{{ recipe.carbohydrateContent }}g</div>
                      <div class="text-[10px] text-slate-500 uppercase">Carbs</div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style>
.fade-up-enter-active {
  transition: all 0.8s ease-out;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(40px);
}
</style>