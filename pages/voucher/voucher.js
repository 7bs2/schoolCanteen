// pages/voucher/voucher.js
const check = require('../../utils/check.js');
const api = require('../../utils/promise.js')
Page({

    /**
     * 页面的初始数据
     */
    data: {
        voucherList:[],
        token:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this
        // 判断token是否过期
        this.setData({
            token:check.checkToken()
        },function(){
            var token = wx.getStorageSync('token')
            console.log('http://61.189.160.73:50080/api/?token=' + token + '&action=getcoupon',);
            api.request(
                'http://61.189.160.73:50080/api/?token=' + token + '&action=getcoupon',
                'POST').then(res =>{
                    if (res.data.code == 20032) {
                        that.setData({
                            voucherList:res.data.data
                        })
                        console.log(res);
                        if (that.data.voucherList) {
                            for(var i = 0;i < that.data.voucherList.length;i++){
                                var v = that.data.voucherList[i]
                                if (!v.ifUse) {
                                    console.log(v);
                                    console.log(i);
                                    var voucher = that.data.voucherList.splice(i,1)[0];
                                    console.log(voucher);
                                    console.log(that.data.voucherList);
                                    that.data.voucherList = [voucher, ...that.data.voucherList];
                                    console.log(that.data.voucherList);
                                    // that.data.voucherList = that.data.voucherList.reverse()
                                    wx.setStorageSync('voucherList', that.data.voucherList)
                                    console.log(that.data.voucherList);
                                }else{
                                    
                                }
                            }
                        }
                        that.setData({
                            voucherList:that.data.voucherList
                        })
                    }
                })
        })
    },
onShow:function(){
    if (this.data.voucherList.length == 0) {
        this.setData({
            voucherList:wx.getStorageSync('voucherList')
        })
    }
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