// pages/login/login.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        afterUserInfo: false,
        openid: '',
        code: '',
        token: {},
        userInfo: {
            encryteddata: '',
            iv_data: ''
        },
        userBaseInfo: {},
        phoneNumber: {
            encryptedphone: '',
            iv_phone: ''
        },
        //用户是否同意用户协议
        ifYes: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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

    getUserProfile(e) {
        if (this.data.ifYes) {
            var app = getApp()
            wx.getUserProfile({
                desc: '用于完善用户资料',
                success: (res) => {
                    console.log(res);
                    this.data.userInfo.encryteddata = res.encryptedData;
                    this.data.userInfo.iv_data = res.iv;
                    console.log(this.data.userInfo.encryteddata);
                    console.log(this.data.userInfo.iv_data);
                    wx.setStorageSync('userBaseInfo', res.userInfo)
                    app.globalData.userBaseInfo = res.userInfo
                    console.log(app.globalData.userBaseInfo);
                    this.setData({
                        userBaseInfo: res.userInfo,
                        afterUserInfo: true
                    })
                }
            })
        }else{
            wx.showToast({
              title: '请阅读并勾选底部协议',
              icon:'none'
            })
        }
    },

    getPhoneNumber(e) {
        var app = getApp()
        const that = this
        if (e.detail.errMsg == "getPhoneNumber:ok") {

            that.data.phoneNumber.encryptedphone = e.detail.encryptedData;
            that.data.phoneNumber.iv_phone = e.detail.iv
            console.log("iv", e.detail.iv);
            console.log("encryptedData", e.detail.encryptedData);
            wx.login({
                success: res => {
                    this.data.code = res.code;
                    this.setData({
                        code: this.data.code
                    })
                    console.log(this.data.code);
                    wx.request({
                        url: 'http://61.189.160.73:50080/api/?js_code=' + res.code,
                        data: {
                            'encryptedData': encodeURIComponent(e.detail.encryptedData),
                            'iv': e.detail.iv,
                            'code': res.code
                        },
                        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                        header: {

                            'content-type': 'application/json'

                        }, // 设置请求的 header
                        success: function (res) {
                            console.log(res);
                            if (res.data.code == 0) {
                                wx.setStorageSync('token', res.data.token)
                                wx.showToast({
                                    title: '登录成功',
                                })
                                app.globalData.hasUserInfo = true
                                that.setData({
                                    hasUserInfo: true
                                })
                                console.log(app.globalData.hasUserInfo);
                                wx.setStorageSync('hasGetUserInfo', true)
                                console.log(app.globalData.hasGetUserInfo);
                                wx.switchTab({
                                    url: '/pages/my/my',
                                })
                            } else if (res.data.code == 1) {
                                wx.setStorageSync('openid', res.data.openid)
                                that.data.openid = wx.getStorageSync('openid')
                                console.log(that.data.userInfo.encryteddata);
                                var url = 'http://61.189.160.73:50080/api/?openid=' + that.data.openid + '&encrypteddata=' + encodeURIComponent(that.data.userInfo.encryteddata) + '&iv_data=' + encodeURIComponent(that.data.userInfo.iv_data) + '&encryptedphone=' + encodeURIComponent(that.data.phoneNumber.encryptedphone) + '&iv_phone=' + encodeURIComponent(that.data.phoneNumber.iv_phone);
                                console.log(url);
                                wx.request({
                                    url: url,
                                    data: {

                                    },
                                    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                                    header: {

                                        'content-type': 'application/json'

                                    }, // 设置请求的 header
                                    success: function (res) {
                                        console.log(res)
                                        if (res.data.code == 20008) {
                                            wx.login({
                                                success: res => {
                                                    that.data.code = res.code;
                                                    that.setData({
                                                        code: that.data.code
                                                    })
                                                    console.log(that.data.code);
                                                    wx.request({
                                                        url: 'http://61.189.160.73:50080/api/?js_code=' + res.code,
                                                        data: {
                                                            'code': res.code
                                                        },
                                                        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
                                                        header: {
                                                            'content-type': 'application/json'
                                                        },
                                                        success: function (res) {
                                                            if (res.data.code == 0) {
                                                                wx.setStorageSync('token', res.data.token)
                                                                wx.showToast({
                                                                    title: '登录成功',
                                                                })
                                                                app.globalData.hasUserInfo = true
                                                                that.setData({
                                                                    hasUserInfo: true
                                                                })
                                                                console.log(app.globalData.hasUserInfo);
                                                                wx.setStorageSync('hasGetUserInfo', true)
                                                            }
                                                        }
                                                    })
                                                }
                                            })
                                            app.globalData.hasUserInfo = true
                                            that.setData({
                                                hasUserInfo: true
                                            })
                                            console.log(app.globalData.hasUserInfo);
                                            wx.setStorageSync('hasGetUserInfo', true)
                                            wx.showToast({
                                                title: '登录成功',
                                            })
                                            wx.switchTab({
                                                url: '/pages/my/my',
                                            })
                                        } else {
                                            wx.showToast({
                                                title: '请重新登录',
                                                icon: "error"
                                            })
                                        }
                                        //this.data.mres = res
                                        //   if (res.status ==20000) {//我后台设置的返回值为1是正确
                                        //   //存入缓存即可
                                        //   wx.setStorageSync('userinfo', res.userInfo);
                                        //   }
                                    },
                                    fail: function (err) {
                                        console.log(err);
                                    }
                                })
                            } else {
                                wx.showToast({
                                    title: '请重新登录',
                                    icon: "error"
                                })
                            }
                        },
                        fail: function (err) {
                            console.log(err);
                        }
                    })
                }
            })
            that.setData({
                afterUserInfo: false
            })

        }
    },
    clickDefault() {
        if (this.data.ifYes) {
            this.data.ifYes = false;
        } else {
            this.data.ifYes = true;
        }
        this.setData({
            ifYes: this.data.ifYes
        })
    },
    toAgreement() {
        wx.navigateTo({
            url: '/pages/agreement/agreement',
            success: (result) => {},
            fail: (res) => {},
            complete: (res) => {},
        })
    }
})