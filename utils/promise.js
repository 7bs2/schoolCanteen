var app = getApp();
var baseUrl = getApp().baseUrl;
 
//添加事件结束
Promise.prototype.finally = function (callback) {
    var Promise = this.constructor;
    return this.then(
        function (value) {
            Promise.resolve(callback()).then(
                function () {
                    return value;
                }
            );
        },
        function (reason) {
            Promise.resolve(callback()).then(
                function () {
                    throw reason;
                }
            );
        }
    );
}
const request = (url, method, data) => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: url,
            data: data,
            method: method,
            header: {
                'content-type': 'application/json',
                'version': app.globalData.version
            },
            success: function (res) {
                if (res.statusCode == 200) {
                    resolve(res); //返回成功提示信息
                } else {
                    reject(res.data.message); //返回错误提示信息
                }
            },
            fail: function (res) {
                reject(res); //返回错误提示信息
            },
            complete: function (res) {
 
            }
        })
    });
}
module.exports = {
    request:request
}