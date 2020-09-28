// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'randomselection-ira9b1' })

const db=cloud.database()


// 云函数入口函数
exports.main = async (event, context) => {
  var updateList = event.list;
  console.log('event.list',updateList);
  const wxContext = cloud.getWXContext();
  try {

    return await db.collection('selector').where({
      _openid:wxContext.OPENID
    }).update({
      data: {
        list:updateList,
      }
    })
  }catch(e)

  {
    console.log('error in update Cloudfunction',e);
  }
}