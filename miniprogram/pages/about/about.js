// pages/about/about.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onShareAppMessage() {
    var shareObj = {
      title: "",
      path: '/pages/index/index',    // 默认当前页面，必须是以‘/'开头的完整路径
      success: function (res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
          wx.showToast({
            title: '分享成功',
            icon: 'success',
          })
        }
      },
      fail: function () {
        if (res.errMsg == 'shareAppMessage:fail cancel') {//用户取消
        } else if (res.errMsg == 'shareAppMessage:fail') {
          // 转发失败，其中 detail message 为详细失败信息
        }
      },
    }
    return shareObj;
  },
    
})