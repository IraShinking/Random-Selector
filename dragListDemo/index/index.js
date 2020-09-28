const app = getApp()

Page({
  data: {

    list: [{
      listName: '列表1',
      item: [{ itemName: '1-子项1' }, { itemName: '1-子项2' }, { itemName: '1-子项3' }],
      transY: 0
    },
    {
      listName: '列表2',
      item: [{ itemName: '2-子项1' }, { itemName: '2-子项2' }, { itemName: '2-子项3' }],
      transY: 0
    }, {
      listName: '列表3',
      item: [{ itemName: '3-子项1' }, { itemName: '3-子项2' }, { itemName: '3-子项3' }],
      transY: 0
    }
    ],
    moveaable: false,

    startY: 0,
    endY: 0,
    startIndex: 0,
    endIndex: 0,
    listHeight: 90
  },

  /**
   * 根据排序后 list 数据进行位移计算
   */
  getPosition(data, vibrate = true) {
    let list = data.map((item, index) => {
      item.tranY = item.key * this.item.height;
      return item
    });
    this.setData({ list: list });

    if (!vibrate) return;

    this.setData({ itemTransition: true });

    let listData = [];

    list.forEach((item) => { listData[item.key] = item.data });
    this.triggerEvent('change', { listData: listData });
  },
  listLongPress: function (e)//设置移动状态、开始的索引、开始的Y坐标
  {//用longpress取代touchstart
    this.setData({
      startIndex: e.currentTarget.dataset.parentindex,
      startY: e.changedTouches[0].pageY,
      moveaable: true
    });//用逗号隔开就可以一次设定多个数据了
    console.log('longPress is on');
    // 计算Y轴初始位移, 使 item 垂直中心移动到点击处this.tranY = this.startY - this.item.height / 2 - this.itemWrap.top; 不知道有什么用
  },
  listTouchMove: function (e)//这个才是重头戏：要动态判断有没有超出边界
  {
    let startY = this.data.startY;
    let nowY = e.changedTouches[0].pageY;
    let moveable = this.data.moveaable;
    let Index = e.currentTarget.dataset.parentindex;
    let len = this.data.list.length;
    let transY = 0;
/*
    if (!this.data.touch) return;//检测移动状态
    tranY = e.touches[0].pageY - this.startY + this.tranY;//设置tranY
    let overOnePage = this.data.overOnePage;//这个有用吗？获取所有元素的长度是不是超过一个屏幕

    // 判断是否超过一屏幕, 超过则需要判断当前位置动态滚动page的位置
    if (overOnePage) {//要看看clientY是正还是负
      if (e.touches[0].clientY > this.windowHeight - this.item.height) {
        wx.pageScrollTo({
          scrollTop: e.touches[0].pageY + this.item.height - this.windowHeight,
          duration: 300
        });
      } else if (e.touches[0].clientY < this.item.height) {
        wx.pageScrollTo({
          scrollTop: e.touches[0].pageY - this.item.height,
          duration: 300
        });
      }
    }
    this.setData({ tranY: tranY });
    //用key来控制
    let originKey = e.currentTarget.dataset.key;
    let endKey = this.calculateMoving(tranY);
    // 防止拖拽过程中发生乱序问题
    if (originKey == endKey || this.originKey == originKey) return;
    this.originKey = originKey;
    this.insert(originKey, endKey);
 */
  },
  listTouchEnd: function (e) {

    this.setData({ endY: e.changedTouches[0].pageY });//即使页面会因为scrollTop滑动，这里用的还是pageY，因为滑动相关的逻辑已经在scroll里面实现了。
    this.setData({ moveaable: false });
    let list = this.data.list;
    let Index = e.currentTarget.dataset.parentindex;
    let endIndex = this.data.endIndex;
    var temList = this.data.list[Index];

    //list.splice(endIndex,0,temList);
    //list.splice(Index,1,0);



  },
  calculatingIndex(transY) {
    let row = this.data.list.length - 1;
    let i = Math.round(transY / this.data.listHeight);
    i = i > 0 ? i : 0;
    i = i < row ? i : row;
    this.setData({ endIndex: i });
    return endIndex;
  },
  onLoad: function () {

  },
})
