import Vue from 'vue'

// 引入样式
import 'vue-easytable/libs/themes-base/index.css'
import 'normalize.css/normalize.css'
import '@/assets/styles/index.styl'

import App from './App.vue'
import router from './routers'
import store from './store'

import validator from '@ignorance/vue-validator'
import VueRx from 'vue-rx'
import myPlugin from './plugin/index'

// 导入 table 和 分页组件
import {
  VTable,
  VPagination
} from 'vue-easytable'

// rem布局
import 'amfe-flexible'

// icon
import './assets/icons'

/**
 * @description 全局组件，不用单独引入
 */
import {
  Row,
  Col,
  Cell,
  CellGroup,
  Button,
  Field,
  Icon,
  Dialog,
  Toast,
  NavBar,
  Tag,
  Tab,
  Tabs,
  Popup,
  Picker
} from 'vant'

const components = [
  Row,
  Col,
  Cell,
  CellGroup,
  Button,
  Field,
  Icon,
  Dialog,
  Toast,
  NavBar,
  Tag,
  Tab,
  Tabs,
  Popup,
  Picker
]

/**
 * @description 生产环境关掉提示
 */
Vue.config.productionTip = false

/**
 * 安装插件
 */

components.forEach(Component => {
  Vue.use(Component)
})

Vue.use(validator)
Vue.use(VueRx)
Vue.use(myPlugin)
Vue.use(VTable)
Vue.use(VPagination)

export const vueInstance = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
