// pages/dragDemo/dragDemo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
transX:0,
transY:0
  },

  bindtouchstart:function(e)
  {
    console.log('touchstart',e.changedTouches);
    this.data.startX=e.changedTouches[0].clientX;
    this.data.startY=e.changedTouches[0].clientY;//直接定义的 所以不是setdata 但如果已经存在这个值段了一定要setdata2
  },
  bindtouchmove:function(e)
  {
    console.log('touchmove',e);
    let startX=this.data.startX;
    let startY=this.data.startY;
    let nowX=e.changedTouches[0].clientX;
    let nowY=e.changedTouches[0].clientY;
    let transX=nowX-startX;
    let transY=nowY-startY;
    this.setData({
      transX:transX,
      transY:transY
    })
  },
bindtouchend:function(e)
{
  console.log('touchend',e);
},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})