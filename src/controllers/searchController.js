const InitBiz = require("../biz/init.biz");
const SearchBiz = require("../biz/search.biz");

exports.cachedBigText = "";

exports.init = async () => {
    try {
        const initObj = new InitBiz();
        cachedBigText = await initObj.initFile();
    } catch (error) {
        next(error);
    }
};

exports.readCache = async () => {
    try {
        const initObj = new InitBiz();
        cachedBigText = await initObj.updateCache();
    } catch (error) {
        next(error);
    }
};

exports.search = async (request, response, next) => {

    response.setHeader('Content-Type', 'application/json');
    try {
        if(cachedBigText){
            const searchObj = new SearchBiz(cachedBigText);
            let resultSet = await searchObj.processOccurances();
            response.send(JSON.stringify({success: true, result: resultSet}));
        }else{
            response.send(JSON.stringify({success: false, msg: "Big File Still Streaming"}));
        }
    } catch (error) {
        next(error);
    }
};