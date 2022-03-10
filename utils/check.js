const api = require('./promise')

function checkToken(callback) {
  console.log(wx.getStorageSync('token'));
    if (typeof(wx.getStorageSync('token')) != 'undefined') {
        api.request(
            'http://61.189.160.73:50080/api/?token=' + encodeURIComponent(wx.getStorageSync('token')) + '&action=getuserinfo',
            'POST').then(res => {
            console.log(res);
            if (res.data.code == 20001) {
                wx.login({
                    success: res => {
                        api.request(
                            'http://61.189.160.73:50080/api/?js_code=' + res.code,
                            'POst').then(res => {
                            console.log(res);
                            if (res.data.code == 0) {
                                wx.setStorageSync('token', res.data.token)
                                checkToken(res.data.token)
                                return res.data.token
                            }
                        }).catch(res => {
                            console.log(res);
                        })
                    }
                })
            }else{
                return wx.getStorageSync('token')
            }
        }).catch(res => {
            console.log(res);
        })
    }
    return
}

function judgeNetworkStatus(callback) {
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        console.log(res);
        if (networkType == "none") {
          wx.showToast({
            title: '网络连接失败',
            icon:'error'
          })
          judgeNetworkStatus(callback);
        } else {
         
          callback(networkType)
        }
      },
      fail(err) {
        console.log(err)
      }
      ,
      complete(cpe) {
        console.log(cpe)
      }
    })
  }
  

module.exports = {
    checkToken:checkToken,
    judgeNetworkStatus: judgeNetworkStatus
}