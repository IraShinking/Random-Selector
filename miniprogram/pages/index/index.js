//index.js
import store from '../../store'
import create from '../../utils/create'

//create(store{})替代原来页面的page({})
create(store, {
  data: {
    list: '',
  },
  onLoad: async function () {//获取初始列表数据
    this.openid = await getApp().getOpenid();
    var openid = this.openid;
    var that=this;
    wx.getStorage({
      key: 'storedList',
      success:function(res)
      {
        console.log('异步获取缓存成功',res);
        that.update({list:res.data});
      },
      fail:function(res)
      {
        console.log('异步获取缓存失败',res);
      }
    })
    console.time('pullData');
    this.store.pull('selector', { _openid: openid,}).then(res => {
      console.log('get database in index', res.data.length);
      if (res.data.length != 0) {
        this.store.data.list = res.data[0].list;
      }
      else {
        wx.navigateTo({
          url: '/pages/guidence/guidence',
        });
        var listData = {
          list: [
            {
              listName: '兔兔的奶茶选单',
              inbox: false,
              item: [{
                itemName: '一点点-波霸奶绿',
                inbox: false,
              }, {
                itemName: '一点点-冰激凌阿华田',
                inbox: false,
              }, {
                itemName: '一点点-四季春加波霸',
                inbox: false,
              },
              {
                itemName: 'COCO-百香果',
                inbox: false,
              },
              {
                itemName: 'COCO-奶茶三兄弟',
                inbox: false,
              },
              {
                itemName: '喜茶-芒芒甘露',
                inbox: false,
              },
              {
                itemName: '喜茶-烤黑糖波波牛乳',
                inbox: false,
              },
              {
                itemName: '喜茶-芋泥波波牛乳',
                inbox: false,
              }
              ],
            },
            {
              listName: '吃什么蔬菜好呢',
              inbox: false,
              item: [{
                itemName: '胡萝卜',
                inbox: false,
              }, {
                itemName: '西兰花',
                inbox: false,
              },
              {
                itemName: '椰菜',
                inbox: false,
              }, {
                itemName: '小白菜',
                inbox: false,
              },
              {
                itemName: '青瓜',
                inbox: false,
              }, {
                itemName: '番茄',
                inbox: false,
              },
              {
                itemName: '青椒',
                inbox: false,
              }
              ]
            }, {
              listName: '长按拖拽排序',
              inbox: false,
              item: [{
                itemName: '双击文字修改',
                inbox: false,
              }, {
                itemName: '左滑归档或删除',
                inbox: false,
              }, {
                itemName: '删除不可撤销',
                inbox: false,
              }]
            },
            {
              listName: '归档项默认不参与抽取',
              inbox: false,
              item: [{
                itemName: '没有子项目的列表也不参与抽取',
                inbox: false,
              }, {
                itemName: '有使用问题可以留言',
                inbox: false,
              }, {
                itemName: '归档操作可以撤销',
                inbox: false,
              }]
            }
          ]
        }
        this.store.data.list = listData.list;//如果用listData set出来是空的，应该是listData.list
        this.store.add('selector', listData).then(res => {
          console.log('success to add new data', res);
        });
      }
      this.update();
      console.timeEnd('pullData');
      this.reset();
    })

  },
  goToList() {//跳转并添加列表
    wx.$goToList = true;
    wx.switchTab({ url: '/pages/list/list', });
  },
  goToHelp()//跳转到帮助页
  {
    wx.navigateTo({url: '/pages/guidence/guidence',});
  },
  openTap(e) {//点击按钮展开子项目

    let Index = e.currentTarget.dataset.parentindex,
      list = this.store.data.list;
    list[Index].show = !list[Index].show || false;
    if (list[Index].show) {//如果点击后是展开状态，则让其他已经展开的列表变为收起状态
      this.packUp(list, Index);
    }
    this.update().then(diff => {
      console.log('更新打开状态', diff);
    });
  },
  packUp(data, index) { //让所有的展开项，都变为收起
    for (let i = 0, len = data.length; i < len; i++) {//其他最外层列表变为关闭状态
      if (index != i) {
        data[i].show = false;
      }
    }
  },
  chooseList(e) {//选中列表
    let Index = e.currentTarget.dataset.parentindex;
    let list = this.store.data.list;
    if (list[Index].inbox == true) {
      wx.showModal({
        confirmColor: '#F57F85',
        title: '归档列表无法选中',
        content: '请前往列表页，\r\n左滑列表项目取消归档',
        confirmText: '我知道了',
        showCancel: false,
      })
    }
    else {
      if (list[Index].item.length == 0) {
        wx.showModal({
          confirmColor: '#F57F85',
          title: '空列表无法选中',
          content: '请前往列表页，\r\n展开列表添加子项目',
          confirmText: '我知道了',
        })
      }
      else {
        list[Index].chose = !list[Index].chose;
        this.update().then(diff => {
          /**有必要留着吗 */
          console.log('选中的更新结果，', diff, this.store.data.list);
        })
      }
    }
  },
  randomSelection() {//随机抽取
    let list = this.store.data.list;
    var chooseIndex = 0;
    var anyChosed = false;
    for (let i = 0; i < list.length; i++) {
      if (list[i].chose == true) {
        anyChosed = true;
        do {
          chooseIndex = Math.floor(Math.random() * list[i].item.length);
        } while (list[i].item[chooseIndex].inbox)//如果选中的子项目被归档，重抽
        list[i].chooseIndex = chooseIndex;
      }
    }
    if (anyChosed == false) {
      wx.showModal({
        confirmColor: '#F57F85',
        title: '没有选中的列表',
        content: '请先点击列表文字，\r\n选择想要抽取的列表',
        confirmText: '我知道了',
        showCancel: false,
      })
    }
    else{
      this.update();//减少update的调用次数，间接降低通讯消耗
    }
    
  },
  reset()//初始化和重设list数据
  {
    var list = this.store.data.list;
    for (let i = 0; i < list.length; i++) {
      list[i].chose = false;
      list[i].show = false;
      if (list[i].inbox == null || !list[i].inbox) {
        list[i].inbox = false;
      }
      list[i].chooseIndex = -1;
    }
    this.update();
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
