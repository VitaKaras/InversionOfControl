// Файл, демонстрирующий то, как фреймворк создает среду (песочницу) для
// исполнения приложения, загружает приложение, передает ему песочницу в
// качестве глобального контекста и получает ссылу на экспортируемый
// приложением интерфейс. Читайте README.md в нем задания.

// Фреймворк может явно зависеть от библиотек через dependency lookup
var fs = require('fs'),
    vm = require('vm'),
    util=require('util');



// Создаем контекст-песочницу, которая станет глобальным контекстом приложения
var context = { module: {}, console: console, setTimeout:setTimeout, setInterval:setInterval, clearInterval:clearInterval, util:util, require:myRequire};
context.global = context;
var sandbox = vm.createContext(context);

// Читаем исходный код приложения из файла
var fileName = process.argv[2];
fs.readFile(fileName, function(err, src) {
  // Тут нужно обработать ошибки
  if(err)
    throw err;
  
  // Запускаем код приложения в песочнице
  var script = vm.createScript(src, fileName);
  script.runInNewContext(sandbox);
  
  // Забираем ссылку из sandbox.module.exports, можем ее исполнить,
  // сохранить в кеш, вывести на экран исходный код приложения и т.д.
});

var clone={};

for(var key in console)
  clone[key]=console[key];

var date=new Date();

clone.log = function(massage){
  console.log(fileName +"  " +date.toLocaleTimeString()+" "+massage);
  fs.appendFile("newFile.txt", "\n"+massage, function(err) {
    if (err) throw err;
});

};

clone.log("Modifficate console.log");


function myRequire(moduleName){
    fs.appendFile("newFile2.txt", "\n"+date.toLocaleTimeString()+" "+moduleName, function(err) {
    if (err) throw err;
  });
};

