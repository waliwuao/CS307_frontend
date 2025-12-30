<script setup>
import { ref, onMounted, reactive } from 'vue';
import api from '@/api';
import RecipeCard from '@/components/RecipeCard.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const recipes = ref([]);
const loading = ref(true);

const searchParams = reactive({
  keyword: '',
  category: '',
  sort: ''
});

const fetchRecipes = async () => {
  loading.value = true;
  try {
    const res = await api.get('/recipe/search', {
      params: {
        page: 1,
        size: 20,
        ...searchParams
      }
    });
    recipes.value = res.data.items;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRecipes);
</script>

<template>
  <div class="pb-20 overflow-hidden">
    <!-- Hero Section (No Image, pure CSS Art) -->
    <div class="relative min-h-[500px] flex items-center justify-center overflow-hidden">
      <!-- Abstract Background -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-blob"></div>
      <div class="absolute bottom-0 right-0 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div class="absolute inset-0 bg-grid-pattern opacity-20"></div>
      
      <div class="relative z-10 text-center max-w-4xl px-4">
        <div class="inline-block mb-4 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium animate-fade-in">
           ✨ The Future of Community Cooking
        </div>
        <h1 class="text-5xl md:text-8xl font-bold mb-6 animate-slide-up tracking-tight">
          Craft. Share. <br/><span class="gradient-text">Inspire.</span>
        </h1>
        <p class="text-xl text-slate-400 mb-10 max-w-2xl mx-auto animate-slide-up opacity-0" style="animation-delay: 0.1s; animation-fill-mode: forwards;">
          Explore a database of pure culinary knowledge. 
          <br>No distractions, just flavors.
        </p>
        
        <div class="flex flex-col md:flex-row gap-3 justify-center max-w-xl mx-auto animate-slide-up opacity-0" style="animation-delay: 0.2s; animation-fill-mode: forwards;">
          <input 
            v-model="searchParams.keyword" 
            @keyup.enter="fetchRecipes"
            type="text" 
            placeholder="Search for a recipe..."
            class="flex-1 px-6 py-4 rounded-xl bg-surface/80 backdrop-blur-md border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none text-white placeholder-slate-500 transition-all"
          />
          <button @click="fetchRecipes" class="px-8 py-4 rounded-xl bg-white text-darker font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
            Search
          </button>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div class="flex flex-col md:flex-row justify-between items-end mb-8 pb-4 border-b border-white/5">
        <div>
          <h2 class="text-3xl font-bold text-white">Latest Collections</h2>
          <p class="text-slate-400 mt-1">Discover what's cooking in the community</p>
        </div>
        <div class="flex gap-4 mt-4 md:mt-0">
            <select v-model="searchParams.sort" @change="fetchRecipes" class="bg-surface border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors hover:border-white/20">
                <option value="">Default Sort</option>
                <option value="rating_desc">Highest Rated</option>
                <option value="date_desc">Newest First</option>
                <option value="calories_asc">Low Calories</option>
            </select>
        </div>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="n in 8" :key="n" class="h-80 rounded-2xl bg-surface/50 animate-pulse border border-white/5"></div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <RecipeCard 
            v-for="recipe in recipes" 
            :key="recipe.recipeId" 
            :recipe="recipe" 
            @click="router.push(`/recipe/${recipe.recipeId}`)"
            class="cursor-pointer"
        />
      </div>
      
      <div v-if="!loading && recipes.length === 0" class="text-center py-20">
         <div class="text-6xl mb-4">🍳</div>
         <h3 class="text-xl font-bold text-white">No Recipes Found</h3>
         <p class="text-slate-400">Try adjusting your search criteria</p>
      </div>
    </div>
  </div>
</template>