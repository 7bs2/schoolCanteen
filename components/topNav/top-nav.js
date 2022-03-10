const app = getApp()
Component({

    properties: {
      // 标题名称
      name: {
        type:String,
        value: ''
      }
    },

    data: {
        statusBarHeight: app.globalData.statusBarHeight
      },

    methods: {

    }
})
