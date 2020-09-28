const app = getApp()

Page({
  data: {
    list: [
      { listName: '列表1', slideviewShow: false },
      { listName: '列表2', slideviewShow: false },
      { listName: '列表3', slideviewShow: false },
      { listName: '列表4', slideviewShow: false },
      { listName: '列表5', slideviewShow: false },
      { listName: '列表6', slideviewShow: false }
    ],
    buttons: [
      { text: '选择' },
      { text: '删除' }
    ],
    slideviewShowIndex: 0,
  },
  getTap(e) {
    var targetId = e.target.id;//触发点击事件的组件id
    var targetIndex = e.target.dataset.index;//触发点击事件的列表组件的序号
    let slideviewShowIndex = this.data.slideviewShowIndex;//展开slideview的列表序号
    let list = this.data.list;
    let listSlideView = "list[" + slideviewShowIndex + "].slideviewShow"//拼贴字符串，为了在setData里动态改变这一项的数据，减少setData传输的值
    console.log(list[slideviewShowIndex].slideviewShow);//打印确认一下已经展开的列表项的确是true
    console.log('tap Show', targetId);
    if (targetId != "listItem")//点击的不是列表项
    {
      console.log('targetId-tap', targetId);
      this.setData({ [listSlideView]: false });
    }
    else if (targetIndex != slideviewShowIndex)//点击的不是slideview展开的列表项
    {
      console.log('targetIndex-tap', targetIndex);
      this.setData({ [listSlideView]: false });
    }
    else {
      this.setData({ [listSlideView]: true });
    }
  },
  showSlideview(e) {
    let Index = e.currentTarget.dataset.index;
    console.log('slideview is showing', Index);//打印当前展开的序号
    let list=this.data.list;
    let listSlideView = "list[" + Index + "].slideviewShow"
    let i;

    this.setData({ slideviewShowIndex: Index });
    this.setData({ [listSlideView]: true });
    //for循环是为了保证其他的列表slideview收拢 删掉这个for循环就能同时展开几个列表（如果操作一个展开之后拖动别的展开）
    for(i=0;i<list.length;i++)
    {
      let checkSlideView="list["+i+"].slideviewShow"
      if(i!=Index)
      {
        this.setData({[checkSlideView]:false});
      }
    }
  },
  onLoad: function () {
  }
})
