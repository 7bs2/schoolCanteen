// pages/localSearch/localSearch.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showModal: false,
        number:0,
        foodsList:[],
        shopid:"",
        search_list:[],  
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options.shopid)
        this.setData({
            shopid:options.shopid
        })

        var list = wx.getStorageSync(this.data.shopid)
        this.setData({
            foodsList:list.data
        })
    },

    searchInput:function(e) {
        var name = e.detail.value
        if(name == '') {
            name = '+'
        }
        var foods = this.data.foodsList
        console.log(foods)
        var length = foods.length
        var arr = new Array()
        for(var i = 0;i < length;i++) {
            if(foods[i].goods_name.includes(name)) {
                arr.push(foods[i])
            }
        }
        this.setData({
            search_list:arr
        })
    },    
})