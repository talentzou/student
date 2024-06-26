//初始化样式
import "reset-css"
import "animate.css"
import { createApp } from "vue"
// import { createPinia } from "pinia"
import { store } from "./stores"
import App from "./App.vue"
import router from "./router"
import auth from "@/directive/auth"
import "@/permission"
//引入本地icon注册脚本
import "virtual:svg-icons-register"
import "element-plus/theme-chalk/dark/css-vars.css"
import globalComp from "@/components"

const app = createApp(App)

app.use(router)
app.use(store)
app.use(globalComp)
app.use(auth)
app.mount("#app")
