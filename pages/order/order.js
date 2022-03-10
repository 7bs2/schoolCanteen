// pages/order/order.js
const api = require('../../utils/promise.js')
var base64 = require('../../utils/base64.js');
const check = require('../../utils/check.js');
const {
    checkToken
} = require('../../utils/check.js');
var app = getApp();
Page({
    url: '',
    token: '',
    ifShow: false,
    /**
     * success 已完成订单
     * good_id
     * goods_name
     * image_src
     * number 菜品数量
     * time 交易时间
     * 应付金额
     * 实付金额
     * being 正在进行的订单数组
     * shops_name 食堂名称
     * tables 桌号
     * hasStar 评分
     */
    data: {
        hasStar: '',
        ifLogin: false,
        tabs: [{
                id: 0,
                value: "正在进行",
                isActive: true
            },
            {
                id: 1,
                value: "已经完成",
                isActive: false,
                nowFood: []
            }
        ],
        orderList: {},
        modify_orderinfo: {},
        foodList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var foodList = []
        var that = this
        let token = wx.getStorageSync('token')
        var url = 'http://61.189.160.73:50080/api/?token=' + token + '&action=getorder'
        let hasStar = getApp().globalData.starNum
        console.log(hasStar);
        wx.request({
            url: url,
            success: (res) => {
                console.log(res.data)
                this.setData({
                    orderList: res.data.orderlist.reverse()
                })
                this.data.orderList.forEach(function (v, index) {
                    api.request(
                        'http://61.189.160.73:50080/api/?token=' + token + '&action=getorder&orderid=' + v.ddbz,
                        'POST').then(res => {
                        if (res.data.code == 20000) {
                            var food = {
                                id: res.data.xx.ddbz,
                                mx: res.data.mx
                            }
                            foodList.push(food)
                        }
                        that.setData({
                            foodList: foodList
                        })
                    }).catch(res => {
                        console.log(res);
                    })
                })
                console.log(foodList);

            }
        })
        console.log(that.data.foodList);
    },

    handleItem: function (e) {
        const {
            index
        } = e.currentTarget.dataset;
        let {
            tabs
        } = this.data;
        tabs.forEach((v, i) => i == index ? v.isActive = true : v.isActive = false);
        this.setData({
            tabs
        })
    },
    // 判断是否登录(或在支付页面已经判断) 缓存中是否有token
    // 显示星级
    onShow: function () {
        console.log(token);
        let token = wx.getStorageSync('token')
        var url = 'http://61.189.160.73:50080/api/?token=' + token + '&action=getorder'
        let hasStar = getApp().globalData.starNum
        console.log(hasStar);
        wx.request({
            url: url,
            success: (res) => {
                console.log(res.data)
                this.setData({
                    orderList: res.data.orderlist.reverse(),
                    nowFood: wx.getStorageSync('nowFood')
                })

            }
        })
        if (token) {
            this.setData({
                ifLogin: true,
            })
        }
    },
    // 扫描桌号



    saoMao(e) {
        var that = this
        var {
            id
        } = e.currentTarget.dataset
        wx.scanCode({
            onlyFromCamera: true,
            success(res) {
                console.log(res)
                var yczh = res.result
                that.setData({
                    ['modify_orderinfo.ddbz']: id,
                    ['modify_orderinfo.yczh']: yczh
                })
                check.judgeNetworkStatus(function (res) {
                    if (res != 'none') {
                        that.setData({
                            token: check.checkToken()
                        })
                        var token = wx.getStorageSync('token')
                        api.request(
                            'http://61.189.160.73:50080/api/?token=' + token + '&action=modifyorderinfo&orderinfo=' + encodeURIComponent(base64.encode(JSON.stringify(that.data.modify_orderinfo))),
                            'POST'
                        ).then(res => {
                            console.log(res);
                            if (res.data.code == 20000) {
                                that.data.orderList.forEach(function (v, index) {
                                    if (v.ddbz == id) {
                                        that.setData({
                                            [`orderList[${index}].yczh`]: yczh,
                                        })
                                    }
                                })
                                console.log(that.data.orderList);
                            }
                        }).catch(res => {
                            console.log(res);
                        })
                    }
                })
            }
        })
    },
    // 去评价
    toScore() {
        wx.navigateTo({
            url: '../score/score',
        })
    },

    // 
    show(e) {
        app.globalData.orderId = e.currentTarget.dataset.id
        app.globalData.orderIndex = e.currentTarget.dataset.index
        console.log(e.currentTarget.dataset.index);
        this.setData({
            ifShow: true
        })
    },

    // 取消订单
    cancel(e) {
        var type = e.currentTarget.dataset.type
        var that = this
        if (type == 0) {
            that.setData({
                ifShow: false
            })
        } else if (type == 1) {
            check.judgeNetworkStatus(function (res) {
                console.log(res);
                if (res != "none") {
                    // 判断token是否过期
                    that.setData({
                        token: check.checkToken()
                    })
                    var token = wx.getStorageSync('token')
                    console.log(token);
                    var id = app.globalData.orderId
                    api.request(
                        'http://61.189.160.73:50080/api/?token=' + token + '&action=cancelorder&orderid=' + id,
                        'POST'
                    ).then(res => {
                        console.log(res);
                        if (res.data.code == 20000) {
                            wx.showToast({
                                title: '取消成功',
                            })
                            var index = app.globalData.orderIndex
                            that.data.orderList.splice(index, 1);
                            console.log(that.data.orderList);
                            console.log(2);
                            that.setData({
                                ifShow: false,
                                orderList: that.data.orderList
                            })
                            console.log(3);
                        } else {
                            wx.showToast({
                                title: "请重试",
                                icon: 'error'
                            })
                        }
                    }).catch(res => {
                        console.log(res);
                    })
                }
            })
        }
    },
    // 去支付
    toPayment(e) {
        var {
            shop
        } = e.currentTarget.dataset
        var id = e.currentTarget.dataset.id
        var info
        var token = wx.getStorageSync('token')
        api.request(
            'http://61.189.160.73:50080/api/?token=' + token + '&action=getorder&orderid=' + id,
            'POST').then(res => {
            console.log(res);
            if (res.data.code == 20000) {
                info = res.data
                if (info.xx.qcfs == "0") {
                    wx.navigateTo({
                        url: '/pages/thridPayment/thridPayment?name=' + shop + '&info=' + JSON.stringify(info),
                    })
                } else if (info.xx.qcfs == "1") {
                    wx.navigateTo({
                        url: '/pages/payment/payment?info=' + JSON.stringify(info),
                    })
                } else {
                    wx.navigateTo({
                        url: '/pages/secondPayment/secondPayment?info=' + JSON.stringify(info),
                    })
                }
            }

        }).catch(res => {
            console.log(res);
        })
    },
    toDetailed(e) {
        var {
            id
        } = e.currentTarget.dataset
        wx.navigateTo({
            url: '/pages/detailed/detailed?id=' + id,
        })
    }
})