var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var superagent = require('superagent');
var cheerio = require('cheerio');
var gettk = require('./common/gettk')

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use('/public', express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})
app.get('/lang', function(req, res) {
    res.sendfile(__dirname + "/data/" + "lang.json");
})

app.post('/translate', urlencodedParser, function(req, res) {
    //通过地址爬取页面内容
    var Url = 'https://translate.google.cn';
    var result = '';
    superagent.get(Url)
        .end(function(err, response) {
            if (err) {
                return console.error(err);
            }
            var reg = new RegExp("(?<=tkk:')(.*?)(?=')");
            var tkk = response.text.match(reg)[0];
            var $ = cheerio.load(response.text);
            var tks = gettk.tk(req.body.fr, tkk);
            var googleTransUrl = "https://translate.google.cn/translate_a/single?client=t&sl=" + req.body.lang + "&tl=" + req.body.tolang + "&hl=en&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&otf=1&ssel=0&tsel=0&kc=1&tk=" + tks + "&q=" + encodeURIComponent(req.body.fr);
            superagent.get(googleTransUrl)
                .end(function(err, response) {
                    if (err) {
                        return console.error(err);
                    }
                    result = JSON.parse(response.text)[0][0][0];
                    console.log(googleTransUrl);
                    res.end(result);
                })
        })
})

var server = app.listen(8888, function() {

    var host = server.address().address
    var port = server.address().port

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

})