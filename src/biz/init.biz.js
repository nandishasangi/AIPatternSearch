const fs = require('fs');
const wget = require('wget-improved');

class InitBiz {

    constructor() {
        this.filePath = __dirname + "/../storage/big.txt";
        this.src = "http://norvig.com/big.txt";
    }

    initFile() {
        return new Promise((resolve, reject) => {
            let download = wget.download(this.src, this.filePath, {});
            download.on('error', function(err) {
                 reject(false)
            });
            download.on('end', function(output) {
                resolve(true);
            });
        });
    }

    updateCache() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.filePath, 'utf8', function(err, contents) {
                return resolve(contents);
            });
        });
    }
}

module.exports = InitBiz;