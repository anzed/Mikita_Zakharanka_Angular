'use strict';

function Scope() {
    this.$$watchers = [];
    this.$$asyncs = [];
    this.$$postDigests = [];
    this.$$phase = null;
}

Scope.prototype.$watch = function (watchFn, listenerFn, valueEq) {
    var self = this;
    
    var watcher = {
        watchFn: watchFn,
        listenerFn: listenerFn || undefined,
        valueEq: false
    };
    self.$$watchers.push(watcher);
    
    return function() {
        var i = self.$$watchers.indexOf(watcher);
        if (i >= 0) {
            self.$$watchers.splice(i, 1);
        }
    };
};


Scope.prototype.$watchGroup = function (watchArr, listenerFn) {
    var self = this;
    var newArr = new Array(watchArr.length),
        oldArr = new Array(watchArr.length);
    
    _.forEach(watchArr, function (watchFn, i) {
        self.$watch(watchFn, function (newVal, oldVal) {
            newArr[i] = newVal;
            oldArr[i] = oldArr;
            listenerFn(newArr, oldArr, self);
        });
    });   
};

Scope.prototype.$digest = function () {
    var wereChanges,
        count = 0;
    this.$phaseStart("progressing 'digest'");
    
    do {
        while (this.$$asyncs.length) {
            try {
                var async = this.$$asyncs.shift();
                this.$eval(async.expression);
            } catch (e) {
                console.error(e);
            }
        }
        wereChanges = this.$oneDigest();
        count++;
    } while (wereChanges && (count <= 10));
    
    this.phaseEnd();
    
    while (this.$$postDigests.length) {
        try {
            this.$$postDigests.shift()();
        } catch (e) {
            console.error(e);
        }
    }
};

Scope.prototype.$oneDigest = function () {
    var self = this,
        wereChanges;
    
    _.forEach(this.$$watchers, function (x) {
        try {
            var newVal = x.watchFn(self);
            var oldVal = x.last;
        
            if (!angular.equals(newVal, oldVal)) {
                x.listenerFn(newVal, oldVal, self);
                x.last = x.valueEq ? angular.copy(newVal) : newVal;
                wereChanges = true;
            }
        } catch (e) {
            console.error(e);
        }
    });
    
    return wereChanges;
};

Scope.prototype.$eval = function (expr, locals) {
    return expr(this, locals);
};

Scope.prototype.$apply = function (expr) {
    try {
        this.$phaseStart("progressing 'apply");
        return this.$eval(expr);
    } finally {
        this.$phaseEnd();
        this.$digest();
    }
};

Scope.prototype.$evalAsync = function (expr) {
    var self = this;
    
    if (!self.$$phase && !self.$$asyncs.length) {
        setTimeout(function() {
            if (self.$$asyncs.length) {
                self.$digest();
            }
        }, 0);
    }
    
    self.$$asyncs.push({
        expression: expr
    });
};

Scope.prototype.$phaseStart = function (phase) {
    if (this.$$phase) {
        throw this.$$phase;
    }
    this.$$phase = phase;
};

Scope.prototype.phaseEnd = function () {
    this.$$phase = null;
};

Scope.prototype.$postDigest = function (func) {
    this.$$postDigests.push(func);
};
