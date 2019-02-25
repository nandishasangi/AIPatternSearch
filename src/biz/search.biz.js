var config = require('config');
const got = require('got');

class SearchBiz {

    constructor(bigString){
        this.bigString = bigString;
    }

    async getfirstTenWords(){
        let self = this;
        let words = self.bigString.split(/\s+/).slice(0,50).join(" ");
        words = words.split(" ");
        words = words.filter((x, i, a) => a.indexOf(x) == i);
        return words.slice(0, 10);
    }

    async buildURL(text){
        let URLParams = "key="+config.dictionaryProxy.apiKey;
        URLParams += "&lang="+config.dictionaryProxy.lang;
        URLParams += "&text="+text;
        return config.dictionaryProxy.endPoint+"?"+URLParams;
    }

    async getWordCounts(words){

        let self = this;
        let wordsDictionaries = {};

        words.forEach(async (word) => {
            wordsDictionaries[word] = 0;
            let pattern = new RegExp ('\\b(\\w*' + word + '\\w*)\\b', 'igm');
            let matchedArray = self.bigString.match(pattern);
            wordsDictionaries[word] = matchedArray ? matchedArray.length : 0;
        });
        return wordsDictionaries;
    }

    async processOccurances() {
        return new Promise(async (resolve, reject) => {
            let self = this;
            let words = await self.getfirstTenWords();
            let wordsCount = await self.getWordCounts(words);
            let wordsApiData = await self.parseOccurances(words);
            let mappedResponseList = self.prepareMapList(words, wordsCount, wordsApiData);
            return resolve(mappedResponseList);
        });
    }

    async getData(word){
        let self = this;
        try {
            let url = await self.buildURL(word);
            const response = await got(url);
            return response.body
        } catch (error) {
            console.log(error);
        }
    }

    async prepareMapList(words, wordsCount, wordsApiData){

        let parsedDictionaries = [];

        for(let i=0; i<words.length; i++){
            let dict = {};
            dict['key'] = words[i];
            dict['count'] = wordsCount[words[i]];
            dict['synonym'] = wordsApiData[words[i]];
            parsedDictionaries.push(dict);
        }
        return parsedDictionaries;
    }

    async parseOccurances(words){
        let self = this;
        let parsedDictionaries = {};

        return new Promise(async (resolve, reject) => {
            for (let i=0; i<=words.length; i++){
                let result = await self.getData(words[i]);
                parsedDictionaries[words[i]] = await self.getSynRecursively(JSON.parse(result)['def']);
            };
            return resolve(parsedDictionaries);
        });
    }

    async getSynRecursively(results){
        let data = [];

        for(let j=0; j<results.length; j++){
            let result = results[j];
            if(result.text && result.pos){
                data = data.concat({text: result.text, pos:result.pos});
            }
    
            if(result.tr && result.tr.length > 0){
                if(result.tr[0].syn != undefined){
                    for(let i=0; i<result.tr.length; i++){
                        if(result.tr[i].text && result.tr[i].pos){
                            data = data.concat({text: result.tr[i].text, pos:result.tr[i].pos});
                        }
                        if(result.tr[i].syn){
                            data = data.concat(result.tr[i].syn);
                        }
                    }
                }else{
                    data = data.concat(result.tr)
                }
            }
        }
        return data;
    }
}

module.exports = SearchBiz;
