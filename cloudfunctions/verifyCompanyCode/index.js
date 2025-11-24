const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()
const crypto = require('crypto')

exports.main = async (event, context) => {
  const { companyId, companyCode } = event;
  const { OPENID } = cloud.getWXContext();

  // 1. 查公司
  const companyRes = await db.collection('companies').doc(companyId).get().catch(() => null);
  if (!companyRes || !companyRes.data) {
    return { valid: false, status_code: 'COMPANY_NOT_FOUND', msg: '公司不存在' };
  }

  const company = companyRes.data;
  if (!company.status) {
    return { valid: false, status_code: 'COMPANY_DISABLED', msg: '公司已停用' };
  }

  // 2. 校验邀请码
  const hash = crypto
    .createHash('sha256')
    .update(companyCode + company.companyCodeSalt)
    .digest('hex');

  if (hash !== company.companyCodeHash) {
    return { valid: false, status_code: 'INVITE_INVALID', msg: '邀请码错误' };
  }

  // 3. 建立或恢复绑定
  const bindingCol = db.collection('company_user_bindings');
  const bindingRes = await bindingCol
    .where({
      openid: OPENID,
      companyId
    })
    .get();

  const now = Date.now();

  if (bindingRes.data.length > 0) {
    const binding = bindingRes.data[0];

    if (!binding.status) {
      await bindingCol.doc(binding._id).update({
        data: {
          status: true,
          updatedAt: now
        }
      });
    }

    return { valid: true, status_code: 'BIND_OK', msg: '已绑定', companyId };
  }

  // 4. 新建绑定
  await bindingCol.add({
    data: {
      openid: OPENID,
      companyId,
      status: true,
      createdAt: now,
      updatedAt: now
    }
  });

  return { valid: true, status_code: 'BIND_CREATED', msg: '绑定成功', companyId };  
}