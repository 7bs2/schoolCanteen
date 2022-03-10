// app.js
App({
  globalData: {
    statusBarHeight:wx.getSystemInfoSync()['statusBarHeight'] - 3
  },

  // 数据监听器
  watch: function (ctx, obj) {
    Object.keys(obj).forEach(key => {
      this.observer(ctx.data, key, ctx.data[key], function (value) {
        obj[key].call(ctx, value)
      })
    })
  },
  // 监听属性，并执行监听函数
  observer: function (data, key, val, fn) {
    Object.defineProperty(data, key, {
      configurable: true,
      enumerable: true,
      get: function () {
        return val
      },
      set: function (newVal) {
        if (newVal === val) return
        fn && fn(newVal)
        val = newVal
      },
    })
  },  
  checkToken(){
    if (wx.getStorageSync('token')) {
      wx.request({
        url: 'http://61.189.160.73:50080/api/?token=' + encodeURIComponent(wx.getStorageSync('token')) +'&action=getuserinfo',
        data: {
          token:wx.getStorageSync('token')
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
          'content-type': 'application/json'
        }, // 设置请求的 header
        success: function (res) {
          console.log(res);
          if (res.data.code == 21000) {
            wx.login({
              success:res =>{
                wx.request({
                  url: 'http://61.189.160.73:50080/api/?js_code='+res.code,
                  data:{
                    code:res.code
                  },
                  method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                  header: {
                    'content-type': 'application/json'
                  }, // 设置请求的 header
                  success: function (res) {
                    console.log(res);
                    if (res.data.code == 0) {
                      wx.setStorageSync('token', res.data.token)
                      console.log(res.data.token)
                    }
                  }
                })
              }
            })
          }
        },
        fail: function (err) {
          console.log(err);
        }
      })
    }
  },

  onShow:function(){
    this.checkToken()
  },
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    hasUserInfo:false,
  }
})
