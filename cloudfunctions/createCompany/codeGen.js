const CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; 

function generateCompanyCode(length = 8) {
  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * CHARS.length);
    result += CHARS[idx];
  }
  return result;
}

module.exports = {
  generateCompanyCode
};