const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();

  const bindRes = await db.collection('company_user_bindings').where({
    openid: OPENID
  }).get().catch(() => null)
  // console.log(bindRes)
  // 注意使用where匹配查询返回的是数组
  if (!bindRes || !bindRes.data || !bindRes.data[0].status) {
    return { exist: false, company_id: '', msg: '该用户未绑定公司' }
  } else {
    const companyId = bindRes.data[0].companyId
    return { exist: true, company_id: companyId, msg: '绑定查询成功' }
  }
}