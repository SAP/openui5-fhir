module.exports = function (sData, sVersion) {
    return sData.replace(/\$\{version\}/g, sVersion);
};