<script setup>
import { reactive, ref } from 'vue';
import api from '@/api';
import { useRouter } from 'vue-router';

const router = useRouter();
const submitting = ref(false);

const form = reactive({
  name: '',
  description: '',
  category: '',
  cookTime: 'PT30M',
  prepTime: 'PT15M',
  recipeYield: '4 servings',
  recipeServings: 4,
  calories: 0,
  recipeIngredientParts: []
});

const ingredientsInput = ref('');

const handleSubmit = async () => {
  submitting.value = true;
  form.recipeIngredientParts = ingredientsInput.value.split(',').map(i => i.trim()).filter(i => i);
  
  try {
    const res = await api.post('/recipe', form);
    router.push(`/recipe/${res.data}`);
  } catch (e) {
    alert('Creation failed');
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-2 text-white">Create Recipe</h1>
    <p class="text-slate-400 mb-8">Share your culinary masterpiece with the world</p>
    
    <form @submit.prevent="handleSubmit" class="glass-panel p-8 rounded-2xl space-y-8 border border-white/10">
      <div>
        <label class="label">Dish Name</label>
        <input v-model="form.name" type="text" class="input-field text-xl font-bold" placeholder="e.g., Truffle Risotto" required />
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div>
            <label class="label">Category</label>
            <input v-model="form.category" type="text" class="input-field" placeholder="e.g., Italian, Dinner" />
         </div>
         <div>
            <label class="label">Servings</label>
            <input v-model="form.recipeServings" type="number" class="input-field" />
         </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div>
            <label class="label">Cook Time (ISO 8601)</label>
            <input v-model="form.cookTime" type="text" placeholder="PT1H" class="input-field font-mono" />
         </div>
         <div>
            <label class="label">Prep Time</label>
            <input v-model="form.prepTime" type="text" placeholder="PT30M" class="input-field font-mono" />
         </div>
      </div>

      <div>
        <label class="label">Ingredients (comma separated)</label>
        <textarea v-model="ingredientsInput" class="input-field min-h-[100px]" placeholder="Flour, Eggs, Milk, Vanilla Extract..."></textarea>
      </div>

      <div>
        <label class="label">Description & Method</label>
        <textarea v-model="form.description" class="input-field min-h-[200px]" placeholder="Describe the process in detail..." required></textarea>
      </div>

      <div class="p-6 bg-black/20 rounded-xl border border-white/5">
        <h4 class="text-slate-300 mb-4 font-bold text-sm uppercase tracking-wider">Nutrition Facts (Optional)</h4>
        <div class="grid grid-cols-2 gap-4">
           <div>
               <label class="text-xs text-slate-500 block mb-1">Calories</label>
               <input v-model="form.calories" type="number" class="input-field" />
           </div>
           <!-- Add more nutrition fields as needed -->
        </div>
      </div>

      <button type="submit" :disabled="submitting" class="w-full py-4 bg-white text-darker rounded-xl font-bold hover:bg-slate-200 transition-all text-lg shadow-lg shadow-white/10">
         {{ submitting ? 'Publishing...' : 'Publish Recipe' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.label { @apply block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wider; }
.input-field { @apply w-full px-4 py-3 rounded-xl bg-dark/50 border border-white/10 focus:border-indigo-500 outline-none transition-colors text-white placeholder-slate-600; }
</style>