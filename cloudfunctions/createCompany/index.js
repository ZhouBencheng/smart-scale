const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const crypto = require('crypto')
const { generateCompanyCode } = require('codeGen')

exports.main = async (event, context) => {
  const companyCode = generateCompanyCode()
  const salt = crypto.randomBytes(8).toString('hex')

  const hash = crypto.createHash('sha256')
                     .update(companyCode + salt)
                     .digest('hex')
  // console.log({companyCode, hash, salt})
  return {
    companyCode: companyCode,
    hash: hash,
    salt: salt,
  }
}