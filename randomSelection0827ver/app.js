App({
  globalData:
  {
    list: '',
  },
  getOpenid: async function () {
    (this.openid = this.openid || wx.getStorageSync('openid')) || wx.setStorageSync('openid', await this.getCloudOpenid())
    return this.openid
  },
  setData: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      wx.cloud.init({ env: 'randomselection-ira9b1' })//没有这一行就疯狂跑错
      const db = wx.cloud.database();
      const selectData = db.collection('selector');
      console.log('getSelectDatabase');
      selectData.where({
        _openid: '{openid}',
      }).get().then((res) => {//查找记录之后的回调
        if (res.data.length) {
          console.log('res.data', res.data);
          that.globalData.list = res.data[0].list;
          console.log('globalData.list', that.globalData.list);
          resolve(res.data[0].list);//resolve 放入成功数据
        }
        else {//没有找到记录之后
          selectData.add({
            data:
            {
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
            },
          }).then((res) => {//手动添加的回调
            console.log('success to add data on Launch');
            selectData.where({ _openid: '{openid}' }).get().then((res) => {//再次查找，回调（这次一定会有了）
              if (res.data.length) {
                console.log('res.data2', res.data);
                that.globalData.list = res.data[0].list;
                console.log('globalData.list', that.globalData.list);
                resolve(res.data[0].list);
              }
              else {
                reject(res, 'error');
              }

            })
          })
        }

      })
    })




  },
 
})
 






  

      
    


  

