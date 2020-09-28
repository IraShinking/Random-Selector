
const cloud = require('wx-server-sdk')
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
   env:'randomselection-ira9b1'
})
exports.main = async () => {return cloud.getWXContext()}


