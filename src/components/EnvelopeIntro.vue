<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps(['title', 'category', 'author']);
const emit = defineEmits(['finish']);

const isVisible = ref(true);

onMounted(() => {
  // 动画总时长大约 2.5秒
  // 0s-0.6s: 盖子打开
  // 0.6s-1.6s: 信纸抽出
  // 1.6s-2.0s: 悬停展示
  // 2.0s-2.5s: 整体淡出
  
  setTimeout(() => {
    isVisible.value = false;
    setTimeout(() => {
        emit('finish');
    }, 500); // 等待淡出动画完成
  }, 2500);
});
</script>

<template>
  <div class="envelope-overlay" :class="{ 'fade-out': !isVisible }">
    <div class="envelope-container">
      <div class="envelope">
        <div class="flap"></div>
        <div class="pocket"></div>
        <div class="letter">
          <div class="letter-content">
             <div class="stamp">SUSTC</div>
             <div class="text-xs text-slate-400 uppercase tracking-widest mb-1">Invitation</div>
             <h1 class="text-xl font-serif font-bold text-slate-800 mb-2">{{ title }}</h1>
             <div class="w-8 h-0.5 bg-indigo-500 mx-auto mb-2"></div>
             <p class="text-[10px] text-slate-500 uppercase">Chef {{ author }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 1. 全屏遮罩 */
.envelope-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #020617; /* Darker background */
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.5s ease;
}

.envelope-overlay.fade-out {
  opacity: 0;
  pointer-events: none;
}

/* 2. 信封容器 */
.envelope-container {
  position: relative;
  perspective: 1000px; /* 3D透视 */
}

.envelope {
  position: relative;
  width: 300px;
  height: 200px;
  background-color: #1e293b; /* 信封背面颜色 */
  border-radius: 0 0 10px 10px;
}

/* 3. 信封盖 (Flap) */
.flap {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-left: 150px solid transparent;
  border-right: 150px solid transparent;
  border-top: 110px solid #475569; /* 盖子颜色 */
  transform-origin: top;
  z-index: 20;
  animation: openFlap 0.6s ease-in-out forwards;
  animation-delay: 0.2s;
}

/* 4. 信封袋 (Pocket) */
.pocket {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 0;
  border-left: 150px solid transparent;
  border-right: 150px solid transparent;
  border-bottom: 110px solid #334155; /* 袋子颜色，比背面稍亮 */
  z-index: 10;
  border-radius: 0 0 10px 10px;
}

/* 5. 信纸 (Letter) */
.letter {
  position: absolute;
  bottom: 0;
  left: 15px;
  width: 270px;
  height: 180px;
  background-color: #f8fafc;
  border-radius: 4px;
  z-index: 5; /* 初始在 Pocket(10) 后面，在 Back 也就是 envelope div 前面 */
  transition: all 0.5s;
  animation: pullLetter 1s ease-in-out forwards;
  animation-delay: 0.8s; /* 等盖子打开后再动 */
  box-shadow: 0 -5px 15px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.letter-content {
  text-align: center;
  padding: 20px;
  opacity: 0;
  animation: fadeInText 0.5s ease forwards;
  animation-delay: 1.2s;
}

.stamp {
  width: 30px;
  height: 30px;
  border: 1px solid #cbd5e1;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6px;
  color: #94a3b8;
  margin: 0 auto 10px auto;
  transform: rotate(-15deg);
}

/* --- 关键帧动画 --- */

@keyframes openFlap {
  0% {
    transform: rotateX(0deg);
    z-index: 20;
  }
  100% {
    transform: rotateX(180deg);
    z-index: 1; /* 打开后跑到信纸后面去 */
  }
}

@keyframes pullLetter {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-120px); /* 向上抽出 */
    z-index: 30; /* 抽出后层级最高，盖住口袋 */
  }
}

@keyframes fadeInText {
  to {
    opacity: 1;
  }
}
</style>