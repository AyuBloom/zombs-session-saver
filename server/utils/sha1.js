const crypto = require("crypto");
module.exports = function sha1(str) {
    const sha_sum = crypto.createHash('sha1');
    sha_sum.update(str);
    return sha_sum.digest('hex');
};