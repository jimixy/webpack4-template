import axios from 'axios'
import qs from 'qs'

import myStore from '@/libs/util'
import config from '@/config'

class Ajax {
  constructor (options) {
    this.axios = axios.create({
      baseURL: config.baseUrl.dev
    })
    this.commonPath = (options || {}).commonPath ? options.commonPath : ''
    this.isLogin = false
    // 通用拦截器（全局的成功后的回调函数，用作去掉 loading 等操作）
    if (options && typeof options.success === 'function') {
      this.success = options.success
    } else {
      this.success = res => {}
    }
    this.initInterceptor()
  }
  initInterceptor () {
    // 给POST请求头加上x-crsf-token
    this.axios.interceptors.request.use(
      config => {
        if (!/^https:\/\/|http:\/\//.test(config.url)) {
          const token = myStore.getLocal('token')
          if (token && token !== 'undefined') {
            config.headers.common['Authorization'] = 'Basic ' + token + 'Og=='
          }
        }
        return config
      },
      err => {
        return Promise.reject(err)
      }
    )
    // ajax 全局错误处理
    this.axios.interceptors.response.use(
      response => {
        this.success(response)
        return response
      },
      err => {
        const errorInfo = err.response
        if (errorInfo) {
          switch (errorInfo.status) {
            case 404:
              console.log('请求发生404错误')
              break
            case 500:
              console.log('请求发生500错误')
              break
            case 504:
              console.log('请求超时')
              break
            case 400: // 用户没有csrf-token
              if (errorInfo.data && errorInfo.data.msg) {
                Object.values(errorInfo.data.msg).forEach(val => {
                //   showToast(val[0])
                })
              }
              break
            case 401: // 用户没有登录态
              if (errorInfo.data && errorInfo.data.msg) {
                // showToast(errorInfo.data.msg)
              }
              break
            default:
              console.log('error:' + err.response.status)
              break
          }
          const res = this.normalizeRes(err.response)
          return Promise.reject(res.data || res) // 返回接口返回的错误信息
        }
      }
    )
  }

  /**
     * 即使服务器端报错，也要将返回错误统一格式化之后返回给前端
     * @param res 原始的错误返回数据
     * @returns 与正常接口格式相同的数据结构
     */
  normalizeRes (res) {
    if (res && typeof res.data === 'string') {
      res.data = {
        error_code: -1,
        message: res.data
      }
    } else if (res && res.statusText) {
      res.data = {
        error_code: res.status,
        message: res.statusText
      }
    } else {
      res = {
        data: {
          error_code: -1,
          message: '未知错误'
        }
      }
    }
    return res
  }
  /**
     * 解析参数，拼接到 path 上
     * @param  {[string]} path   [原始 path]
     * @param  {[string || object]} params [要拼接到 path 上的参数]
     * @return {[string]}        [拼接过后的 path]
     */
  parse (path, params) {
    if (typeof params === 'string') {
      return path + '/' + params
    }
    if (typeof params === 'object') {
      let search = '?'
      let counter = 0
      for (let key in params) {
        if (counter) search += '&'
        search += key + '=' + params[key]
        counter++
      }
      return path + search
    }
    return path
  }

  /**
     * 通用 http 请求方法
     * @param method
     * @param path
     * @param prevConfig = {
     *          cache: false| true 是否开启缓存
     *          emulateJson: false | true 传入 true，则参数将以 formData 的方式传递,
     *          returnRes: false | true 是否不直接返回前端所要的数据
     *        }
     * @returns {*}
     */
  request (method, path, prevConfig) {
    !this[`${method}Map`] && (this[`${method}Map`] = {})
    let cacheFun = this[`${method}Map`][path]
    if (!cacheFun) {
      cacheFun = (params, lastConfig) => {
        const config = {
          ...prevConfig,
          ...lastConfig
        }
        if (!config.cache) {
          const headers = (config.headers = config.headers || {})
          headers['Cache-Control'] = 'no-cahce'
          headers['If-Modified-Since'] = '0'
        }
        // get 请求下将参数直接拼接到path中
        if (method === 'get') {
          path = this.parse(path, params)
        }
        // 非 get 请求，配置项中指定用 form 表单的方式提交
        if (method !== 'get') {
          params = config.emulateJson ? qs.stringify(params) : params
          config.data = params
        }
        const commonPath = config.commonPath || this.commonPath
        return this.axios({
          method,
          url: commonPath + path,
          ...config
        })
          .then(
            res => {
              return config.returnRes ? res : res.data
            },
            res => {
              return res
            }
          )
          .catch(err => {
            return err.toString()
          })
      }
    }
    return cacheFun
  }

  get () {
    return this.request('get', ...arguments)
  }
  post () {
    return this.request('post', ...arguments)
  }
  put () {
    return this.request('put', ...arguments)
  }
  patch () {
    return this.request('patch', ...arguments)
  }
  delete () {
    return this.request('delete', ...arguments)
  }
}

export default new Ajax()
