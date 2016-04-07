// Пример оборачивания функции в песочнице

var fs = require('fs'),
    vm = require('vm');

var functionsCalls = 0;
var callbacksCalls = 0;
var myFS=cloneInterface(fs);

for(key in myFS) {
  if(typeof (myFS[key])=="function")
    myFS[key]=wrapFunction(key, myFS[key]);
}

// Объявляем хеш из которого сделаем контекст-песочницу
var context = {
  module: {},
  console: console,
  // Помещаем ссылку на fs API в песочницу
  fs: myFS,
  // Оборачиваем функцию setTimeout в песочнице
  setTimeout: function(callback, timeout) {
    // Добавляем поведение при вызове setTimeout
    console.log(
      'Call: setTimeout, ' +
      'callback function: ' + callback.name + ', ' +
      'timeout: ' + timeout
    );
    setTimeout(function() {
      // Добавляем поведение при срабатывании таймера
      console.log('Event: setTimeout, before callback');
      // Вызываем функцию пользователя на событии таймера
      callback();
      console.log('Event: setTimeout, after callback');
    }, timeout);
  }
};

// Преобразовываем хеш в контекст
context.global = context;
var sandbox = vm.createContext(context);

// Читаем исходный код приложения из файла
var fileName = './application.js';
fs.readFile(fileName, function(err, src) {
  // Запускаем код приложения в песочнице
  var script = vm.createScript(src, fileName);
  script.runInNewContext(sandbox);
});

function cloneInterface(anInterface) {
  var clone = {};
  for (var key in anInterface) {
    clone[key] = anInterface[key];
  }
  return clone;
}



function wrapFunction(fnName, fn) {
  return function wrapper() {
    functionsCalls++;
    var args = [];
    Array.prototype.push.apply(args, arguments);
    console.log('Call: ' + fnName);
    console.dir(args.filter((a)=> {
      if (a == null
          || a.length === undefined
          || a.length < 20) {
        return true;
      } else {
        return false;
      }
    }));
    if(typeof (args[args.length-1])=="function") {
      args[args.length - 1] = wrapCallback(fnName, args[args.length - 1]);
    }
    return fn.apply(undefined, args);
  }
}

function wrapCallback(fnName, fn){
  return function wrapper(){
    callbacksCalls++;
    var args = [];
    Array.prototype.push.apply(args, arguments);
    console.log('Call callback of ' + fnName);
    console.dir(args.filter((a)=>{
      if (a == null
        || a.length === undefined
        || a.length < 10) {
        return true;
      } else {
        return false;
      }
    }));
    return fn.apply(undefined, args);
  }
}

setInterval(function() {
  console.log("functionCalls: " + functionsCalls);
  console.log("callbacksCalls: " + callbacksCalls);
}, 30000)
