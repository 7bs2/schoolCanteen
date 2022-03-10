Page({
  data: {
    afterUserInfo:false,
    openid:'',
    code:'',
    token: {},
    userInfo: {
      encryteddata:'',
      iv_data:''
    },
    userBaseInfo:{},
    phoneNumber: {
      encryptedphone:'',
      iv_phone:''
    },
    url: ''
  },
  onLoad:function(){
    const that = this
    wx.request({
      url: 'http://61.189.160.73:50080/api/?action=getposter',
      data: {
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success: function (res) {
        that.setData({
          url: res.data.data
        })
        wx.setStorageSync('shareUrl', res.data.data)
      },
      fail: function (err) {
        console.log(err);
      }
    })
  },
  onShow: function () {
    var app = getApp()
    var myHas = wx.getStorageSync('hasGetUserInfo')

    console.log(app.globalData.hasUserInfo);
    this.setData({
      hasUserInfo:app.globalData.hasUserInfo
    })
    console.log(app.globalData.hasUserInfo);
    console.log(Object.keys(wx.getStorageSync('userBaseInfo')).length);
    if (!Object.keys(wx.getStorageSync('userBaseInfo')).length == 0) {
      
      if (app.globalData.hasUserInfo||myHas) {
        this.data.hasUserInfo = wx.getStorageSync('hasGetUserInfo')
        console.log(this.data.hasUserInfo);
        console.log(app.globalData.hasGetUserInfo);
        console.log("as");
        console.log(app.globalData.userBaseInfo);
        this.setData({
          hasUserInfo:true,
          userBaseInfo:wx.getStorageSync('userBaseInfo'),
        })
        console.log(this.data.hasUserInfo);
      }else{
        this.setData({
          
        })
      }
    }else{
      this.setData({
        hasUserInfo:false
      })
    }

  },

  toLogin(){ 
    wx.navigateTo({ 
      url: '/pages/login/login', 
    }) 
  }, 




  //代金券页面跳转（无数据传递）
  btnUseMoneyAction: function () {
    var myHas = wx.getStorageSync('hasGetUserInfo')
    if (!myHas) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }else{0
      wx.navigateTo({
        url: '/pages/voucher/voucher'
      })
    }
  },

  // 问题反馈取消
  _cancelEvent(e) {
    console.log('你点击了取消');
    //do something when cancle is clicked
    this.setData({
      isShown: false
    })
  },

  // 问题反馈确定
  _confirmEvent(e) {
    wx.setClipboardData({
      data: '123456',
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
          }
        })
      }
    })
    ////do something when sure is clicked
    this.setData({
      isShown: false
    })
  },
  showDialog() {
    this.setData({
      isShown: true
    })
  },
  toAddress() {
    var myHas = wx.getStorageSync('hasGetUserInfo')
    if (!myHas) {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }else{0
      wx.navigateTo({
        url: '/pages/address/address'
      })
    }
  },

  // 展示分享的图片
  showShare() {
    wx.previewImage({
      current: this.data.url, // 当前显示图片的http链接
      urls: [this.data.url] // 需要预览的图片http链接列表
    })
  }

})