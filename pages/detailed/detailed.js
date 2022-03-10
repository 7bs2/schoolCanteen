// pages/detailed/detailed.js
const api = require('../../utils/promise.js')
var base64 = require('../../utils/base64.js');
const check = require('../../utils/check.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order:{},
        food:{},
        address:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        var id = options.id
        console.log(id);
        check.judgeNetworkStatus(function(res){
            if (res != 'none') {
                that.setData({
                    token: check.checkToken()
                })
                var token = wx.getStorageSync('token')
                api.request(
                    'http://baijingyuan.cc:50080/api/?token=' + token + '&action=getorder&orderid=' + id,
                    'POST'
                ).then(res =>{
                    console.log(res);
                    console.log(res.data.xx.scdz);
                    if (res.data.code == 20000) {
                        that.setData({
                            food:res.data.mx,
                            order:res.data.xx
                        })
                    }
                    if (res.data.xx.scdz != "没有录入地址") {
                        var addressList = wx.getStorageSync('addressList')
                        addressList.forEach(function(v,index){
                            if (v.id == res.data.xx.scdz) {
                                that.setData({
                            address:v
                        })
                            }
                        })
                        
                    }

                })
            }
        })

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})