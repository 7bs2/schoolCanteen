// pages/order/order.js
var app = getApp();
var baseUrl = getApp().baseUrl;
// import api from '../../utils/util.js';
const api = require('../../utils/promise.js')
var base64 = require('../../utils/base64.js');
const check = require('../../utils/check.js');
Page({

    data: {
        addressList: [],
        showIf: false,
        checkedAddress: {},
        token: '',
        chooseList: []
    },

    /**
     * 地址的数据结构
     * id
     * name 收货人姓名
     * mobile 电话
     * city 地址 省市县
     * street 详细地址
     * isDefault 默认选中
     */
    changeData: function () {
        this.onLoad();
    },
    onLoad: function (options) {

        var that = this
        var token = wx.getStorageSync('token')
        // 判断网络
        check.judgeNetworkStatus(function (res) {
            console.log(res);
            if (res != "none") {
                // 判断token是否过期
                that.setData({
                    token: check.checkToken()
                })
                console.log(token);
                token = wx.getStorageSync('token')
                console.log(token);
                // 获取地址
                api.request(
                    'http://61.189.160.73:50080/api/?token=' + token + '&action=getaddress',
                    'POST'
                ).then(res => {
                    console.log(res);
                    if (res.data.code == 20000) {
                        that.setData({
                            addressList: res.data.data,
                            chooseList: res.data.data

                        })
                        that.data.chooseList.forEach(function (v, index) {
                            if (v.isDefault) {
                                console.log(1);
                                that.setData({
                                    [`chooseList[${index}].choose`]: true,
                                })
                            } else {
                                that.setData({
                                    [`chooseList[${index}].choose`]: false
                                })
                            }
                        })
                        var chooseId = getApp().globalData.chooseId
                        if (chooseId) {
                            that.data.chooseList.forEach(function (v, index) {
                                if (v.id == chooseId) {
                                    console.log(1);
                                    that.setData({
                                        [`chooseList[${index}].choose`]: true,
                                    })
                                } else {
                                    that.setData({
                                        [`chooseList[${index}].choose`]: false
                                    })
                                }
                            })
                        }
                        // console.log(that.data.chooseList);
                        // if (wx.getStorageSync('chooseList')) {
                        //     that.setData({
                        //         chooseList:wx.getStorageSync('chooseList')
                        //     })
                        // }
                        wx.setStorageSync('addressList', res.data.data)
                    } else {
                        wx.showToast({
                            title: '请重试',
                            icon: "error",
                            duration: 500,
                            success: function () {
                                undefined
                                setTimeout(function () {
                                    undefined
                                    wx.navigateBack({
                                        delta: 1,
                                    })
                                }, 500);
                            }
                        })
                    }
                }).catch(res => {
                    console.log('fail:', res);
                })
            } else {
                return
            }
        })

    },
    onShow: function () {

        if (!this.data.addressList) {
            this.setData({
                addressList: wx.getStorageSync('addressList')
            })
            console.log(this.data.addressList);
        }
        // api.request(
        //     'http://61.189.160.73:50080/api/?token=' + encodeURIComponent(wx.getStorageSync('token')) + '&action=getuserinfo',
        //     'POST',{}).then(res => {
        //     console.log(res);
        //     // if (res.data.code == 21000) {
        //     //     wx.login({
        //     //         success: res => {
        //     //             api.request(
        //     //                 'http://61.189.160.73:50080/api/?js_code=' + res.code,
        //     //                 'POst').then(res => {
        //     //                 console.log(res);
        //     //                 if (res.data.code == 0) {
        //     //                     wx.setStorageSync('token', res.data.token)
        //     //                     return res.data.token
        //     //                 }
        //     //             }).catch(res => {
        //     //                 console.log(res);
        //     //             })
        //     //         }
        //     //     })
        //     // }else{

        //     // }
        // })
    },
    // 默认地址选中点击事件
    clickDefault(e) {
        var that = this
        var index = e.currentTarget.dataset.index;
        var id = e.currentTarget.dataset.id;
        var token = wx.getStorageSync('token')
        // 判断token是否过期
        console.log(index);
        console.log(this.data.addressList[index].isDefault);
        if ((index != 0 || this.data.addressList[index].isDefault == false) && (this.data.addressList.length == 1 || this.data.addressList[index].isDefault == false)) {
            check.judgeNetworkStatus(function (res) {
                if (res != "none") {
                    that.setData({
                        token: check.checkToken()
                    })
                    console.log(token);
                    token = wx.getStorageSync('token')
                    console.log(token);
                    that.setData({
                        ['checkedAddress.id']: id,
                        ['checkedAddress.isDefault']: true
                    }, function () {
                        console.log(this.setData.checkedAddress);
                        api.request(
                            'http://61.189.160.73:50080/api/?token=' + token + '&action=updateaddress' + '&addressinfo=' + encodeURIComponent(base64.encode(JSON.stringify(this.data.checkedAddress))),
                            'POST'
                        ).then(res => {
                            if (res.data.code == 20000) {
                                console.log(this.data.checkedAddress);
                                console.log(res);
                                this.data.addressList.forEach(function (v) {
                                    if (v.id != id) {
                                        v.isDefault = false;
                                        wx.showToast({
                                            title: '修改成功',
                                        })
                                    } else {
                                        v.isDefault = true;
                                    }
                                })
                                // 选中地址默认第一
                                var address = this.data.addressList.splice(index, 1)[0];
                                this.data.addressList = [address, ...this.data.addressList];
                                wx.setStorageSync('addressList', this.data.addressList)
                                console.log(this.data.addressList);
                                this.setData({
                                    addressList: this.data.addressList
                                })
                                this.onLoad()
                            }
                        }).catch(res => {
                            console.log(res);
                            wx.showToast({
                                title: '修改失败',
                                icon: 'error'
                            })
                        })
                        console.log(this.setData.checkedAddress);
                    })
                }
            })
        }

    },

    // 显示确认删除
    ifDelete(e) {
        var app = getApp()
        app.globalData.index = e.currentTarget.dataset.index;
        app.globalData.id = e.currentTarget.dataset.id;
        this.setData({
            showIf: true
        })
    },

    // 删除点击事件
    clickDelete(e) {
        var app = getApp()
        var that = this
        var type = e.currentTarget.dataset.type
        if (type == 0) {
            that.setData({
                showIf: false
            })
        } else if (type == 1) {
            var index = app.globalData.index;
            var id = app.globalData.id;
            console.log(index);
            console.log(id);
            var token = wx.getStorageSync('token')
            // 判断token是否过期
            check.judgeNetworkStatus(function (res) {
                if (res != "none") {
                    that.setData({
                        token: check.checkToken()
                    })
                    token = wx.getStorageSync('token')
                    api.request(
                        'http://61.189.160.73:50080/api/?token=' + token + '&action=deladdress' + '&addressid=' + id,
                        'POST'
                    ).then(res => {
                        if (res.data.code == 20000) {
                            console.log(res);
                            that.data.addressList.splice(index, 1);
                            wx.setStorageSync('addressList', that.data.addressList)
                            wx.showToast({
                                title: '删除成功',
                            })
                            console.log(that.data.addressList);
                            that.setData({
                                addressList: that.data.addressList,
                                showIf: false
                            })
                            this.onLoad()
                        }
                    }).catch(res => {
                        console.log('fail:', res);
                        wx.showToast({
                            title: '请重试',
                            icon: "error"
                        })
                    })
                }
            })

        }
    },

    // 编辑点击事件
    clickEdit(e) {
        var index = e.currentTarget.dataset.index;
        var address = this.data.addressList[index];
        wx.navigateTo({
            url: '../address/edit?address=' + JSON.stringify(address),
        })
    },
    // 添加点击事件
    clickAdd(e) {
        // if (Object.keys(this.data.addressList).length === 0) {   
        //     wx.navigateTo({
        //         url: '../address/edit?index='+'0',
        //     })
        // }else{
        //     wx.navigateTo({
        //       url: '../address/edit',
        //     })
        // }
        wx.navigateTo({
            url: '../address/edit',
        })
    },
    choose(e) {
        var that = this
        var {id} = e.currentTarget.dataset
        getApp().globalData.chooseId = id
        this.data.chooseList.forEach(function (v, index) {
            undefined
            if (v.id == id) {
                that.setData({
                    [`chooseList[${index}].choose`]: true
                })
            } else {
                that.setData({
                    [`chooseList[${index}].choose`]: false
                })
            }
        })
        wx.setStorageSync('chooseList', this.data.chooseList)
    },
    checkAdd() {
        var id = getApp().globalData.chooseId
        wx.navigateBack({
            delta: 1,
        })
    }
})