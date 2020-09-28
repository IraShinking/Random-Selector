var app = getApp()

Page({

  data:
  {
    touchStartTime: 0,
    touchEndTime: 0,
    lastTapTime: 0,
    lastTapTimeoutFunc: null,//这四个变量是为了双击事件服务的
    list: '',
    slideButtons: [
      { data: 'inbox', src: '/images/inbox2.png' }, {
        data: 'delete', src: '/images/dustbin3.png'// icon的路径//绝对路径不行，’../../images/name.png'不行，‘/miniprogram/images/name.png'不行。直接抄人家的’/image/name.png' 行了
      }
    ],

  },
  onLoad: function (options) {
    var that = this;
    if (app.globalData.list == '') {
      app.setData().then(res => {
        console.log('promise回调后的数据-index：', res);
        let list = res;
        console.log('list', list);
        that.setData({ list: list });
        console.log('that.data.list', that.data.list);
        let pageList = that.data.list;
        let i = 0, j = 0;
        for (i = 0; i < pageList.length; i++) {
          pageList[i].listNameEdit = false;
          pageList[i].lastInboxIndex = null;
          for (j = 0; j < pageList[i].item.length; j++) {
            pageList[i].item[j].itemNameEdit = false;
          }
        }
        that.setData({ list: pageList });
        console.log('add page list as List,', that.data.list);

      })
    }
    else {
      let list = app.globalData.list;
      that.setData({ list: list });
      console.log('app.globalData.list', that.data.list);
    }


    this.getwxmlcode("#movebox", (resp) => {
      this.setData({ movebox: resp })//获取外层箱子的信息并记录
      console.log('movebox', this.data.movebox);
      setTimeout(() => {
        this.getwxmlcode("#movelist0", (res) => {
          this.setData({ movelist0: res })//获取内层列表的信息并记录
          console.log('moveList0', this.data.movelist0);
          var jiange = res.top - resp.top;//由于这里是0
          console.log('jiange', jiange);
          var yiban = res.bottom - res.top + jiange;//这里就等于盒子高度

          this.setData({
            itemheight: res.bottom - res.top,
            jiange: yiban, //两条中间到另一条的距离//jg现在等于盒子高度
            jianqu: resp.top - (res.bottom - res.top) / 2, //位置要减去距离//箱子顶部减去半个盒子高度
          })
          console.log('jiangee', jiange, 'yiban', yiban, 'resp.top', resp.top, 'jianqu', this.data.jianqu);
        })
      }, 300)
    })

  },

  dragList(e) {
    console.log('dragging list', e);
    /**关上所有展开的列表 */
    let list = this.data.list;
    let i = 0;
    for (i = 0; i < list.length; i++) {
      list[i].show = false;
    }
    this.setData({ list, dragable: true,  nowmoveindex: e.currentTarget.dataset.parentindex, });

  },
  getwxmlcode(str, cal) {//str是用来当索引的 找到的信息储存在cal里面返回
    const query1 = wx.createSelectorQuery()
    query1.select(str).boundingClientRect()//选择节点 返回位置信息
    query1.selectViewport().scrollOffset()//选择显示区域和查询请求
    query1.exec((res) => {
      if (cal) cal(res[0])//cal=callback 在执行请求 但我看不懂
    })
  },
  listItemMove(e) {
    
    if (this.data.dragable == true) {
      //console.log('listmove', e);
      if (e.type == "touchmove") {//如果是移动事件
        this._getWindowHeight();
        this._pageScroll(e.changedTouches[0].clientY)
        var movetop = e.touches[0].pageY - this.data.itemheight;//标签的y坐标减去盒子高度
        var moveoutindex = parseInt((movetop - this.data.jianqu) / this.data.jiange);//画图才知道干嘛
        //console.log('movetop', movetop, 'moveoutindex', moveoutindex);
        if (e.currentTarget.dataset.parentindex <= moveoutindex) moveoutindex++;
        this.moveoutindex = moveoutindex;
        console.log('moveoutIndex', moveoutindex);
        this.setData({movetop, moveoutindex });
        console.log('nowmoveIndex', e.currentTarget.dataset.parentindex);
      } else {//如果不是移动事件（touchend）//其实大家使用的是同一个e，就算分开写也是一样的，这里是代码简化
        let index = e.currentTarget.dataset.parentindex, list = this.data.list;
        let data = { ...list[index] };//取出这个元素存着
        console.log('list[index]', data);
        list.splice(index, 1);
        if (index <= this.moveoutindex - 1) this.moveoutindex--;
        list.splice(this.moveoutindex, 0, data);
        this.setData({ list: list, moveoutindex: -1, nowmoveindex: -1, dragable: false });
      }
    }
  },
  addList(e) {//添加列表 使用unshift是在顶端添加列表 使用push是在底部添加列表
    let list = this.data.list;
    list.unshift({ listName: '点击展开，左滑归档或删除', listNameEdit: false, item: [{ itemName: '子项左滑归档或删除', itemNameEdit: false }, { itemName: '双击文字可以修改', itemNameEdit: false }, { itemName: '长按列表名拖拽排序', itemNameEdit: false }] });//坑 是操作json数组不是操作array数组 不用字符串拼贴
    this.setData({ list });
    console.log('addList', this.data.list);
  },
  editListName(e) {//双击显示列表名修改框
    var that = this
    // 控制点击事件在350ms内触发，加这层判断是为了防止长按时会触发点击事件
    if (that.data.touchEndTime - that.data.touchStartTime < 350) {
      // 当前点击的时间
      var currentTime = e.timeStamp
      var lastTapTime = that.data.lastTapTime
      // 更新最后一次点击时间
      that.data.lastTapTime = currentTime
      // 如果两次点击时间在300毫秒内，则认为是双击事件
      if (currentTime - lastTapTime < 300) {
        console.log("double click");
        let Index = e.currentTarget.dataset.parentindex;
        let list = this.data.list;//坑 要加上let 不然显示未定义
        //list[Index].listNameEdit = !list[Index].listNameEdit || false//将真假值设定相反 
        //我的需求只是为真的时候变框 所以设置为真就好 因为修改之后会设置回假
        var listEdit = "list[" + Index + "].listNameEdit";
        this.setData({ [listEdit]: true });
      }
    }
  },
  editName(e)//修改列表名 焦点离开后<input>变回<text>
  {
    var editSuccess = false;
    var that = this;
    let Index = e.currentTarget.dataset.parentindex;
    var listNmeEdit = "list.[" + Index + "].listNameEdit";
    var listNme = "list.[" + Index + "].listName";
    //this.setData({"list.[Index].itemName":e.detail.value});//坑，不组合出一个字符串会在index处报错 而且我要改的是listName 写成了itemName 囧
    console.log('editname', e);
    if (e.detail.value.length <= 0) {
      wx.showModal
        ({
          cancelColor: '#00809e',
          confirmColor: '#F57F85',
          content: '内容不能为空！',
          confirmText: '继续修改',
          cancelText: '取消',
          success: function (res) {
            if (res.confirm) {
              that.setData({ [listNmeEdit]: true });
            }
            else if (res.cancel) {
              editSuccess = false;
            }
          }
        })
    }
    else {
      editSuccess = true;
    }

    if (editSuccess) {
      this.setData({ [listNme]: e.detail.value });//先修改再变化
    }

    this.setData({ [listNmeEdit]: false });//下一次调取修改成文本框又会变成真

    console.log('success to edit list name');
  },
  openTap(e) {//点击按钮展开子项目
    console.log('open', e);
    let Index = e.currentTarget.dataset.parentindex,//获取点击的下标值
      list = this.data.list;
    list[Index].show = !list[Index].show || false;//变换其打开、关闭的状态
    if (list[Index].show) {//如果点击后是展开状态，则让其他已经展开的列表变为收起状态
      this.packUp(list, Index);
    }
    this.setData({ list });
  },
  packUp(data, index) { //让所有的展开项，都变为收起
    for (let i = 0, len = data.length; i < len; i++) {//其他最外层列表变为关闭状态
      if (index != i) {
        data[i].show = false;
      }
    }
  },
  addTap(e) {//添加列表项
    console.log('add', e);
    let Index = e.currentTarget.dataset.parentindex;
    let list = this.data.list;
    list[Index].item.unshift({ itemName: '新的子项目1', itemNameEdit: false });
    var updateList = "list[" + Index + "].item"
    this.setData({ [updateList]: list[Index].item });//不用更新整个list
  },
  buttonTap(e) {//slideview 按钮列表
    var that = this;
    let Index = e.currentTarget.dataset.parentindex;
    let list = that.data.list;
    let len = list[Index].item.length
    let listItem = list[Index];
    if (e.detail.data == "delete") {//删除列表
      wx.showModal({
        cancelColor: '#F57F85',
        confirmColor: '#00809e',
        content: '确认删除该列表吗？',
        confirmText: '取消',
        cancelText: '确定',
        success: function (res) {
          if (res.confirm) {
          }
          else if (res.cancel) {
            list.splice(Index, 1);
            console.log('delete List', Index);
            console.log(list);
            that.setData({ list }); //坑 this的作用域 this指代的对象在showModal这个闭包函数中会发生改变 所以要用一个临时变量that
            wx.showToast({
              title: '已删除',
              icon: 'success',
            })
          }
        }
      })
    }
    else if (e.detail.data == "inbox") {//归档和取消归档
      console.log('inbox', list[Index]);
      if (list[Index].inbox == false)//归档 是布尔值不是文本值
      {
        wx.showModal({
          cancelColor: '#F57F85',
          confirmColor: '#00809e',
          content: '确认归档该列表吗？',
          confirmText: '取消',
          cancelText: '确定',
          success: function (res) {
            if (res.confirm) {
            }
            else if (res.cancel) {
              list[Index].inbox = true;
              list[Index].chose=false;
              list[Index].lastInboxIndex = Index;
              for (let i = 0; i < len; i++) {
                list[Index].item[i].inbox = !list[Index].item[i].inbox;
              }

              list.push(listItem);
              list.splice(Index, 1);
              that.setData({ list }); //坑 this的作用域 this指代的对象在showModal这个闭包函数中会发生改变 所以要用一个临时变量that
              wx.showToast({
                title: '已归档',
                icon: 'success',
              })
            }
          }
        })
      }
      else if (list[Index].inbox == true)//取消归档
      {
        var lastIndex = list[Index].lastInboxIndex;
        list[Index].inbox = false;
        for (let i = 0; i < len; i++) {
          list[Index].item[i].inbox = !list[Index].item[i].inbox;
        }
        console.log("lastIndex", lastIndex);
        console.log("listItem", listItem);
        if (lastIndex != null)//是非null为真，如果省略了就是非零为真
        {
          list.splice(Index, 1);
          list.splice(lastIndex, 0, listItem);
        }
        that.setData({ list });
        wx.showToast({
          title: '已取消归档',
          icon: 'success',
        })
      }
    }
  },
  buttonItemTap(e)//子项目slideview按钮
  {
    var that = this;
    let Index1 = e.currentTarget.dataset.parentindex;
    let Index2 = e.currentTarget.dataset.index;
    let list = that.data.list;
    var updateitem = "list[" + Index1 + "].item"
    var inboxItem = "list[" + Index1 + "].item[" + Index2 + "].inbox"
    if (e.detail.data == "delete") {
      console.log('delete button is pressed');
      wx.showModal({
        content: '确认删除该子项目吗？',
        cancelColor: '#F57F85',
        confirmColor: '#00809e',
        confirmText: '取消',
        cancelText: '确定',
        success: function (res) {
          if (res.confirm) {
            console.log('主操作')
          }
          else if (res.cancel) {
            console.log('次要操作'),
              list[Index1].item.splice(Index2, 1);
            console.log(list[Index1].item);

            that.setData({ [updateitem]: list[Index1].item }); //坑 this的作用域 this指代的对象在showModal这个闭包函数中会发生改变 所以要用一个临时变量that
            wx.showToast({
              title: '已删除',
              icon: 'success',
            })
          }
        }
      })
    }
    else if (e.detail.data == "inbox") {
      if (e.detail.data == "inbox") {
        if (list[Index1].inbox == false)//列表不为归档状态时才能修改
        {
          if (list[Index1].item[Index2].inbox == false) {
            list[Index1].item[Index2].inbox = true;
          }
          else {
            list[Index1].item[Index2].inbox = false;
          }
          this.setData({ [inboxItem]: list[Index1].item[Index2].inbox });
          wx.showToast({
            title: '修改归档状态成功',
            icon: 'success'
          })
        }
        else {
          wx.showToast({
            title: '请先将列表取消归档',
            icon: 'none'
          })
        }
      }
    }



  },
  editItemName(e) {
    var that = this
    // 控制点击事件在350ms内触发，加这层判断是为了防止长按时会触发点击事件
    if (that.data.touchEndTime - that.data.touchStartTime < 350) {
      // 当前点击的时间
      var currentTime = e.timeStamp
      var lastTapTime = that.data.lastTapTime
      // 更新最后一次点击时间
      that.data.lastTapTime = currentTime
      // 如果两次点击时间在300毫秒内，则认为是双击事件
      if (currentTime - lastTapTime < 300) {
        // 执行双击事件
        //clearTimeout(that.data.lastTapTimeoutFunc);
        console.log("double click");
        let Index1 = e.currentTarget.dataset.parentindex;
        let Index2 = e.currentTarget.dataset.index
        let ItemEdit = "list[" + Index1 + "].item[" + Index2 + "].itemNameEdit"
        this.setData({ [ItemEdit]: true });
      }
    }
  },
  editItem(e) {
    let Index1 = e.currentTarget.dataset.parentindex;
    let Index2 = e.currentTarget.dataset.index
    let ItemEdit = "list[" + Index1 + "].item[" + Index2 + "].itemNameEdit"
    let ItemValue = "list[" + Index1 + "].item[" + Index2 + "].itemName"
    var that = this;
    var editSuccess = false;
    if (e.detail.value.length <= 0) {
      wx.showModal({
        cancelColor: '#00809e',
        confirmColor: '#F57F85',
        confirmColor: '#F57F85',
        content: '内容不能为空！',
        confirmText: '继续修改',
        cancelText: '取消',
        success: function (res) {
          if (res.confirm) {

            that.setData({ [ItemEdit]: true });
          }
          else if (res.cancel) {
            editSuccess = false;
          }
        }
      })

    } else {
      editSuccess = true;
    }
    if (editSuccess) {
      this.setData({ [ItemValue]: e.detail.value });
    }
    this.setData({ [ItemEdit]: false });
  },

  onShow: function () {
    this._getWindowHeight();
    if (wx.$goToList == true) {
      console.log('Do go to list');
      this.addList();
      wx.$goToList = false;
    }
    console.log('list in page list', this.data.list);
   
  },

  /** 获取可使用窗口高度，单位px */
  _getWindowHeight() {
    try {
      const { windowHeight } = wx.getSystemInfoSync();
      this.setData({
        _windowHeight: windowHeight-100
      });
    } catch (err) {
      console.error('[_getWindowHeight]', err);
    }
  },

  _pageScroll(clientY) {
    if (clientY + this.data.itemheight >= this.data._windowHeight) {
      // 下滑接近屏幕底部
      wx.pageScrollTo({
        scrollTop: clientY + this.data.itemheight,
      });
    } else if (clientY - this.data.itemheight <= 0) {
      // 上滑接近屏幕顶部
      wx.pageScrollTo({
        scrollTop: clientY - this.data.itemheight,
      })
    }
  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('page list is hiding', this.data.list);
    app.globalData.list = this.data.list;
    console.log('after page list hide,the global data', app.globalData.list);
    var updateList=app.globalData.list;
    wx.cloud.callFunction({
      name:'update',
      data:
      {
        list:updateList,
      },
      success:function(res)
      {
        console.log('finish call CloudFunction update',res);
      }
    
    })

    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
