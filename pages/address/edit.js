// pages/address/edit.js
const api = require('../../utils/promise')
var base64 = require('../../utils/base64.js');
const checkToken = require('../../utils/check');
const check = require('../../utils/check');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        address: {
            id: 0,
            name: '',
            mobile: '',
            city: '',
            street: '',
            isDefault: false
        },
        checkedAddress: {},
        addressList: [],
        token: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var index = options.index
        var isDefault
        console.log(options);
        var addressList = wx.getStorageSync('addressList')
        if (!addressList) {
            this.setData({
                'address.isDefault': true
            })
        }
        if (options.address) {
            this.setData({
                address: JSON.parse(options.address)
            })
        } else {
            // 添加地址
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


    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    // 验证信息
    checkAddress() {
        var address = this.data.address;
        var tipStr = "";
        if (address.name.length == 0) {
            tipStr = "请填写收货人姓名"
        } else if (address.mobile.length == 0) {
            tipStr = "请填写收货人手机号"
        } else if (address.mobile.length != 11) {
            tipStr = "请输入正确的手机号"
        } else if (address.city.length == 0) {
            tipStr = "请选择所在地址"
        } else if (address.street.length == 0) {
            tipStr = "请填写详细地址"
        }
        if (tipStr.length == 0) {
            return true
        } else {
            wx.showToast({
                icon: 'none',
                title: tipStr,
            })
            return false;
        }
    },

    inputName(e) {
        this.data.address.name = e.detail.value;
        this.setData({
            address: this.data.address
        })
    },
    inputMobile(e) {
        this.data.address.mobile = e.detail.value;
        this.setData({
            address: this.data.address
        })
    },
    inputStreet(e) {
        this.data.address.street = e.detail.value;
        this.setData({
            address: this.data.address
        })
    },
    //绑定地址
    bindRegionChange(e) {
        var city = e.detail.value;
        this.data.address.city = city.join(" ");
        this.setData({
            address: this.data.address
        })
    },
    clickDefault() {
        if (this.data.address.isDefault) {
            this.data.address.isDefault = false;
        } else {
            this.data.address.isDefault = true;
        }
        this.setData({
            address: this.data.address
        })
    },

    clickAdd() {
        var that = this
        if (!this.checkAddress()) {
            return
        }
        var addressList = wx.getStorageSync('addressList');
        var address = this.data.address;
        var isAdd = false; //添加或编辑
        var addressListNew = [];
        var indexDefault = -1; //默认选中地址索引
        var indexCurrent = -1; //编辑地址在列表中的索引

        console.log(address.id);
        if (address.id == 0) {
            if (!addressList) {
                address.isDefault = true;
            }
            isAdd = true;
            address.id = Math.floor(Math.random() * 1000 + 1);
            if (addressList) {
                addressList.forEach(function (v, index) {
                    if (v.isDefault) {
                        indexDefault = index;
                    }
                    //如果选中为默认，则清除其他地址的状态
                    if (address.isDefault) {
                        v.isDefault = false;
                    }
                })
            }
            console.log("11");
            console.log(address);
            var jsonAddress = JSON.stringify(address)
            var token = wx.getStorageSync('token')
            // 判断token是否过期
            check.judgeNetworkStatus(function (res) {
                if (res != "none") {
                    that.setData({
                        token: check.checkToken()
                    })
                    token = wx.getStorageSync('token')
                    api.request(
                        'http://61.189.160.73:50080/api/?token=' + token + '&action=addaddress' + '&addressinfo=' + encodeURIComponent(base64.encode(jsonAddress)),
                        'POST'
                    ).then(res => {
                        console.log(res);
                        addressListNew = [address, ...addressList];
                        console.log("222");
                        wx.setStorageSync('addressList', addressListNew)
                        console.log(addressListNew);
                        that.setData({
                            addressList: addressListNew
                        })
                        console.log(addressList);
                        if (res.data.code == 20000) {
                           wx.showToast({
                            title: '添加成功',
                        }) 
                        }else{
                            wx.showToast({
                                title: '添加失败',
                                icon: "error"
                            })
                        }
                        
                    }).catch(res => {
                        console.log(res);
                        
                    })
                }
            })
            indexCurrent = 0;
        } else {
            //编辑地址
            addressList.forEach(function (v, index) {
                if (v.isDefault) {
                    indexDefault = index;
                }
                //如果选中为默认，则清除其他地址的状态
                if (address.isDefault) {
                    v.isDefault = false;
                }
                //若同一地址，赋值给旧的
                if (address.id == v.id) {
                    that.setData({
                        ['checkedAddress.id']: address.id
                    })
                    if (v.name != address.name) {
                        that.setData({
                            ['checkedAddress.name']: address.name
                        })
                    }
                    if (v.mobile != address.mobile) {
                        that.setData({
                            ['checkedAddress.mobile']: address.mobile
                        })
                    }
                    if (v.city != address.city) {
                        that.setData({
                            ['checkedAddress.city']: address.city
                        })
                    }
                    if (v.street != address.street) {
                        that.setData({
                            ['checkedAddress.street']: address.street
                        })
                    }
                    if (v.isDefault != address.isDefault) {
                        that.setData({
                            ['checkedAddress.isDefault']: address.isDefault
                        })
                    }
                    console.log(that.data.checkedAddress);
                    var jsonAddress = JSON.stringify(that.data.checkedAddress)
                    var token = wx.getStorageSync('token')
                    console.log(token);
                    // 判断token是否过期
                    that.setData({
                        token: checkToken.checkToken()
                    })
                    token = wx.getStorageSync('token')
                    api.request(
                        'http://61.189.160.73:50080/api/?token=' + token + '&action=updateaddress' + '&addressinfo=' + encodeURIComponent(base64.encode(jsonAddress)),
                        'POST'
                    ).then(res => {
                        console.log(res);
                        v.name = address.name;
                        v.mobile = address.mobile;
                        v.city = address.city;
                        v.street = address.street;
                        v.isDefault = address.isDefault;
                        indexCurrent = index;

                        wx.showToast({
                            title: '保存成功!',
                        })
                    }).catch(res => {
                        console.log(err);
                        wx.showToast({
                            title: '保存失败!',
                            icon: "error"
                        })
                    })
                    indexCurrent = index;
                }
            })
            addressListNew = addressList;
        }
        that.changeParentData()
        //新的地址都无默认选中地址，将当前地址设为默认选中
        if (indexCurrent == -1) {
            addressListNew[indexCurrent].isDefault = true;
        } else {
            //如果编辑的就是默认选中地址，则仍将当前地址设为默认地址
            if (indexDefault == indexCurrent && !isAdd) {
                addressListNew[indexCurrent].isDefault = true;
            }
        }
        that.setData({
                addressList: addressListNew
            },
            function () {
                wx.setStorageSync('addressList', addressList)
                console.log(addressList);
                console.log(wx.getStorageSync('addressList'))
            })

        console.log(addressListNew)

                // that.changeParentData();
                wx.navigateBack({
                    delta: 1,
                })
                that.changeParentData();
        },
    // 自动选择位置
    clickLocation() {
        var that = this
        //获取授权
        wx.authorize({
            scope: 'scope.userLocation',
            success(e) {
                wx.getLocation({
                    type: 'gcj02',
                    success(location) {
                        wx.chooseLocation({
                            success(res) {
                                var address_info = res.address;
                                that.data.address.city = address_info;
                                that.setData({
                                    address: that.data.address
                                })
                            }
                        })
                    }
                })
            }
        })
    },
    changeParentData: function () {
        var pages = getCurrentPages(); //当前页面栈
        console.log(pages);
        if (pages.length > 1) {
            var beforePage = pages[pages.length - 2]; //获取上一个页面实例对象
            beforePage.changeData(); //触发父页面中的方法
        }
    }
})