/*******************************************************************
  这个文件中的所有定义都必须是规范的，只用于修复一些浏览器兼容问题
********************************************************************/

// 解决一些奇怪的 WebView 中 localStorage 未开放的问题
// 此处包一个 try cache，因为无法预料一些奇葩的环境出什么异常
try {
  // 此处不能 var localStorage，在 IE9/10 会出现常量重复定义的错误
  // 如果它不是 object 那就肯定是一坨奇奇怪怪的的东西
  if(typeof localStorage !== 'object') {
    // 可能是一个 ready only 的，所以需要先删除
    // 但是严格模式中删除不存在的属性会出错，所以先判断
    if('localStorage' in self) delete localStorage;
    // 重新赋值为对象
    localStorage = {};
  }
} catch(error) {
   // 异步抛出，避免影响当前执行帧
  setTimeout(function() {
    throw error;
  });
}

// 解决隐私模式下 localStorage 不正常问题
void function() {
  // 使用一个 32 位以上的 36 进制字符串作为 key 以防止冲突
  var hash = '';
  while(hash.length < 32) {
    hash += Math.floor(Math.pow(36, 10) * Math.random()).toString(36);
  }
  try {
    // 测试 localStroage 是否可用
    localStorage.setItem(hash, hash);
    if(hash === localStorage.getItem(hash)) {
      localStorage.removeItem(hash);
    }
  } catch(e) {
    // 此时还没有 localStorage 就表示这货是全局不可写且不可配置的 null
    if(!localStorage) return setTimeout(function() { throw new Error('The fucking localStorage is a hard null.'); });
    // 若 localStorage 不可用则将其方法对应到一个临时堆上储存
    var heap = {};
    // 所有 key 都加一个前缀以防止与原生属性冲突
    var prefix = hash;
    localStorage.setItem = function(key, value) {
       // 总是以字符串储存
       heap[prefix + key] = value + '';
    };
    localStorage.getItem = function(key) {
      // 项不存在时返回 null 而不是 undefined
      return (prefix + key) in heap ? heap[prefix + key] : null;
    };
    localStorage.removeItem = function(key) {
      delete heap[prefix + key];
    };
    localStorage.clear = function() {
      heap = {};
    };
  }
}();

// 解决隐私模式下 sessionStorage 不正常问题
// （据说）不用 setItem，访问 localStorage 这个引用就会报错，所以上面代码不能复用
void function() {
  // 使用一个 32 位以上的 36 进制字符串作为 key 以防止冲突
  var hash = '';
  while(hash.length < 32) {
    hash += Math.floor(Math.pow(36, 10) * Math.random()).toString(36);
  }
  try {
    // 测试 localStroage 是否可用
    sessionStorage.setItem(hash, hash);
    if(hash === sessionStorage.getItem(hash)) {
      sessionStorage.removeItem(hash);
    }
  } catch(e) {
    // 此时还没有 sessionStorage 就表示这货是全局不可写且不可配置的 null
    if(!sessionStorage) return setTimeout(function() { throw new Error('The fucking sessionStorage is a hard null.'); });
    // 若 sessionStorage 不可用则将其方法对应到一个临时堆上储存
    var heap = {};
    // 所有 key 都加一个前缀以防止与原生属性冲突
    var prefix = hash;
    sessionStorage.setItem = function(key, value) {
       // 总是以字符串储存
       heap[prefix + key] = value + '';
    };
    sessionStorage.getItem = function(key) {
      // 项不存在时返回 null 而不是 undefined
      return (prefix + key) in heap ? heap[prefix + key] : null;
    };
    sessionStorage.removeItem = function(key) {
      delete heap[prefix + key];
    };
    sessionStorage.clear = function() {
      heap = {};
    };
  }
}();

// 修复 Safari 对 Date.parse 的兼容问题
void function() {
  // 保存旧方法
  var parse = Date.parse;
  // 劫持原生 parse 方法
  Date.parse = function(string) {
    //                               1     2     3     4     5        6         7           8
    var raw = String(string).match(/^(\d+)-(\d+)-(\d+)T(\d+):(\d+)(?::(\d+)(?:\.(\d\d\d))?)?(z|[+-]\d\d:?\d\d)$/i);
    if(raw) {
      var z = raw[8].match(/\d\d/g) || [];
      z[0] = z[0] | 0;
      z[1] = z[1] | 0;
      if(raw[8].charAt(0) === '-') {
        z[0] = -z[0];
        z[1] = -z[1];
      }
      return Date.UTC(raw[1], raw[2] - 1, raw[3], raw[4] - z[0], raw[5] - z[1], raw[6] | 0, raw[7] | 0);
    } else {
      return parse.apply(this, arguments);
    }
  };
}();
