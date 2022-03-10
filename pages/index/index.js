
var app = getApp();
var baseUrl = getApp().baseUrl;
const check = require('../../utils/check.js');
Page({
  data: {
    flag:true,
    canteenData:[],
    current: 0,
   noticeList:[],
   notice:{
    noticeid:'',
    ntc_image_uri:'',
    title:'',
    content:'',
   },
   shop_nav:{},
   // 推荐
   recommend_list:[],
   topHeight:app.globalData.statusBarHeight
  },

  onLoad: function(options) {
    // wx.showLoading({
    //   title: '正在加载',
    // })
    setTimeout(() => {  
      this.setData({
        flag:false
      })
    }, 2000)
    check.checkToken()
    wx.request({
      url: 'http://61.189.160.73:50080/api/?action=getrecommendeddish',
      success:(res) => {
        console.log(res)
        var arr = res.data.dishinfo
        console.log(arr)
        this.setData({
          recommend_list:arr
        })
      }
    })
    wx.request({
      url: 'http://61.189.160.73:50080/api/?action=getcanteen',
      success:(result) => {
        console.log(result.data.data); 
        this.setData({
          canteenData:result.data.data
        })
      },
      complete:() => {
        // wx.hideLoading()
      }
    })
  },
  toSort:function(e) {
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../sort/sort?shops_id=' + id,
    })
  },
  next: function(e) {
    console.log(e.currentTarget.dataset.shop_nav)
    this.setData({
      shop_nav:e.currentTarget.dataset.shop_nav
    })
    wx.navigateTo({
      url: '/pages/sort/sort?shop_nav='+ encodeURIComponent(JSON.stringify(this.data.shop_nav))
    })
  },
  onShow:function(options){

    const that = this
    wx.request({
      url: 'http://61.189.160.73:50080/api/?action=getnotice',
      data: {
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        'content-type': 'application/json'
      }, // 设置请求的 header
      success: function (res) {
        that.data.noticeList = res.data.data
        that.setData({
          noticeList:res.data.data
        })
      },
      fail: function (err) {
        console.log(err);
      }
    })
    

  },

  /**
   * 公众号推文跳转
   */
  showNotice: function (e) {
    var index = e.currentTarget.dataset.index;
    console.log(index);
    var url = this.data.noticeList[index].ntc_content_uri;
    console.log(url);
    console.log(this.data.noticeList);
    wx.navigateTo({
      url: '/pages/notice/notice?name=noticeList&url=' + url,
    })
    // var id = e.currentTarget.dataset.id;  // 获取点击的推文的数组下标
    // var url = this.data.photoTweets[id].url;  // 通过id判断是哪个推文的链接
    // //跳转并传参
    // wx.navigateTo({
    //   url: 'http://61.189.160.73:50080/api/?action=getnotice' + url,
    // })
  },
})
