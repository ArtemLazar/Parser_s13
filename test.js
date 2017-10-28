var tress = require('tress');
var needle = require('needle');
var cheerio = require('cheerio');
var resolve = require('url').resolve;
var fs = require('fs');

var URL = 'http://s13.ru/';
var results = [];
var titles = [];

var q = tress(function (url, callback) {
    needle.get(url, function (err, res) {
        if (err) throw err;

        // парсим DOM
        var $ = cheerio.load(res.body);

        //информация о новости
        results.push({
            title: $('h3').text(),
            text: $('p').text(),
            href: url,
            //size: $('.newsbody').text().length
        });

        $('.b_rewiev p>a').each(function () {
            q.push($(this).attr('href'));
        });

        //паджинатор
        $('.bpr_next>a').each(function () {
            // не забываем привести относительный адрес ссылки к абсолютному
            q.push(resolve(URL, $(this).attr('href')));
        });

        callback();
    });
}, 10); // запускаем 10 параллельных потоков

/*var regexp = /\([0-9]+\W*\/\W*[0-9]+\)/g;
var str = "Евросоюз выделил 500 тысяч евро на реконструкцию стадиона в Щучине (3204 / 15)В Гродно возбуждены уголовные дела за брошенные из окон бутылки (3196 / 4)Безвизовые туристы за год потратили в Гродно более $10 млн (2351 / 23)В Новогрудском районе создают туристические веломаршруты по местам, связанным с королем Миндовгом (679 / 3)Эксгибиционист-рецедивист снова проявил себя по пути в Гродно, и снова был задержан (5274 / 9)В образовании до минималки доплачивают каждому третьему работнику, а в медицине — каждому шестому (2634 / 54)С 1 ноября подорожают сигареты Гродненской табачной фабрики «Неман» (4563 / 9)Филипп Киркоров выступил в Гродно с шоу «Я» (18017 / 36)С 29 октября Польша и Литва переводят стрелки часов на час назад (1895 / 21)Один из руководителей областной организации сядет в тюрьму на 6 лет (9399 / 16)В Беларуси отменят вступительные экзамены в 5-е классы гимназий (4381 / 19)";
strs = str.split(regexp);
for (var i = 0; i < strs.length; ++i) {
console.log(strs[i]);
}*/

q.drain = function () {
    fs.writeFileSync('./data.json', JSON.stringify(results, null, 4));
}

q.push(URL);
