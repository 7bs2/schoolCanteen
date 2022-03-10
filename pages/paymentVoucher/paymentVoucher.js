// pages/voucher/voucher.js
const check = require('../../utils/check.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        voucherList: [],
        token: '',
        checkList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var money = options.money
        console.log(money)
        var that = this
        // 判断token是否过期
        this.setData({
            token: check.checkToken()
        }, function () {
            var token = wx.getStorageSync('token')
            console.log('http://61.189.160.73:50080/api/?token=' + token + '&action=getcoupon', );
            wx.request({
                url: 'http://61.189.160.73:50080/api/?token=' + token + '&action=getcoupon',
                data: {},
                method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                header: {
                    'content-type': 'application/json'
                }, // 设置请求的 header
                success: function (res) {
                    that.setData({
                        voucherList: res.data.data
                    })

                    console.log(that.data.voucherList);
                    var checkList = []
                    that.data.voucherList.forEach(function (item, index) {undefined
                        if (!item.ifUse) {
                            if (parseInt(item.user_condition) <= parseInt(money)) {
                                item.num = 0
                                item.style = false
                                checkList.push(item)                           
                                that.setData({
                                    checkList: checkList
                                })
                            }else{
                                console.log(checkList);
                            }
                        }
                    })
                    console.log(checkList);
                },
                fail: function (err) {
                    console.log(err);
                }
            })
        })
    },
    onShow: function () {
        if (this.data.voucherList.length == 0) {
            this.setData({
                voucherList: wx.getStorageSync('voucherList'),
            })
        }
    },
    check(e) {
        var id = e.currentTarget.dataset.id;
        // 用户选中的优惠券
        var item = e.currentTarget.dataset.item;
        console.log(item);
        const that = this
        that.data.checkList.forEach(function (v, index) {
            console.log(v.style);
            if (v.id == id) {
                v.num++
                if (v.style) {
                    v.style = false
                } else {
                    v.style = true
                }
            } else {
                v.style = false
            }
        })
        console.log(that.data.checkList);
        console.log(that.data.checkList);
        that.setData({
            checkList: that.data.checkList
        })
        console.log(item);
    },

    exit:function() {
      
        var arr = this.data.checkList
        for(var i = 0;i<arr.length;i++) {
            if(arr[i].num % 2 != 0) {
                let pages = getCurrentPages()
                let prevPage = pages[pages.length - 2]
                prevPage.setData({  
                    money: parseInt(arr[i].money),
                    yhj_id:arr[i].id,
                    condition:arr[i].user_condition
                  });
                  wx.navigateBack({
                    delta: 1,
                  })
            }
        }
    
    }

})