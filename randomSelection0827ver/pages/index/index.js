//index.js
let isInitSelfShow=true;
var app = getApp()

Page({
  data: {
    list: '',
  },
  onLoad: function () {
wx.showToast({
  title: '加载中',
  icon:'loading'
})
   var that=this;
   if(app.globalData.list=='')
   {
      app.setData().then(res=>{
        console.log('promise回调后的数据-index：',res);
        var list=res;
       // console.log('list',list);
        that.setData({list:list});
        console.log('that.data.list',that.data.list);     
      })
   }
   else{
     var list=app.globalData.list;
     that.setData({list:list});
     console.log('app.globalData.list',that.data.list);
   }
  },

  goToList(e) {//跳转并添加列表
    wx.$goToList = true;
    wx.switchTab({ url: '/pages/list/list', })
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
    console.log('listAfterOpen',this.data.list);
  },
  packUp(data, index) { //让所有的展开项，都变为收起
    for (let i = 0, len = data.length; i < len; i++) {//其他最外层列表变为关闭状态
      if (index != i) {
        data[i].show = false;
      }
    }
  },

  chooseList(e) {
    let Index = e.currentTarget.dataset.parentindex;
    let list = this.data.list;
    let listChose = "list[" + Index + "].chose"
    
    if (list[Index].inbox == true) {
      wx.showModal({
        cancelColor: '#00809e',
        confirmColor: '#F57F85',
        title: '归档列表无法选中',
        content: '请先前往操作页面，左滑列表项取消归档',
        confirmText: '好的',
        cancelText: '取消',
        
      })
    }
    else {
      if(list[Index].item.length==0)
      {
        wx.showModal({
          cancelColor: '#00809e',
          confirmColor: '#F57F85',
          title: '空列表无法选中',
          content: '请先前往操作页面，展开列表添加子项目',
          confirmText: '好的',
          cancelText: '取消',
          
        })
      }
      else{
        this.setData({ [listChose]: !list[Index].chose });
      }
      
    }

    console.log(this.data.list[Index].chose);
  },
  randomSelection(e) {
    let list = this.data.list;
    let listLen = list.length;
    var chooseIndex = 0;

    let i = 0, j = 0;
    for (i = 0; i < listLen; i++) {
      if (list[i].chose == true) {

        do {
          chooseIndex = Math.floor(Math.random() * list[i].item.length);
        } while (list[i].item[chooseIndex].inbox)
        console.log(list[i].item.length, chooseIndex);
        list[i].chooseIndex = chooseIndex;
      }
    }
    this.setData({ list });
  },
  onShow:function(e)
  {
    if(isInitSelfShow==true){
      return
    }
    else
    {
      var list=app.globalData.list;
      this.setData({list:list});
      console.log('app.globalData.list when reshow',this.data.list);
    }
   
   
  
  },
  onHide:function()
  {
    isInitSelfShow=false;
  }
})
