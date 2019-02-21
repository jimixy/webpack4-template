import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home'

Vue.use(Router)

let routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    }
]
// const componentsContext = require.context('./global', true, /\.js$/)

const routerContext = require.context('./', false, /\.js$/)
console.log({
    routerContext
});

routerContext.keys().forEach(route => {
    // 如果是根目录的 index.js 、不处理
    if (route.startsWith('./index')) return
    const routerModule = routerContext(route)
    /**
     * 兼容 import export 和 require module.export 两种规范
     */
    routes = [...routes, ...(routerModule.default || routerModule)]
});

console.log('routes', routes);

export default new Router({
    mode: 'history',
    routes: routes
})
