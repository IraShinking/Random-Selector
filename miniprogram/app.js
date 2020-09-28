import store from './store'
App({
   //获取openid顺序：globalData--云函数login；如果担心openid的安全，就用这个函数
   getCloudOpenid: async function () {
    return this.openid = this.openid || (await wx.cloud.callFunction({name: 'login'})).result.OPENID
  },
  //获取openid顺序：globalData--storage--云函数login；最佳方案。
  getOpenid: async function () {
    (this.openid = this.openid || wx.getStorageSync('openid')) || wx.setStorageSync('openid', await this.getCloudOpenid())
    return this.openid
  },
})
 






  

      
    


  

