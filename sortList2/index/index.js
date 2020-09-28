let app = getApp()
app.unitgameinfo =
 { "members":
  [
    { "member": { "nickname": "小程序照片合成", "job": "ckext" }, },
     { "member": { "nickname": "高球丸子" }, }, 
     { "member": { "nickname": "DRobertdsf", "job": "黄金" }, }, 
     { "member": { "nickname": "erer", "job": "ckext" }, }, 
     { "member": { "nickname": "just do it", "job": "黄金" }, },
      { "member": { "nickname": "888" }, }
    ], 
};
Page({
  data: {
  },
  onLoad: function (options) {
    var info = app.unitgameinfo, list;
    list = info.members;
    this.setData({ options, info, list });//全局变量装载到当前页的页数据里
    this.getwxmlcode("#movebox", (resp) => {
      this.setData({ movebox: resp })//获取外层箱子的信息并记录
      console.log('movebox',this.data.movebox);
      setTimeout(() => {
        this.getwxmlcode("#movelist0", (res) => {
          this.setData({ movelist0: res })//获取内层列表的信息并记录
          console.log('moveList0',this.data.movelist0);
          var jiange = res.top - resp.top;//由于这里是0
          console.log('jiange',jiange);
          var yiban = res.bottom - res.top + jiange;//这里就等于盒子高度
          
          this.setData({
            itemheight: res.bottom - res.top,
            jiange: yiban, //两条中间到另一条的距离//jg现在等于盒子高度
            jianqu: resp.top - (res.bottom - res.top) / 2, //位置要减去距离//箱子顶部减去半个盒子高度
          })
          console.log('jiangee',jiange,'yiban',yiban,'resp.top',resp.top,'jianqu',this.data.jianqu);
        })
      }, 300)
    })

  },
  getwxmlcode(str, cal) {//str是用来当索引的 找到的信息储存在cal里面返回
    const query1 = wx.createSelectorQuery()
    query1.select(str).boundingClientRect()//选择节点 返回位置信息
    query1.selectViewport().scrollOffset()//选择显示区域和查询请求
    query1.exec((res) => {
      if (cal) cal(res[0])//cal=callback 在执行请求 但我看不懂
    })
  },
  listitemmove(e) {
    // console.log(e)
    if (e.type == "touchmove") {//如果是移动事件
      var movetop = e.touches[0].pageY - this.data.itemheight;//标签的y坐标减去盒子高度
      var moveoutindex = parseInt((movetop) / this.data.itemheight);//画图才知道干嘛
      console.log('movetop',movetop,'moveoutindex',moveoutindex);
     if (e.currentTarget.dataset.index <= moveoutindex) moveoutindex++;
      this.moveoutindex = moveoutindex;
      console.log('moveoutIndex',moveoutindex);
      this.setData({ nowmoveindex: e.currentTarget.dataset.index, movetop, moveoutindex })
    } else {//如果不是移动事件（touchend）//其实大家使用的是同一个e，就算分开写也是一样的，这里是代码简化
      let index = e.currentTarget.dataset.index, score = this.data.list;
      
      let data = { ...score[index] };//取出这个元素存着
      console.log('score[index]',data);
      score.splice(index, 1);
      if (index <= this.moveoutindex - 1) this.moveoutindex--;
      score.splice(this.moveoutindex, 0, data);
      this.setData({ list: score, moveoutindex: -1, nowmoveindex: -1 });
    }
  },
  onShow: function () {
  },
  lastsubmit() {//绑定在button的确认事件
    console.log(this.data.list)
  },

})