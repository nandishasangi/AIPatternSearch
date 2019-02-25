const app = require("express")();
const config = require("config");

var searchController = require("./src/controllers/searchController");

searchController.init();

setInterval(() => { 
    searchController.readCache();
}, config.updateCacheTimer);

app.get("/", searchController.search);

const defaultPort = 3001;
app.listen((process.env.PORT_NO || defaultPort), () => {
    console.log(`Server Started on port ` + (process.env.PORT_NO || defaultPort));
});

module.exports = app;