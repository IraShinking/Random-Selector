Page({
  data: {
    dataList: [],
    slideButtons: [{
      type: 'warn',
      text: '退出',
      extClass: "red-color",
    }]
  },

  onLoad: function() {
    //初始化数据，并存储到全局变量
    var dataList = [];
    for (var i = 0; i < 5; i++) {
      dataList.push({
        first: "这是第" + i + "项",
        second: "",
        isMain: false
      });
    }
    //随便设置一项数据，用于列表显示不一样的内容
    dataList[2].isMain = true;
    dataList[2].second = "这是第二行内容";
    console.log('---getApp()--',getApp())
    console.log('---this-',this)
    getApp().globalData["dataList"] = dataList;
  },

  onShow: function() {
    //如果isMain属性为true，会将其置为第一个显示
    var dataList = JSON.parse(JSON.stringify(getApp().globalData["dataList"]));
    var mainData;
    for (var i = 0; i < dataList.length; i++) {
      if (dataList[i].isMain) {
        mainData = dataList[i];
        dataList.splice(i, 1);
      }
    }
    dataList.unshift(mainData);

    this.setData({
      dataList: dataList
    });
  },
  routePage: function() {
    wx.navigateTo({
      url: '/pages/test/test',
    })
  }
})