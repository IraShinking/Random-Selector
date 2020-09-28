// pages/dome/dome.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    //#region 纯数据字段
    /** 屏幕高度，单位px */
    _windowHeight: null,
    /** 开始触摸时的单一项左上角y坐标 */
    _startOffsetY: null,
    /** 开始触摸位置y坐标 */
    _startPageY: null,
    /** 开始触摸项索引 */
    _startDragElementIndex: null,

    /** 滑动偏移 */
    _scrollThreshold: 0.5,

    /** 距顶部/左边多远时，触发 _scrollToUpper 事件，单位px，即上滑至屏幕顶部 */
    _upperThreshold: 100,
    /** 距底部/右边多远时，触发 _scrollToLower 事件，单位px，即下滑至屏幕底部 */
    _lowerThreshold: 100,
    /** 上滑和下滑时间，单位毫秒 */
    _scrollDuration: 1000,
    //#endregion

    touchStartTime: 0,
    touchEndTime: 0,
    lastTapTime: 0,
    lastTapTimeoutFunc: null,//这四个变量是为了双击事件服务的
    list: [
      {
        listName: '列表1',
        listNameEdit: false,//控制列表名的修改
        item: [{
          itemName: '子列表1-1',
          itemNameEdit: false,//控制子项的修改
        }, {
          itemName: '子列表1-2',
          itemNameEdit: false,
        }, {
          itemName: '子列表1-3',
          itemNameEdit: false,
        }]
      },
      {
        listName: '列表2',
        listNameEdit: false,
        item: [{
          itemName: '子列表2-1',
          itemNameEdit: false,
        }, {
          itemName: '子列表2-2',
          itemNameEdit: false,
        }, {
          itemName: '子列表2-3',
          itemNameEdit: false,
        }]
      }, {
        listName: '列表3',
        listNameEdit: false,
        item: [{
          itemName: '子列表3-1',
          itemNameEdit: false,
        }, {
          itemName: '子列表3-2',
          itemNameEdit: false,
        }, {
          itemName: '子列表1-3',
          itemNameEdit: false,
        }]
      },
      {
        listName: '列表4',
        listNameEdit: false,
        item: [{
          itemName: '子列表4-1',
          itemNameEdit: false,
        }, {
          itemName: '子列表4-2',
          itemNameEdit: false,
        }, {
          itemName: '子列表4-3',
          itemNameEdit: false,
        }]
      },
      {
        listName: '列表5',
        listNameEdit: false,
        item: [{
          itemName: '子列表5-1',
          itemNameEdit: false,
        }, {
          itemName: '子列表5-2',
          itemNameEdit: false,
        }, {
          itemName: '子列表5-3',
          itemNameEdit: false,
        }]
      }
    ],
    slideButtons: [
      { data: 'inbox', src: '/images/inbox2.png' }, {
        data: 'delete',
        src: '/images/dustbin3.png'// icon的路径//绝对路径不行，’../../images/name.png'不行，‘/miniprogram/images/name.png'不行。直接抄人家的’/image/name.png' 行了
      }
    ],
    /** 单一项高度 */
    elementHeight: 90,
    dragable:false,
    /** 滑动项 */
    dragElement: null,
    /** movable-view组件y轴坐标，滑动时滑动项左上角距离文档顶部纵坐标，单位px */
    transY: null,
    /** 滑动过程中经过的项 */
    lastTarget: null,
  },
  addList(e) {//添加列表 使用unshift是在顶端添加列表 使用push是在底部添加列表
    let list = this.data.list;
    list.unshift({ listName: '新列表', listNameEdit: false, item: [{ itemName: '子项目1', itemNameEdit: false }, { itemName: '子项目2', itemNameEdit: false }, { itemName: '子项目3', itemNameEdit: false }] });//坑 是操作json数组不是操作array数组 不用字符串拼贴
    this.setData({ list });
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

    this.setData({list});
    //var listShw = "list[" + Index + "].show"//拼贴字符串以便使用灵活的路径
    //this.setData({ [listShw]: list[Index].show });//如果没有这一行，是不能展开的，因为show状态的更改要在全局中产生改变 但不要传入整个list，数值可以含有变量，而路径不行。
    //不能单纯拼贴 要考虑到packUp回调中对其他的list[i].show作出了变化 如果setdata对整个list操作，可以改变全部。但现在只改变了一个 ，所以要用循环动态改变
   /**let i = 0;

    for (let len = list.length; i < len; i++) {
      var listShw = "list[" + i + "].show"//要重新定义每一个变量 每一次都setData
      // console.log('list',i,'show',list[i].show);
      this.setData({ [listShw]: list[i].show }); 
    }
    //优化时考虑用户体验：是这样快还是set整个list快？界面会不会跳动？*/ 
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
    //使用传入的data值判断是不是删除按钮
    if (e.detail.data == "delete") {
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
    else if (e.detail.data == "inbox") {
      console.log('inbox button is pressed');
    }



  },

  buttonItemTap(e)//子项目slideview按钮
  {
    var that = this;
    let Index1 = e.currentTarget.dataset.parentindex;
    let Index2 = e.currentTarget.dataset.index;
    let list = that.data.list;
    var updateitem = "list[" + Index1 + "].item"
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
      console.log('inbox button is pressed');
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
    this._getWindowHeight();
  },
  dragList(e) {
    console.log('dragging list',e);
    /**关上所有展开的列表 */
    let list=this.data.list;
    let i=0;
    for(i=0;i<list.length;i++)
    {
      list[i].show=false;
    }
    this.setData({list});

    let dragElementIndex =e.currentTarget.dataset.parentindex;//正在拖拽的序号
    let dragElement = this.data.list[dragElementIndex];//提取拖动的元素
    
    this.setData({
      /** 点击项左上角y坐标 */
      _startOffsetY:e.target.offsetTop,
      /** 点击位置y坐标 */
      _startPageY: e.touches[0].pageY,
      /** 点击项索引 */
      _startDragElementIndex: dragElementIndex,
      /** 点击项 */
      dragElement,
      dragable:true,
      /** movable-view组件左上角y坐标 */
      transY: e.target.offsetTop
    });
    console.log('[onLongPress]', this.data.dragElement);
  },
  /**
   * 手指触摸后移动
   * - 触底或触顶时下滑或者上滑
   */
  onTouchMove(event) {

    // 长按事件
    if (this.data.dragable) {
      //console.log('dragable',event);
      let clientY = event.touches[0].clientY;  // 触摸点位置在显示屏幕区域左上角Y坐标
      this._pageScroll(clientY);

      /** 触摸点位置距离文档左上角Y坐标 */
      let pageY = event.touches[0].pageY;
      /** 和最初点击位置比较移动距离 */
      let targetMoveDistance = pageY - this.data._startPageY;
      /** 移动后的movable-view组件位置 */
      let transY = this.data._startOffsetY + targetMoveDistance;
      /** 经过项索引 */
      let targetIndex = this._computeFutureIndex(targetMoveDistance, this.data._startDragElementIndex);

      this.setData({
        transY,
        lastTarget: targetIndex
      });
    }
    else{
      console.log('not dragable');
    }
  },
  lastIndex(e)
  {
    let lastIndex=this.data.lastTarget;
    console.log('lastIndex',lastIndex);
    console.log('[onTouchEnd]', e);

    if (this.data.dragable) {
    //不用深复制  let list = this._deepCopy(this.data.list);
      /** 结束点位置y坐标 */
      let pageY = e.changedTouches[0].pageY;
      /** 和初始点击位置比较移动距离 */
      let targetMoveDistance = pageY - this.data._startPageY;
      /** 初始点击项索引 */
      let dragElementIndex = this.data._startDragElementIndex;

      /** 目标项索引 */
      const futureIndex = this._computeFutureIndex(targetMoveDistance, dragElementIndex);
      if (futureIndex !== false) {
        list.splice(futureIndex, 0, list.splice(dragElementIndex, 1)[0]);  // 移动位置
      }

      this.setData({
        list,
        dragElement: null,
        lastTarget: null,
        dragable:false
      });
    }
  },
  /** 阻止滑动 */
  onHackTouchMove() { },
  /** 获取可使用窗口高度，单位px */
  _getWindowHeight() {
    try {
      const { windowHeight } = wx.getSystemInfoSync();
      this.setData({
        _windowHeight: windowHeight
      });
    } catch (err) {
      console.error('[_getWindowHeight]', err);
    }
  },
  /** 页面滑动 */
  _pageScroll(clientY) {
    if (clientY + this.data._upperThreshold >= this.data._windowHeight) {
      // 下滑接近屏幕底部
      wx.pageScrollTo({
        scrollTop: clientY + this.data.elementHeight,
        duration: this.data._scrollDuration
      });
    } else if (clientY - this.data._lowerThreshold <= 0) {
      // 上滑接近屏幕顶部
      wx.pageScrollTo({
        scrollTop: clientY - this.data.elementHeight,
        duration: this.data._scrollDuration
      })
    }
  },
  /**
   * 计算目标索引
   * @param {number} targetMoveDistance 移动距离
   * @param {number} dtagElementIndex 初始移动项索引
   * 若轻轻拂动则返回false
   */
  _computeFutureIndex(targetMoveDistance, dragElementIndex) {
    let willInsertAfter = this._getSwapDirection(targetMoveDistance);
    if (willInsertAfter !== false) {
      /** 偏移索引 */
      let offsetElementIndex = dragElementIndex + willInsertAfter;
      /** 移动步数 */
      let step = targetMoveDistance / this.data.elementHeight;
      /** 步数补偿，当只有移动距离超过单项 _scrollThreshold 时才算有效 */
      if (step <= -1) {
        step += this.data._scrollThreshold;
      } else if (step >= 1) {
        step -= this.data._scrollThreshold;
      }
      /** 目标索引 */
      let futureIndex = parseInt(step) + offsetElementIndex;

      // 避免越界
      if (futureIndex < 0) {
        futureIndex = 0;
      } else if (futureIndex > this.data.list.length - 1) {
        futureIndex = this.data.list.length - 1;
      }

      return futureIndex;
    } else {
      return willInsertAfter;
    }
  },
  /**
   * 获取滑动方向
   * @param {number} targetMoveDistance 移动距离
   * @returns {number/boolean}
   *  - 1 下滑
   *  - -1 上滑
   *  - false 拂动，滑动距离小于一半单项高度
   */
  _getSwapDirection(targetMoveDistance) {
    if (Math.abs(targetMoveDistance) < this.data.elementHeight / 2) {
      // 轻轻拂动，滑动距离小于1/2单项高度
      return false;
    } else if (targetMoveDistance >= this.data.elementHeight / 2) {
      console.log('[_getSwapDirection] 👇👇👇');
      return 1;  // 下滑
    } else if (targetMoveDistance <= this.data.elementHeight / -2) {
      console.log('[_getSwapDirection] 👆👆👆');
      return -1;  // 上滑
    }
  },
  /** 深拷贝 */
  _deepCopy(obj) {
    // 只拷贝对象
    if (typeof obj !== 'object') return;
    // 根据obj的类型判断是新建一个数组还是一个对象
    var newObj = obj instanceof Array ? [] : {};
    for (var key in obj) {
      // 遍历obj,并且判断是obj的属性才拷贝
      if (obj.hasOwnProperty(key)) {
        // 判断属性值的类型，如果是对象递归调用深拷贝
        newObj[key] = typeof obj[key] === 'object' ? this._deepCopy(obj[key]) : obj[key];
      }
    }
    return newObj;
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

