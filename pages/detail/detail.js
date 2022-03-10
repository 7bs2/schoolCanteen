var app = getApp()
Page({
    data: {
        statusBarHeight:wx.getSystemInfoSync()['statusBarHeight'] - 3,
        id:"",
        food:{},
        kouwei:[],
        danwei:[],
        mingzui:[],
        kouwei_id:0,
        num:0,
        message:'',
        flag:true
    },
    onLoad: function (options) {
        var that = this
        setTimeout(() => {
            that.setData({
                flag:false
            })
        }, 1200);
        app.watch(this, {
            kouwei_id:function() {
                wx.vibrateShort({
                  success: (res) => {},
                })
            }
           })
        var id = options.id
        var shopId = options.shopId
        that.setData({
            id:id,
        })
        var foods = wx.getStorageSync(shopId).data
        for(var i = 0;i < foods.length; i++) {
            if(id == foods[i].goods_id) {
                that.setData({
                    food:foods[i]
                })
                var arr = foods[i].format_list
                for (var j =0;j<arr.length;j++) {
                    if(arr[j].format_name == '口味') {
                        that.setData({
                            kouwei:arr[j].item_list
                        })
                        if(arr[j].item_list.length > 0) {
                            this.setData({
                                message:arr[j].item_list[0]
                            })
                        }
                    }else if(arr[j].format_name == '计量单位') {
                        this.setData({
                            danwei:arr[j].item_list
                        })
                    }else {
                        that.setData({
                            mingzui:arr[j].item_list
                        })
                    }
                }
                break;
            }
        }
        console.log(this.data.food)
        console.log(this.data.kouwei)
        console.log(this.data.mingzui)
    },

   

    back:function() {
        wx.navigateBack({
          delta: 1,
        })
    },
    select:function(e) {
        var index = e.currentTarget.dataset.index
        var mess = e.currentTarget.dataset.mess
        this.setData({
            kouwei_id:index,
            message:mess
        })
    },
    jian:function() {
        var num = this.data.num
        if(num == 0) {
            return
        }
        this.setData({
            num:num - 1
        })
    },
    jia:function() {
        var num = this.data.num
        this.setData({
            num:num + 1
        })
        
    },
    confim:function(){
        if(this.data.num <= 0) {
            wx.showToast({
              title: '未添加菜品',
              icon:'error',
              duration:700
            })
            return
        }
        var foods = wx.getStorageSync('cart')||[]
        var food = this.data.food
        food.quantity = this.data.num
        food.information = this.data.message
        console.log(food)
        foods.push(food)
        // var id = this.data.id

        // console.log(foods)
        // console.log(id)
        // for(var i = 0;i<len;i++) {
        //     console.log('heloo')
        //     if(foods.data[i].goods_id == id) {
        //         foods.data[i].quantity = num
        //         break
        //     }
        // }
        wx.setStorageSync('cart', foods)
        wx.navigateBack({
          delta: 1,
        })
    }
})