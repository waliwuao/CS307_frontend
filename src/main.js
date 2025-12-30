import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Pinia 插件，用于在路由切换时获取组件状态（例如 RecipeDetail 的 showEnvelope）
// 注意：这个插件是 Vue Router 4.x + Pinia 2.x 的配合方式
function createRouterStatePlugin() {
  return ({ router }) => {
    router.beforeEach((to, from, next) => {
      // 在导航前，将当前路由组件的状态（如果有）保存在 Pinia store 中
      // 注意：这需要在组件的 setup 函数中注入状态，例如 useAuthStore().recipeDetailComponentState = { showEnvelope: true }
      // 这里只是一个框架，实际状态注入需要修改 RecipeDetail.vue
      if (from.name === 'RecipeDetail' && from.meta.state) {
         // Pinching the auth store to store component state
         // This is a bit of a hack, ideally we'd have a dedicated store for component states
         const authStore = useAuthStore();
         authStore.recipeDetailComponentState = from.meta.state;
      }
      next();
    });
    router.afterEach((to, from) => {
      // 在导航后，重置可能存在的组件状态
      if (to.name === 'RecipeDetail') {
         // State will be set when data loads
      } else if (to.name !== 'RecipeDetail') {
         const authStore = useAuthStore();
         // Clear state if navigating away from RecipeDetail
         if (authStore.recipeDetailComponentState) {
             delete authStore.recipeDetailComponentState;
         }
      }
    });
  };
}


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 注册 Router State Plugin (仅作为示例，实际注入需要在 RecipeDetail.vue 中完成)
// router.use(createRouterStatePlugin());


app.mount('#app')

// 导出 pinia 以便在全局访问
export { pinia };
