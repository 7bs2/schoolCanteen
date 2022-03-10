 //星星的图片路径
 var starOffImg = "../images/xingxing.png";
 var starOnImg = "../images/xingxing_select.png";
 Page({ 
   /**
    * 页面的初始数据
    */
   data: {  
     starNum: 0,//分数 
     stars: [//星星数组
       {
           id:1,
           src: starOffImg,
           active: false
       }, {
           id:2,
           src: starOffImg,
           active: false
       }, {
           id:3,
           src: starOffImg,
           active: false
       },
       {
           id:4,
           src: starOffImg,
           active: false
       }, {
           id:5,
           src: starOffImg,
           active: false
       }
   ],
   }, 
   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
 
   },
   rating(e){
     var total = this.data.stars.length; //星星总数 
     var idx = e.currentTarget.dataset.clickindex //这代表选的第idx颗星-也代表应该显示的星星数量
     // console.log(e.currentTarget.dataset.clickindex)//点击的星星的id  
     if (this.data.starNum == 0) {    //进入if说明页面为初始状态 
       this.setData({
         starNum:idx
       }) 
       for(var i = 0; i < idx; i++){
         var srcChange='stars['+i+'].src'
         var activeChange='stars['+i+'].active'
         this.setData({
           [srcChange]:starOnImg,
           [activeChange]:true 
         })
       } 
       // console.log(this.data.stars)
     } else {
         //如果再次点击当前选中的星级-仅取消掉当前星级，保留之前的。
         if (idx == this.data.starNum) {
             for (var i = idx-1; i < total; i++) { 
                 var srcChange='stars['+i+'].src'
                 var activeChange='stars['+i+'].active'
                 this.setData({
                   [srcChange]:starOffImg,
                   [activeChange]:false 
                 })
             }
         }
         //如果小于当前最高星级，则直接保留当前星级
         if (idx < this.data.starNum) {
             for (var i = idx; i < this.data.starNum; i++) { 
                 var srcChange='stars['+i+'].src'
                 var activeChange='stars['+i+'].active'
                 this.setData({
                   [srcChange]:starOffImg,
                   [activeChange]:false 
                 })
             }
         }
         //如果大于当前星级，则直接选到该星级
         if (idx > this.data.starNum) {
             for (var i = 0; i < idx; i++) { 
                 var srcChange='stars['+i+'].src'
                 var activeChange='stars['+i+'].active'
                 this.setData({
                   [srcChange]:starOnImg,
                   [activeChange]:true 
                 })
             }
         }
         var count = 0; //计数器-统计当前有几颗星
         for (var i = 0; i < total; i++) {
             if (this.data.stars[i].active) {
                 count++;
             }
         } 
         
         console.log(getApp().globalData.starNum);
         //得到总评分，赋值给starNum
         this.setData({
           starNum:count
         })
     } 
   },
   checkStar(){
    var tipStr = "";
     if (this.data.starNum==0) {
      tipStr = "请给菜品打分"
     }
     if (tipStr.length==0) {
      return true
     }else{
       wx.showToast({
            icon:'none',
         title: tipStr,
       })
      return false;
  }
   },
   backToOrder(){
    getApp().globalData.starNum = this.data.starNum
    console.log(getApp().globalData.starNum);
    if (!this.checkStar()) {
      return
  }
    wx.switchTab({
      url: '../order/order',
    })
   }
 })
 