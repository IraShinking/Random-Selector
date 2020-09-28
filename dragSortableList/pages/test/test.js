Page({
  data: {},

  onLoad: function() {
    //重新设置isMain属性
    var dataList = getApp().globalData["dataList"];
    dataList[2].isMain = false;
    dataList[0].isMain = true;
    getApp().globalData["dataList"] = dataList;
  },

  back: function() {
    wx.navigateBack({
      delta: 1
    });
  }
})