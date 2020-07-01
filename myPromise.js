function Promise(executor) {
    var _this = this;
    this.state = 'pending'; //状态
    this.value = undefined; //成功结果
    this.reason = undefined; //失败原因
    this.onFulfilledFunc = [];//保存成功回调
    this.onRejectedFunc = [];//保存失败回调

    try {
        executor(resolve, reject);   
    } catch (e) {  
        reject(e);                 
    }

    function resolve(value) {
        if (_this.state === 'pending') {
            _this.value = value;
            _this.onFulfilledFunc.forEach(fn => fn(value));
            _this.state = 'resolved';
        }
    }

    function reject(reason) {
        if (_this.state === 'pending') {
            _this.value = reason;
            _this.onRejectedFunc.forEach(fn => fn(reason));
            _this.state = 'rejected';
        }
    }
}

Promise.prototype.then = function (onFulfilledFunc, onRejectedFunc) {
    let self = this;
    // 在没有传入回调函数的情况下，直接将值或者错误传递给下一个then
    onFulfilledFunc = typeof onFulfilledFunc === 'function'? onFulfilledFunc:function(value) {
        return value;
    }
    onRejectedFunc = typeof onRejectedFunc === 'function'? onRejectedFunc:function(err) {
        throw err;           
    }

    var promise2 = new Promise((resolve, reject) => {
        let fulFillCallback = () => {
            try {
                let x = onFulfilledFunc(self.value);
                resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
                reject(e);
            }
        }
        let rejectCallback = () => {
            try {
                let x = onRejectedFunc(self.reason);
                resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
                reject(e);
            }  
        }
        if (self.state === 'pending') {
            self.onFulfilledFunc.push(fulFillCallback);
            self.onRejectedFunc.push(rejectCallback);
        }
        if (self.state === 'resolved') {
            fulFillCallback();
            
        }
        if (self.state === 'rejected') {
            rejectCallback();
        }
    });
    return promise2;

}

function resolvePromise(promise2, x, resolve, reject) {
    // 防止循环引用
    if(promise2 === x) {
        return reject(new TypeError('循环引用'));
    }
    
    if (x !=null && (typeof x === 'object' || typeof x === 'function')) {
        try {
            let then = x.then; 
            if (typeof then === 'function') {
                //then是function，那么执行Promise
                let y = then.call(x, (y) => {
                    resolvePromise(promise2, y, resolve, reject);
                }, (r) => {
                    reject(r);
                })

            } else {
                resolve(x);
            }
        } catch (e) {
            reject(e);
        }
    }
    else {
        resolve(x);
    }
}

Promise.deferred = Promise.defer = function() {
    var dfd = {}
    dfd.promise = new Promise(function(resolve, reject) {
      dfd.resolve = resolve
      dfd.reject = reject
    })
    return dfd
  }

module.exports = Promise;