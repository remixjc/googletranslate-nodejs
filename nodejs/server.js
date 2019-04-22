var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var superagent = require('superagent');
var cheerio = require('cheerio');

// 创建 application/x-www-form-urlencoded 编码解析
var urlencodedParser = bodyParser.urlencoded({ extended: false })

function b(a, b) {
    for (var d = 0; d < b.length - 2; d += 3) {
        var c = b.charAt(d + 2),
            c = "a" <= c ? c.charCodeAt(0) - 87 : Number(c),
            c = "+" == b.charAt(d + 1) ? a >>> c : a << c;
        a = "+" == b.charAt(d) ? a + c & 4294967295 : a ^ c
    }
    return a
}

function tk(a, TKK) {
    for (var e = TKK.split("."), h = Number(e[0]) || 0, g = [], d = 0, f = 0; f < a.length; f++) {
        var c = a.charCodeAt(f);
        128 > c ? g[d++] = c : (2048 > c ? g[d++] = c >> 6 | 192 : (55296 == (c & 64512) && f + 1 < a.length && 56320 == (a.charCodeAt(f + 1) & 64512) ? (c = 65536 + ((c & 1023) << 10) + (a.charCodeAt(++f) & 1023), g[d++] = c >> 18 | 240, g[d++] = c >> 12 & 63 | 128) : g[d++] = c >> 12 | 224, g[d++] = c >> 6 & 63 | 128), g[d++] = c & 63 | 128)
    }
    a = h;
    for (d = 0; d < g.length; d++) a += g[d], a = b(a, "+-a^+6");
    a = b(a, "+-3^+b+-f");
    a ^= Number(e[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    a %= 1E6;
    return a.toString() + "." + (a ^ h)
}

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
            console.log(tkk);
            var tks = tk(req.body.fr, tkk);
            console.log(tks);
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