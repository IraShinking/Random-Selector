// pages/guidence/guidence.js
Page({

  gottcha:function()
  {
    wx.showModal({
          cancelColor: '#00809e',
          confirmColor: '#F57F85',
          content: '点击“i”图标，\r\n随时回来',
          confirmText: '去主页',
          cancelText: '我再看看',
          success: function (res) {
            if (res.confirm) {
              wx.switchTab({
                url: '/pages/index/index',
              })
            }
          },
          fail:function(res)
          {
            console.log("fail to call the modal,res:",res);
          }
        })
  },

 
})