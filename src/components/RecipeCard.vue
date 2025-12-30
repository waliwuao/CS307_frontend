<script setup>
import { computed } from 'vue';
const props = defineProps(['recipe']);

// Generate a unique gradient class based on recipe ID
const gradientClass = computed(() => {
  const variants = [
    'from-pink-500 via-rose-500 to-yellow-500',
    'from-indigo-400 via-cyan-400 to-teal-400',
    'from-purple-500 via-violet-500 to-indigo-500',
    'from-emerald-400 via-teal-500 to-cyan-500',
    'from-orange-400 via-amber-500 to-yellow-400'
  ];
  return variants[props.recipe.recipeId % variants.length];
});
</script>

<template>
  <div class="group relative bg-surface rounded-xl overflow-hidden shadow-lg border border-white/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
    
    <!-- Compact Header (Reduced Size) -->
    <div class="h-24 relative overflow-hidden bg-darker shrink-0">
       <div :class="`absolute inset-0 bg-gradient-to-br opacity-80 ${gradientClass} transition-transform duration-700 group-hover:scale-110`"></div>
       <div class="absolute inset-0 bg-grid-pattern opacity-30"></div>
       
       <div class="absolute bottom-3 left-4">
          <span class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur-md text-white rounded border border-white/10">
            {{ recipe.recipeCategory || 'General' }}
          </span>
       </div>
    </div>
    
    <div class="p-5 flex-1 flex flex-col relative bg-surface/50 backdrop-blur-sm">
      <div class="mb-3">
        <div class="flex justify-between items-start gap-2">
          <h3 class="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
            {{ recipe.name }}
          </h3>
          <div class="flex items-center text-yellow-400 text-xs shrink-0 bg-white/5 px-1.5 py-0.5 rounded">
            <span>★ {{ recipe.aggregatedRating ? recipe.aggregatedRating.toFixed(1) : '-' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Text Priority: Description -->
      <p class="text-slate-400 text-xs line-clamp-4 leading-relaxed mb-4 flex-1">
        {{ recipe.description || 'No description provided.' }}
      </p>
      
      <div class="flex items-center justify-between pt-3 border-t border-white/10 mt-auto">
        <div class="flex items-center space-x-2">
          <div class="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-white border border-white/10">
             {{ recipe.authorName.charAt(0).toUpperCase() }}
          </div>
          <span class="text-[11px] text-slate-300 font-medium truncate max-w-[80px]">{{ recipe.authorName }}</span>
        </div>
        <div class="text-[10px] text-slate-500 font-mono">
          {{ recipe.reviewCount }} REVIEWS
        </div>
      </div>
    </div>
  </div>
</template>