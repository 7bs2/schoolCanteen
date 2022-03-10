// pages/thridPayment/thridPayment.js
const api = require('../../utils/promise.js')
const check = require('../../utils/check.js');
var base64 = require('../../utils/base64.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        order_id: "",
        shop_name: '',
        order_message: {},
        food_list: [],
        money: 0,
        id: "0",
        token: '',
        total: {},
        ycrs: '1',
        addressList:[],
        address:{},
        hour:0,
        min:0,
        info:[],
        ifInfo:false
    },

    onLoad: function (options) {
        var that = this
        console.log(options);
        if (options.info) {
        var info = JSON.parse(options.info)
        that.setData({
            info:JSON.parse(options.info),
            ifInfo:true
        })
        console.log(info);
        }
        wx.showLoading({
            title: '加载中',
        })
        this.setData({
            scanCodeMsg: options.data,
            shop_name: options.name
        })
        console.log(this.data.shop_name);
        var token = wx.getStorageSync('token')
        wx.request({
            url: 'http://61.189.160.73:50080/api/?token=' + token + '&action=getorder',
            success: (res) => {
                console.log(res)
                var order_list = res.data.orderlist
                for (var i = 0; i < order_list.length; i++) {
                    if (order_list[i].ddzt == '0' || order_list[i].ddzt == '1') {
                        this.setData({
                            order_id: res.data.orderlist[i].ddbz,
                            order_message: order_list[i]
                        })
                        break
                    }
                }
                console.log(this.data.order_message)
                console.log(this.data.order_message.shops_id)
                wx.request({
                    url: 'http://61.189.160.73:50080/api/?token=' + token + '&action=getorder&orderid=' + this.data.order_id,
                    success: (res) => {
                        console.log(res);
                        console.log(res.data.mx)
                        var arr = res.data.mx
                        var foods_list = wx.getStorageSync(this.data.order_message.shops_id).data
                        console.log(foods_list)
                        for (var i = 0; i < arr.length; i++) {

                            var name = arr[i].cpmc
                            console.log(name)
                            for (var j = 0; j < foods_list.length; j++) {
                                if (foods_list[j].goods_name == name) {
                                    arr[i].src = foods_list[j].img_src
                                    break
                                }
                            }
                        }
                        this.setData({
                            food_list: arr
                        })
                    },
                    complete: () => {
                        wx.hideLoading()
                    },
                    err:function(res) {
                        console.log(res)
                    }
                })
            },
            fail: (err) => {
                console.log(err)
            }
        })
    },
    onShow:function(options){
        var that = this
        var time = new Date();
        var a = time.getHours()
        var b = time.getMinutes()
        console.log(a,b);
        console.log(time);
        var c = b + 30
        if (c >= 60) {
            a = a + 1
            if (a == 24) {
                a = "00"
            }
            a = a.toString().length < 2 ? '0' + a : a
            b = c - 60
            b = b.toString().length < 2 ? '0' + b : b
        }else{
            b = b + 30
        }
        console.log(a,b);
        this.setData({
           hour:a,
           min:b 
        })

        var chooseId = getApp().globalData.chooseId
        this.setData({
            addressList:wx.getStorageSync('addressList')
        })
        var addressList = wx.getStorageSync('addressList')
        if (chooseId) {
            addressList.forEach(function(v,index) {undefined
                if (v.id == chooseId) {
                    that.setData({
                        address:v
                    })
                }
            });
            console.log(this.data.address);
        }else{
            addressList.forEach(function(v,index) {undefined
                if (v.isDefault) {
                    that.setData({
                        address:v
                    })
                    getApp().globalData.chooseId = v.id
                }
            });
            console.log(this.data.address);
        }

        
    },
    // 获取人数
    getNum(e) {
        console.log(e.detail.value);
        this.setData({
            ycrs: e.detail.value
        })
    },
    //去支付
    toPayment(e) {
        if (!this.check()) {
            return
        }
        var that = this
        var order_id = this.data.order_id
        //用餐方式
        var ycsf = this.data.id
        // 用餐人数
        console.log(e.detail);
        var ycrs = e.detail.value
        console.log(e.detail);
        // 外卖地址
        var yhwmdzbz = ''
        // 手机型号
        var device_info
        wx.getSystemInfo({
            success(res) {
                device_info = res.model
            }
        })
        console.log(this.data.ycrs);
        this.setData({
            ['total.ddbz']: order_id,
            ['total.ycfs']: this.data.id,
            ['total.ycrs']: this.data.ycrs,
            ['total.yczh']: '',
            ['total.yhwmdzbz']: this.data.address.id,
            ['total.device_info']: device_info,
        })
        check.judgeNetworkStatus(function (res) {
            console.log(res);
            if (res != "none") {
                // 判断token是否过期
                that.setData({
                    token: check.checkToken()
                })
                var token = wx.getStorageSync('token')
                console.log(token);
                console.log(JSON.stringify(that.data.total));
                if (that.data.ifInfo) {
                    var token = wx.getStorageSync('token')
                    api.request(
                        'http://baijingyuan.cc:50080/api/?token=' + token + '&action=getpayinfo&orderid=' + order_id,
                        'POST'
                    ).then(res => {
                        console.log(res);
                        if (res.data.code == 20000) {
                            console.log(res.data.payinfo);
                            wx.requestPayment({
                                timeStamp: res.data.payinfo.timeStamp,
                                nonceStr: res.data.payinfo.nonceStr,
                                package: res.data.payinfo.package,
                                signType: res.data.payinfo.signType,
                                paySign: res.data.payinfo.paySign,
                                success(res) {
                                    console.log(res);
                                },
                                fail(res) {
                                    console.log(res);
                                },
                                complete() {
                                    check.judgeNetworkStatus(function (res) {
                                        if (res != "none") {
                                            that.setData({
                                                token: check.checkToken()
                                            })
                                            var token = wx.getStorageSync('token')
                                            api.request(
                                                'http://61.189.160.73:50080/api/?token=' + token + '&action=confirmpay&orderid=' + order_id,
                                                'POST'
                                            ).then(res => {
                                                console.log(res);
                                                if (res.data.code == 20083) {
                                                    console.log(2222);
                                                    wx.switchTab({
                                                        url: '/pages/order/order',
                                                    })
                                                }
                                            }).catch(res => {
                                                console.log(res);
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }else{
                    api.request(
                        'http://61.189.160.73:50080/api/?token=' + token + '&action=confirmorder&orderinfo=' + encodeURIComponent(base64.encode(JSON.stringify(that.data.total))),
                        'POST'
                    ).then(res => {
                        console.log(res);
                        if (res.data.code == 20000) {
                            console.log(res.data.payinfo);
                            wx.requestPayment({
                                timeStamp: res.data.payinfo.timeStamp,
                                nonceStr: res.data.payinfo.nonceStr,
                                package: res.data.payinfo.package,
                                signType: res.data.payinfo.signType,
                                paySign: res.data.payinfo.paySign,
                                success(res) {
                                    console.log(res);
                                },
                                fail(res) {
                                    console.log(res);
                                },
                                complete() {
                                    check.judgeNetworkStatus(function (res) {
                                        if (res != "none") {
                                            that.setData({
                                                token: check.checkToken()
                                            })
                                            var token = wx.getStorageSync('token')
                                            api.request(
                                                'http://61.189.160.73:50080/api/?token=' + token + '&action=confirmpay&orderid=' + order_id,
                                                'POST'
                                            ).then(res => {
                                                console.log(res);
                                                if (res.data.code == 20083) {
                                                    console.log(2222);
                                                    wx.switchTab({
                                                        url: '/pages/order/order',
                                                    })
                                                }
                                            }).catch(res => {
                                                console.log(res);
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }).catch(res => {
                        console.log(res);
                    })
                }
                
            }
        })
    },
    //选择列表
    chooseAddress(){
        wx.navigateTo({
          url: '/pages/chooseAddress/chooseAddress',
          success: (result) => {},
          fail: (res) => {},
          complete: (res) => {},
        })
    },
    check() {
        var str = ""
        console.log(this.data.address);
        var address =  this.data.address
        if ( address == undefined) {
            str = "请选择配送地址"
        }
        if (str.length == 0) {
            return true
        }else{
            wx.showToast({
                title: str,
                icon: 'none'
              })
              return false
        }
    },
})