var app = getApp()
import store from '../../store'
import create from '../../utils/create'

create(store, {

  data:
  {
    lastTapTime: 0,
    list: '',
    slideButtons: [
      { data: 'inbox', src: '/images/inbox2.png' }, {
        data: 'delete', src: '/images/dustbin3.png'
      }
    ],

  },
  /*拖动逻辑 */
  onLoad: function () {//记录MoveBox信息
    this.getwxmlcode("#movebox", (resp) => {
      setTimeout(() => {
        this.getwxmlcode("#movelist0", (res) => {
          var MoveBoxPadding = res.top - resp.top;//the distance from moveList0 to movebox
          var windowHeight = 0;
          try {
            const res = wx.getSystemInfoSync()
            windowHeight = res.windowHeight;
          } catch (e) {
            console.log('fail to get SystemInfo in page List', e);
          }
          this.update({
            itemheight: res.bottom - res.top,
            MoveBoxPadding: MoveBoxPadding,
            MoveBoxTop: resp.top,
            windowHeight: windowHeight - resp.top,//windowHeight-MoveBoxTop
            lastTapTime: 0,//双击事件的判断指标
          })
          console.log('itemheight', this.store.data.itemheight, 'MoveBoxTop', this.store.data.MoveBoxTop, 'WindowHeight-MoveBoxTop', this.store.data.windowHeight);
        })
      }, 300)
    })
  },
  getwxmlcode(str, cal) {//查询Movebox信息 str是用来当索引的 找到的信息储存在cal里面返回
    const query1 = wx.createSelectorQuery()
    query1.select(str).boundingClientRect()//选择节点 返回位置信息
    query1.selectViewport().scrollOffset()//选择显示区域和查询请求
    query1.exec((res) => {
      if (cal) cal(res[0])//cal=callback 
    })
  },
  pageScroll(clientY) {//页面滑动函数
    if (clientY + this.store.data.itemheight >= this.store.data.windowHeight) {//下滑触底 下滚一个itemHeight
      wx.pageScrollTo({ scrollTop: clientY + this.store.data.itemheight, });
    } else if (clientY - this.store.data.itemheight <= 0) {//上滑触顶 上移一个itemHeight
      wx.pageScrollTo({ scrollTop: clientY - this.store.data.itemheight, });
    }
  },
  dragList(e) {//长按开始拖动
    let list = this.store.data.list;
    for (let i = 0; i < list.length; i++) {
      list[i].show = false;//关上所有展开的列表
    }
    this.update({ list, dragable: true, nowmoveindex: e.currentTarget.dataset.parentindex, });
    this.setData({ nowmoveindex: e.currentTarget.dataset.parentindex, dragable: true, });//保存到page的data，以实现style中的样式切换
    console.log('nowmoveIndex', this.store.data.nowmoveindex);
  },
  listItemMove(e) {//拖拽中和拖拽结束
    if (this.store.data.dragable == true) {
      if (e.type == "touchmove") {//移动事件 实时计算moveoutIndex     
        this.pageScroll(e.changedTouches[0].clientY);
        var pagesY = e.touches[0].pageY;
        var moveoutindex = parseInt((pagesY - this.store.data.MoveBoxTop - this.store.data.MoveBoxPadding) / this.store.data.itemheight);
        console.log('moveoutindex after compute', moveoutindex);
        this.store.data.moveoutindex = moveoutindex;
        this.update({ moveoutindex });
        this.setData({ moveoutindex: moveoutindex, });//在style中动态改变样式

      } else if (e.type == "touchend") {//结束时取出moveoutIndex操作数组
        let index = this.store.data.nowmoveindex, list = this.store.data.list;
        let data = { ...list[index] };//取出这个元素存着
        //console.log('list[index]', data);
        list.splice(index, 1);
        list.splice(this.store.data.moveoutindex, 0, data);
        this.update({ list: list, moveoutindex: -1, nowmoveindex: -1, dragable: false });
        this.setData({ nowmoveindex: -1, moveoutindex: -1, dragable: false, });//在style中动态改变样式
      }
    }
  },

  /*添加操作*/
  addList() {//添加列表 unshift在顶端添加，push在底部添加
    let list = this.store.data.list;
    list.unshift({ listName: '点小箭头展开，左滑出现菜单', listNameEdit: false, inbox: false, chose: false, show: false, item: [{ itemName: '子项也可以左滑', itemNameEdit: false, inbox: false }, { itemName: '双击文字可以修改', itemNameEdit: false, inbox: false }, { itemName: '长按列表名拖拽排序', itemNameEdit: false, inbox: false }] });
    this.update();
    wx.showToast({
      title: '添加列表成功',
      icon: 'success',
      duration: 2000,
    })
  },
  addTap(e) {//添加列表项
    let Index = e.currentTarget.dataset.parentindex;
    let list = this.store.data.list;
    list[Index].item.unshift({ itemName: '双击文字改名', itemNameEdit: false, inbox: false });
    this.update();
  },

  /*页面跳转与操作*/
  goToHelp()//跳转到帮助页
  {
    wx.navigateTo({url: '/pages/guidence/guidence',});
  },
  onShow: function () {//判断是否由index的addList跳转
    if (wx.$goToList == true) {
      this.addList();
      wx.$goToList = false;
    }
  },

  /*展开与收起*/
  openTap(e) {//点击展开子项
    let Index = e.currentTarget.dataset.parentindex;
    var list = this.store.data.list;
    list[Index].show = !list[Index].show;//变换打开、关闭的状态
    if (list[Index].show) {//如果点击后是展开状态，则让其他已经展开的列表变为收起状态
      this.packUp(list, Index);
    }
    this.update();
  },
  packUp(data, index) { //收起其他展开项
    for (let i = 0, len = data.length; i < len; i++) {//其他最外层列表变为关闭状态
      if (index != i) {
        data[i].show = false;
      }
    }
  },
  /**集成delete和inbox Button的操作 */
  slideViewButton(e) {
    var changeOnList = false, changeOnItem = false,
      Index1 = e.currentTarget.dataset.parentindex,
      Index2 = -1;
    var list = this.store.data.list;
    var that = this;
    /*判断是对列表还是子项目进行操作*/
    if (e.currentTarget.id == "listSlideview") {
      changeOnList = true;
    }
    else if (e.currentTarget.id == "itemSlideview") {
      changeOnItem = true;
      Index2 = e.currentTarget.dataset.index;
    }
    /*删除操作*/
    if (e.detail.data == "delete") {
      wx.showModal({
        cancelColor: '#F57F85',
        confirmColor: '#00809e',
        title: '确认删除吗？',
        confirmText: '取消',
        cancelText: '确定',
        success: function (res) {
          if (res.confirm) {
          }
          else if (res.cancel) {
            if (changeOnList) {
              list.splice(Index1, 1);
            }
            else if (changeOnItem) {
              list[Index1].item.splice(Index2, 1);
            }
            that.update();
            wx.showToast({
              title: '已删除',
              icon: 'success',
            })
          }
        }
      })
    }/*归档操作*/
    else if (e.detail.data == "inbox") {
      var listInbox = list[Index1].inbox,
        listItem = list[Index1];
      var doInbox = false, undoInbox = false;
      if (listInbox == false) {
        if (changeOnList) {
          wx.showModal({
            cancelColor: '#F57F85',
            confirmColor: '#00809e',
            content: '确认归档吗？',
            confirmText: '取消',
            cancelText: '确定',
            success: function (res) {
              if (res.confirm) {
              }
              else if (res.cancel) {//执行列表归档
                list[Index1].inbox = true;
                list[Index1].chose = false;
                list[Index1].lastInboxIndex = Index1;
                for (let i = 0; i < list[Index1].item.length; i++) {
                  if (list[Index1].item[i].inbox == null) {
                    list[Index1].item[i].inbox = true;//防止极小概率的undefined
                  }
                  else {
                    list[Index1].item[i].inbox = !list[Index1].item[i].inbox;
                  }
                }
                list.push(listItem);
                list.splice(Index1, 1);
                doInbox = true;
                that.update();
              }
            }
          })
        }
        else if (changeOnItem) {
          if (list[Index1].item[Index2].inbox == true) {//取消子项目归档
            list[Index1].item[Index2].inbox = false;
            undoInbox = true;
          }
          else {//包含未归档和undefined情况
            list[Index1].item[Index2].inbox = true;
            doInbox = true;
          }
          this.update();//对list的操作一定要把update放在回调里 所以这个update也放在内层，避免大量的数据传输
        }
      }
      else if (listInbox == true) {
        if (changeOnList) {
          var lastIndex = list[Index1].lastInboxIndex;
          list[Index1].inbox = false;
          for (let i = 0; i < list[Index1].item.length; i++) {
            list[Index1].item[i].inbox = !list[Index1].item[i].inbox;
          }
          if (lastIndex != null)//是非null为真，如果省略了就是非零为真
          {
            list.splice(Index1, 1);
            list.splice(lastIndex, 0, listItem);
          }//还原到之前的位置
          this.update();
          undoInbox = true;
        }
        else if (changeOnItem) {
          wx.showModal({
            confirmColor: '#F57F85',
            content: '请先左滑列表栏，\r\n对列表取消归档',
            confirmText: '我知道了',
            showCancel: false,
          })
        }
      }
      /**显示归档的Toast弹窗 */
      if (doInbox) {
        wx.showToast({
          title: '归档成功',
          icon: 'success'
        })
      }
      else if (undoInbox) {
        wx.showToast({
          title: '已取消归档',
          icon: 'success',
        })
      }
    }

  },
  /*集成修改框*/
  editValue(e) {
    var changeOnList = false, changeOnItem = false,
      Index1 = e.currentTarget.dataset.parentindex,
      Index2 = -1;
    var list = this.store.data.list;
    var that = this;
    /**判断对列表还是子项操作 */
    if (e.currentTarget.id == "ListName") {
      changeOnList = true;
    }
    else if (e.currentTarget.id == "ItemName") {
      changeOnItem = true;
      Index2 = e.currentTarget.dataset.index;
    }
    if (e.type == "tap") {//双击显示文本框
      var currentTime = e.timeStamp;//当前点击时间
      var lastTapTime = this.store.data.lastTapTime;
      this.store.data.lastTapTime = currentTime;//更新最后点击时间
      if (currentTime - lastTapTime < 300) {//300毫秒内，则是双击事件
        console.log("double click");
        if (changeOnList) {
          list[Index1].listNameEdit = true;
        }
        else if (changeOnItem) {
          list[Index1].item[Index2].itemNameEdit = true;
        }
      }
      this.update();//对lastTapTime也进行update
    }
    else if (e.type == "blur") {//input焦点离开时，检查输入值
      if (e.detail.value.length <= 0) {//输入为空，继续修改
        wx.showModal({
          cancelColor: '#00809e',
          confirmColor: '#F57F85',
          content: '内容不能为空！',
          confirmText: '继续修改',
          cancelText: '取消',
          success: function (res) {
            if (res.confirm) {//继续显示<input>
              if (changeOnList) {
                list[Index1].listNameEdit = true;
              }
              else if (changeOnItem) {
                list[Index1].item[Index2].itemNameEdit = true;
              }
              that.update();
            }
            else if (res.cancel) {
            }
          }
        })
      }
      else {//输入非空，保存
        if (changeOnList) {
          list[Index1].listName = e.detail.value;
        }
        else if (changeOnItem) {
          list[Index1].item[Index2].itemName = e.detail.value;
        }
      }
      /**取消修改或输入非空，还原成<text> */
      if (changeOnList) {
        list[Index1].listNameEdit = false;
      }
      else if (changeOnItem) {
        list[Index1].item[Index2].itemNameEdit = false;
      }
      this.update();
    }
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
    /*缓存更新和数据库更新*/
  onHide: function () {
    var list = this.store.data.list;
    wx.setStorage({
      data: list,
      key: 'storedList',
      success: function (res) {
        console.log('异步保存成功', res);
      },
      fail: function (res) {
        console.log('异步保存成功', res);
      },

    })
    wx.cloud.callFunction({
      name: 'update',
      data:
      {
        list: list,
      },
      success: function (res) {
        console.log('finish call CloudFunction update', res.result.stats);
      }
    })
  },
})
