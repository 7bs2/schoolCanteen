// var config = require('../../../utils/config.js');
// var http = require('../../../utils/request.js');
import { request } from "../../request/utilRequest.js"
// pages/order/order.js
var app = getApp()
var base64 = require('../../utils/base64.js');
Page({
  data: {
    shops_id:"",
    scanCodeMsg: "",
    showModal: false,
    head_message:{},
      tabs: [],
      // food列表
      foodList:[],
      indexId: 0,
      toTitle: "title-0",
      scrollTop: 0,
      top: [],
      totalPrice: 0, //选中商品总价格
      totalNum: 0, //选中商品数量
      cartList: [], //选中商品列表
      // 购物车动画
      animationData: {},
      animationMask: {},
      maskVisual: "hidden",
      maskFlag: true,
      
      // 规格列表
      format_list:{
          id:"",
          arr:[]
      },
      // 规格单选
      select_num:-1,
      list_num:-1,
      // 简介显示
      show_img:false,
      // 滚动falg
      scroll_flag:true,
    // 简介mask标识
      intro_flag:false,
      gui_ge_list:[],
      // 优惠的金额
      money:0,
      // 优惠卷使用的条件
      condition:0,
      yhj_id:"",
      // 自动添加规格
      auto_add:false,
      // 最终的价格(减去优惠卷)
      end_price:0,
      show:true
  },
  test:function() {
      console.log(this.data.cartList)
  },
  onLoad: async function (options) {
    var that = this;
    setTimeout(() => {
        that.setData({
            show:false
        })
    }, 1500);
   var feilei_id = options.class || ''
   console.log(feilei_id)
   app.watch(this, {
    indexId:function() {
        wx.vibrateShort({
          success: (res) => {},
        })
    }
   })
    
    that.setData({
        shops_id:options.shops_id
    })
   
    wx.showLoading({
        mask: true,
        title: '加载中…'
    })
    // 清缓存
    var arr = wx.getStorageSync('cart')
    if(arr.length != 0) {
        wx.removeStorageSync('cart')
    }
    wx.hideLoading()    
    that.getList()
   setTimeout(() => {
    if (feilei_id != '') {
        console.log(this.data.tabs)
        var arr = this.data.tabs
        for (var i = 0;i< arr.length;i++) {
            if(arr[i].ch_typeno == feilei_id) {
                this.setData({
                    scroll_flag:false
                })
                that.setData({
                    indexId: i,
                    toTitle: "title-" + feilei_id
                });
            }
        }
    }
   }, 500)
},

    checkRecommend:function(id) {

    },
   navMoeny:function() {
       if(this.data.totalPrice <= 0) {
           wx.showToast({
             title: '未选择菜品',
             icon:'error'
           })
           return
       }
    wx.navigateTo({
      url: '../paymentVoucher/paymentVoucher?money=' + this.data.totalPrice,
    })
},
  // 扫码
  scanCode: function(e) {
    var mode = e.currentTarget.dataset.mode
    this.orderRequest(mode)
    wx.scanCode({ //扫描微信API
      onlyFromCamera:true,
      success: (res) => {
        console.log(res);
        this.setData({
            scanCodeMsg: res.result
        })
        wx.navigateTo({
          url: '/pages/payment/payment?data='+this.data.scanCodeMsg + '&name=' + this.data.head_message.shops_name,
        })
      }
    })
  },
  //预约
  makeAnAppointment: function(e) {
    var mode = e.currentTarget.dataset.mode
    this.orderRequest(mode)
    wx.navigateTo({
        url: '/pages/secondPayment/secondPayment?name=' + this.data.head_message.shops_name
      })
  },
  outFood:function(e) {
    var mode = e.currentTarget.dataset.mode
    this.orderRequest(mode)
    wx.navigateTo({
        url: '/pages/thridPayment/thridPayment?name=' + this.data.head_message.shops_name
      })
  },
  jumpIndex(e) {
      this.setData({
          scroll_flag:false
      })
    console.log(e);
    let index = e.currentTarget.dataset.menuindex;
    let ch_typeno = e.currentTarget.dataset.ch_typeno;
    let that = this
    that.setData({
        indexId: index,
        toTitle: "title-" + ch_typeno
    });
},
 //右侧滚动
 scrollToLeft(res) {
    if(this.data.scroll_flag) {
      this.setData({
          scrollTop: res.detail.scrollTop
      })
      var length = this.data.top.length;
      for (var i = 0; i < this.data.top.length; i++) {
          if (i ==  this.data.top.length - 1 && this.data.top[i] -  this.data.top[0] <= this.data.scrollTop) {
            this.setData({
                indexId: i,
            });
          }
          if (this.data.top[i] - this.data.top[0] <= this.data.scrollTop && (i < length - 1 && this.data.top[i + 1] - this.data.top[0] > this.data.scrollTop)) {
              if (this.data.indexId != i) {
               // console.log(this.data.top[i] - this.data.top[0])
                  this.setData({
                      indexId: i,
                  });
                  break
              }
          }
      }
    }
   this.setData({
       scroll_flag:true
   })
},
   // 外面的弹窗
   btn: function (e) {
    var id = e.currentTarget.dataset.id;
    for (var i in this.data.foodList) {
        if (this.data.foodList[i].goods_id == id) {
            if(parseInt(this.data.foodList[i].quantity) > 0) {
                wx.showToast({
                  title: '已选择',
                  icon:'error',
                  duration:500
                })
                return
            }
            var obj = {
                id:"",
                arr:[]
            }
            obj.id = id;
            obj.arr = this.data.foodList[i].format_list
            this.setData({
                format_list:obj
            })
            
            break;
        } 
    }
    this.setData({
      showModal: true
    })
    var list = this.data.format_list.arr
    for (var i = 0;i < list.length;i++) {
        if (list[i].format_name == '口味' && list[i].item_list.length == 1) {
            var arr = new Array();
            this.setData({
                auto_add:true
            })
            arr.push(list[i].item_list[0])
            this.setData({
                gui_ge_list:arr
            })
        }
    }
    console.log(this.data.gui_ge_list)
  },
  test:function() {
      console.log(this.data.gui_ge_list)
  },
  // 规格选择
  select: function(e) {
     
      console.log(e.currentTarget.dataset.title)
      console.log(e.currentTarget.dataset.name)
      console.log(e.currentTarget.dataset.id)
      var id = e.currentTarget.dataset.id
      var title = e.currentTarget.dataset.title
      var name = e.currentTarget.dataset.name
      var list = this.data.gui_ge_list
      
      if (this.data.auto_add == true && list.length != 0) {
          wx.showToast({
            title: '默认已添加',
            duration:500
          })
          return
      }
    //   var item = e.currentTarget.dataset.name2
      if(title == "计量单位" || title == "禁忌民族") {
          return
      }else {
          var arr = new Array();
          this.setData({
              gui_ge_list:arr
          })
         
          arr.push(name)
          console.log(arr)
          wx.showToast({
            title: '已添加规格',
            duration: 500
          })
         this.setData({
             gui_ge_list:arr
         })
      }
    //  if(index != this.data.select_num ) {
    //      console.log("fsf")
    //     this.setData({
    //         select_num:index
    //       })
    //       var arr = this.data.foodList
    //       var arr2 = new Array()
    //       this.setData({
    //           gui_ge_list:arr2
    //       })
    //       for(var i = 0;i < arr.length;i++) {
    //           if(id == arr[i].goods_id) {
    //               arr2.push(item)
    //               break
    //           }
    //       }
    //       this.setData({
    //           gui_ge_list:arr2
    //       })
    //       console.log(this.data.gui_ge_list)
    //  }
  },
 
  // 禁止屏幕滚动
  preventTouchMove: function () {
  },
  toDetail:function(e) {
      var foods = wx.getStorageSync('cart') || []
      console.log(foods)
      var id = e.currentTarget.dataset.id
      console.log(id)
      var len =  foods.length
      for (var i= 0;i<len;i++) {
          if(foods.goods_id == id && foods[i].quantity > 0) {
              wx.showToast({
                title: '已添加',
                icon:'error',
                duration:700
              })
              return
          }
      }
      wx.navigateTo({
        url: '/pages/detail/detail?id=' + id + '&shopId=' + this.data.shops_id,
      })
  },
  // 规格确定
  confim:function(e) {
    var arr1 = this.data.gui_ge_list;
    console.log(arr1)
    var item_list = this.data.format_list.arr
    var item2_list = new Array()
    for(var i=0;i<item_list.length;i++) {
        if(item_list[i].format_name == '口味') {
            item2_list = item_list[i].item_list
            break
        }
    }
    
    if (item2_list.length > 1 && arr1.length == 0) {
        wx.showToast({
          title: '未选口味',
          icon:'error',
          duration: 500
        })
        return
    }
    var id = e.currentTarget.dataset.id;
    var arr2 = this.data.foodList
    for(var i = 0;i < arr2.length;i++) {
        if(id == arr2[i].goods_id) {
            if(arr1.length == 0) {
                console.log('未添加')
                arr2[i].information = ''
            }else {
                console.log('添加')
                console.log(arr1[0])
                arr2[i].information += arr1[0]
            }
            console.log(arr2[i])
            break
        }
    }
    this.setData({
        foodList:arr2
    })
    var arr = wx.getStorageSync('cart') || [];
    var f = false;
    for (var i in this.data.foodList) { // 遍历菜单找到被点击的菜品，数量加1
        if (this.data.foodList[i].goods_id == id) {
            this.data.foodList[i].quantity = parseInt(this.data.foodList[i].quantity) + 1;

            if (arr.length > 0) {
                for (var j in arr) { // 遍历购物车找到被点击的菜品，数量加1
                    if (arr[j].goods_id == id) {
                        arr[j].quantity += 1;
                        arr[j].information = arr1[0];
                        f = true;
                        try {
                            wx.setStorageSync('cart', arr)
                        } catch (e) {
                            console.log(e)
                        }
                        break;
                    }
                }
                if (!f) {
                    arr.push(this.data.foodList[i]);
                }
            } else {
                arr.push(this.data.foodList[i]);
            }
            try {
                wx.setStorageSync('cart', arr)
            } catch (e) {
                console.log(e)
            }
            break;
        }
    }
    this.setData({ 
        cartList: arr,
        foodList: this.data.foodList
    })
    console.log(this.data.cartList)
    this.getTotalPrice();
    this.ok()  
  },


intro_mask:function() {
    this.setData({
        intro_flag:false,
    })
},
  offIntro:function() {
    this.setData({
        show_img:false
    })
  },
 
  // 弹出层里面的弹窗
  ok: function () {
    
    this.setData({
      showModal: false,
      select_num:-1,
      list_num:-1,
      auto_add:false
    })
    var arr = new Array()
    this.setData({
        gui_ge_list:arr
    })
  },
  // 左侧点击事件
  spIndex(e) {
      this.setData({
          scroll_flag:false
      })
      let id = e.currentTarget.dataset.menuindex;
      let ch_typeno = e.currentTarget.dataset.ch_typeno;
      let that = this
      that.setData({
          indexId: id,
          toTitle: "title-" + ch_typeno
      });
      
  },
 getList:function() {
    wx.request({
        url: 'http://61.189.160.73:50080/api/?action=menuheadandleft&shopid=' + this.data.shops_id,
        success:(res)=> {
            console.log(res.data)
            this.setData({
                head_message:res.data.head_message,
                tabs:res.data.tabs
            }
            )
            this.getFoodList()
        },
        fail:(e) => {
            wx.showToast({
                title: '请重试',
                icon: "error"
            })  
        }
      })  
   
 },

 // foodList
 getFoodList: function() {
     var foods = wx.getStorageSync(this.data.head_message.shopid)
     if(!foods) {
        wx.request({
            url: 'http://61.189.160.73:50080/api/?action=menuright&shopid=' + this.data.shops_id,
            success:(res)=> {
                console.log(res.data)
                this.setData({
                   foodList:res.data.foods_List
                })
                wx.setStorageSync(this.data.head_message.shopid, {time:Date.now(),data:this.data.foodList})
                setTimeout(() => {
                    this.getTop()
                }, 500);
            },
            fail:(e) => {
                wx.showToast({
                    title: '请重试',
                    icon: "error"
                })  
            }
          })
     }else {
         if(Date.now() - foods.time > 1000 * 200) {
             console.log("重新请求")
            wx.request({
                url: 'http://61.189.160.73:50080/api/?action=menuright&shopid=' + this.data.shops_id,
                success:(res)=> {
                    console.log(res.data)
                    this.setData({
                       foodList:res.data.foods_List
                    })
                    wx.setStorageSync(this.data.head_message.shopid, {time:Date.now(),data:this.data.foodList})
                    setTimeout(() => {
                        this.getTop()
                    }, 500);
                },
                fail:(e) => {
                    wx.showToast({
                        title: '请重试',
                        icon: "error"
                    })  
                }
              })  
         }else {
            this.setData({
                foodList:foods.data
             })
             setTimeout(() => {
                this.getTop()
            }, 500);
         }
     }
    
 },
 // view顶部距离
getTop:function() {
    wx.getSystemInfo({
        success:(res) => {
          this.setData({
            winHeight: res.windowHeight - 100
          });
          var top2 = new Array();
         
          for (var j = 0; j < this.data.tabs.length; j++) {
            wx.createSelectorQuery().select('#view-' + this.data.tabs[j].ch_typeno).boundingClientRect(function (rect) {
              var isTop = Number(rect.top);
             
              top2.push(isTop);
             
            }).exec();
          }                 
          this.setData({
            top: top2
          });
        }
      });
},

  onShow: function (options) {
      var that = this;
      // 获取购物车缓存数据
      var arr = wx.getStorageSync('cart') || [];
      // 进入页面后判断购物车是否有数据，如果有，将菜单与购物车quantity数据统一
      if (arr.length > 0) {
          for (var i in arr) {
              for (var j in that.data.foodList) {
                  if (that.data.foodList[j].goods_id == arr[i].goods_id) {
                      that.data.foodList[j].quantity = arr[i].quantity;
                      break
                  } 
                  // else {
                  //     that.data.foodList[j].quantity = 0;
                  // }
              }
          }
      } else {
          for (var j in that.data.foodList) {
              that.data.foodList[j].quantity = 0;
          }
      }
      // 进入页面计算购物车总价、总数
      var totalPrice = 0;
      var totalNum = 0;
      if (arr.length > 0) {
          for (var i in arr) {
              totalPrice += arr[i].price * arr[i].quantity;
              totalNum += Number(arr[i].quantity);
          }
      }
      console.log(totalPrice)
      //赋值数据
      this.setData({
          cartList: arr,
          foodList: that.data.foodList,
          totalPrice: totalPrice.toFixed(2),
          totalNum: totalNum
      })
      this.getTotalPrice()
  },
  
  // 页面卸载
  onUnload: function() {
    wx.removeStorageSync('cart')
  },
  // 购物车增加数量
  addCart: function (e) {
      var id = e.currentTarget.dataset.id;
      var arr = wx.getStorageSync('cart') || [];
      var f = false;
      for (var i in this.data.foodList) { // 遍历菜单找到被点击的菜品，数量加1
          if (this.data.foodList[i].goods_id == id) {
              this.data.foodList[i].quantity = parseInt(this.data.foodList[i].quantity) + 1;
              console.log( this.data.foodList[i].quantity)
              if (arr.length > 0) {
                  for (var j in arr) { // 遍历购物车找到被点击的菜品，数量加1
                      if (arr[j].goods_id == id) {
                          arr[j].quantity += 1;
                          f = true;
                          try {
                              wx.setStorageSync('cart', arr)
                          } catch (e) {
                              console.log(e)
                          }
                          break;
                      }
                  }
                  if (!f) {
                      arr.push(this.data.foodList[i]);
                  }
              } else {
                  arr.push(this.data.foodList[i]);
              }
              try {
                  wx.setStorageSync('cart', arr)
              } catch (e) {
                  console.log(e)
              }
              break;
          }
      }
      this.setData({
          cartList: arr,
          foodList: this.data.foodList
      })
     
      this.getTotalPrice();
  },
  // 购物车减少数量
  delCart: function (e) {
      var id = e.currentTarget.dataset.id;
      var arr = wx.getStorageSync('cart') || [];
      for (var i in this.data.foodList) {
          if (this.data.foodList[i].goods_id == id) {
              this.data.foodList[i].quantity -= 1;
              if (this.data.foodList[i].quantity <= 0) {
                  console.log(true)
                  this.data.foodList[i].quantity = 0;
                  console.log(this.data.foodList[i])
              }
              if (arr.length > 0) {
                  for (var j in arr) {
                      if (arr[j].goods_id == id) {
                          arr[j].quantity -= 1;
                          if (arr[j].quantity <= 0) {
                              this.removeByValue(arr, id) 
                          }
                          if (arr.length <= 0) {
                              this.setData({
                                  foodList: this.data.foodList,
                                  cartList: [],
                                  totalNum: 0,
                                  totalPrice: 0,
                              })
                              this.cascadeDismiss()
                          }
                          try {
                              wx.setStorageSync('cart', arr)
                          } catch (e) {
                              console.log(e)
                          }
                      }
                  }
              }
          }
      }
      this.setData({
          cartList: arr,
          foodList: this.data.foodList
      })
      console.log('list')
      console.log(this.data.cartList)
      this.getTotalPrice();
       // 优惠卷变换价格变换
       if(this.data.totalPrice < this.data.condition) {
        this.setData({
            money:0,
            condition:0
        })
        wx.showToast({
          title: '请重选优惠卷',
          duration:1000
        })
    }
  },
  // 定义根据id删除数组的方法
  removeByValue: function (array, val) {
      for (var i = 0; i < array.length; i++) {
          if (array[i].f_Cooks_Id == val) {
              array.splice(i, 1);
              break;
          }
      }
  },
  // 获取购物车总价、总数
  getTotalPrice: function () {
      var cartList = this.data.cartList; // 获取购物车列表
      var totalP = 0;
      var totalN = 0
      for (var i in cartList) { // 循环列表得到每个数据
          totalP += cartList[i].quantity * cartList[i].price; // 所有价格加起来     
          totalN += cartList[i].quantity
      }
      this.setData({ // 最后赋值到data中渲染到页面
          cartList: cartList,
          totalNum: totalN,
          totalPrice: totalP.toFixed(2),
          end_price: (totalP -  this.data.money).toFixed(2)
      });
  },
  // 清空购物车
  cleanList: function (e) {
      for (var t in this.data.tabs) {
          for (var j in this.data.foodList) {
              this.data.foodList[j].quantity = 0;
              this.data.foodList[j].information = ''
          }
      }
      try {
          wx.setStorageSync('cart', "")
      } catch (e) {
          console.log(e)
      }
      this.setData({
          foodList: this.data.foodList,
          cartList: [],
          cartFlag: false,
          totalNum: 0,
          totalPrice: 0,
      })
      this.cascadeDismiss()
       // 优惠卷变换价格变换
       if(this.data.totalPrice < this.data.condition) {
        this.setData({
            money:0
        })
    }
    this.getTotalPrice()
  },
  //删除购物车单项
  deleteOne: function (e) {
      var id = e.currentTarget.dataset.id;
      var index = e.currentTarget.dataset.index;
      var arr = wx.getStorageSync('cart')
      for (var i in this.data.foodList) {
          if (this.data.foodList[i].goods_id == id) {
              this.data.foodList[i].quantity = 0;
          }
      }
      arr.splice(index, 1);
      if (arr.length <= 0) {
          this.setData({
              foodList: this.data.foodList,
              cartList: [],
              cartFlag: false,
              totalNum: 0,
              totalPrice: 0,
          })
          this.cascadeDismiss()
      }
      try {
          wx.setStorageSync('cart', arr)
      } catch (e) {
          console.log(e)
      }
      this.setData({
          cartList: arr,
          foodList: this.data.foodList
      })
      this.getTotalPrice()
      // 总价格为负数的情况优化
      console.log(this.data.condition)
      if(this.data.totalPrice < this.data.condition) {
          console.log('ydiwgduw')
          this.setData({
              money:0
          })
      }
  },
  //切换购物车开与关
  cascadeToggle: function () {
      var that = this;
      if (that.data.maskVisual == "hidden") {
          that.cascadePopup()
      } else {
          that.cascadeDismiss()
      }
  },
  // 打开购物车方法
  cascadePopup: function () {
      var that = this;
      // 购物车打开动画
      var animation = wx.createAnimation({
          duration: 200,
          timingFunction: 'ease-in-out',
          delay: 0
      });
      that.animation = animation;
      animation.translate(0, -285).step();
      that.setData({
          animationData: that.animation.export(),
      });
      // 遮罩渐变动画
      var animationMask = wx.createAnimation({
          duration: 200,
          timingFunction: 'linear',
      });
      that.animationMask = animationMask;
      animationMask.opacity(0.8).step();
      that.setData({
          animationMask: that.animationMask.export(),
          maskVisual: "show",
          maskFlag: false,
      });
  },
  // 关闭购物车方法
  cascadeDismiss: function () {
      var that = this
      // 购物车关闭动画
      that.animation.translate(0, 285).step();
      that.setData({
          animationData: that.animation.export()
      });
      // 遮罩渐变动画
      that.animationMask.opacity(0).step();
      that.setData({
          animationMask: that.animationMask.export(),
      });
      // 隐藏遮罩层
      that.setData({
          maskVisual: "hidden",
          maskFlag: true
      });
  },
  //进入分类
  chooseTap:function() {
      var that = this
      if(that.data.totalPrice == 0) {
          wx.showToast({
            title: '未选择菜品',
            icon:'error'
          })
          return
      }
      var token = wx.getStorageSync('token')
      
      var flag = false
      wx.request({
        url: 'http://61.189.160.73:50080/api/?token=' +  token  + '&action=getorder',
        success:function(res) {
            var code = res.data.code
            if (code == "20000") {
                var arr = res.data.orderlist
                for (var i = 0;i < arr.length;i++) {
                    if(arr[i].ddzt == "0" || arr[i].ddzt == "1") {
                        flag = true
                        break
                    }
                }
            }
            
        }
      })
      setTimeout(() => {
        if(flag) {
            wx.showToast({
              title: '请在订单查看',
              icon:'error'
            })
        }else {
          that.showModal();
        }
      }, 200);
         
          
  },

  orderRequest:function(mode) {
    var arr = wx.getStorageSync('cart')
    console.log(arr)
    var order_list = {
        shopid:"",
        yhj_id:[],
        cp_list:[],
        ycfs:mode
    }
    order_list.yhj_id.push(this.data.yhj_id)
   var oder_food = {
        cpid:"",
        gg:"",
        sl:"",
        bz:"",

    }
    for(var i = 0;i < arr.length;i++) {
        var oder_food = {
            cpid:"",
            gg:"",
            sl:"",
            bz:""
        }
        oder_food.cpid = arr[i].goods_id
        oder_food.gg = arr[i].information
        oder_food.sl = arr[i].quantity
        order_list.cp_list.push(oder_food)
    }
    order_list.shopid = this.data.shops_id
    var token = wx.getStorageSync('token')
    console.log(token)
    console.log(order_list);
    wx.request({
      url:'http://61.189.160.73:50080/api/?token=' + token +'&action=genorder&orderinfo=' + encodeURIComponent(base64.encode(JSON.stringify(order_list))),
      success:(res) => {
          console.log(res)
      },
      fail:(err) => {
          console.log(err)
      }
    })
  },
  //显示对话框
  showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 50,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 50)
  },
  //隐藏对话框
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 100,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  }
})
