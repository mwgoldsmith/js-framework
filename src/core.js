define([
    './var/global',
    './var/hasOwnProperty',
    './var/isArray',
    './var/keys',
    './var/natives',
    './var/push',
    './var/slice',
    './var/toString'
], function (global, hasOwnProperty, isArray, keys, natives, push, slice, toString) {
    var IS_DONTENUM_BUGGY = (function () {
        // Thanks Prototype! (https://github.com/sstephenson/prototype/blob/master/src/prototype/lang/class.js)

        // Some versions of JScript fail to enumerate over properties, names of which 
        // correspond to non-enumerable properties in the prototype chain. IE6 doesn't
        // enumerate `toString` and `valueOf` (among other built-in `Object.prototype`)
        // properties.
        for (var p in { toString: 1 }) {
            if (p === 'toString') {
                return false;
            }
        }
        return true;
    })();

    function isObject(o) {
        return toString.call(o) === '[object Object]';
    }

    function isFunction(obj) {
        return toString.call(obj) === '[object Function]';
    }

    function toArray(value) {
        if (value === null || value === undefined) {
            return [];
        } else if (isArray(value)) {
            return value;
        }

        // It would make sense at this point to add functionality to convert
        // an 'arguments' object to an actual array. Due to the overhead of
        // testing if 'value' is an actual 'Arguments' object accurately and
        // cross-browser, however, we will maintain makeArray() separately.

        return [value];
    }

    function safeCopyProperty(tgt, org, methods) {
        var nativeProto = natives[toString.call(tgt)],
            m, i;

        // Copy the property if it is not a native prototype method
        for (i = methods.length; i--; ) {
            m = methods[i];
            if (org[m] !== nativeProto[m]) {
                tgt[m] = org[m];
            }
        }
    }

    function clone(o) {
        var result, p;

        if (isArray(o)) {
            result = [];
            for (p in o) {
                result[p] = clone(o[p]);
            }
        } else if (isObject(o)) {
            if (isFunction(o.clone)) {
                return o.clone();
            }

            result = {};

            // See comment in declaration of IS_DONTENUM_BUGGY for details
            if (object && IS_DONTENUM_BUGGY) {
                safeCopyProperty(result, o, ['toString', 'valueOf']);
            }

            for (p in o) {
                if (o.hasOwnProperty(p)) {
                    result[p] = clone(o[p]);
                }
            }

            return result;
        }

        return o;
    }

    function extend(/*[ deep,] target, srcA[, srcB[, ...]] */) {
        var a = slice.call(arguments),
                shallow = true,
                tgt, src,
                o, p, i, v,
                len;

        if (typeof a[0] === 'boolean') {
            shallow = !a.shift();
        }

        tgt = a.shift();
        src = toArray(a);

        // Clone each object
        for (i = 0, len = src.length; i < len; i++) {
            o = src[i] || {};

            // See comment in declaration of IS_DONTENUM_BUGGY for details
            if (IS_DONTENUM_BUGGY) {
                safeCopyProperty(tgt, o, ['toString', 'valueOf']);
            }

            // Clone next object
            for (p in o) {
                if (o.hasOwnProperty(p)) {
                    v = o[p];
                    if (!shallow && v && isObject(v)) {
                        tgt[p] = tgt[p] || {};
                        extend(true, tgt[p], v);
                    } else {
                        tgt[p] = v;
                    }
                }
            }
        }

        return tgt;
    };

    function proxy(obj, target, callback, methods) {
        var nativeProto = natives[toString.call(target)],
            overrides = [],
            p;

        for (p in nativeProto) {
            if (nativeProto.hasOwnProperty(p)
                && isFunction(nativeProto[p])
                && (!methods.length || methods.indexOf(p) !== -1)) {
                overrides.push(p);
            }
        }

        return (function (that, tgt, c) {
            /*
            * Create native methods on `that` which will call `callback` if provided;
            * otherwise, the call will be applied directly to `target`. Prevent
            * clobber of existing methods if present.
            */
            mdsol.each(overrides, function (override) {
                if (that[override] === undefined) {
                    var nativeMethod = nativeProto[override];

                    that[override] = (c || function (/* tgt, override, nativeMethod */) {
                        return function () {
                            return nativeMethod.apply(tgt, arguments);
                        };
                    }).call(that, tgt, override, nativeMethod);
                }
            });

            return that;
        } (obj, target, callback));
    }

    // Extend our base object with our public methods
    return extend(mdsol, {
        clone: clone,

        each: function (array, action) {
            var i, len;

            for (i = 0, len = array.length; i < len; i++) {
                action(array[i]);
            }

            return mdsol;
        },

        error: function (msg) {
            throw new Error(msg);
        },

        exists: function (identifier) {
            /* Checks if the specified identifier is defined */
            var a, i, len,
                ns = global;

            if (!identifier) {
                return false;
            }

            a = identifier.split('.');
            for (i = 0, len = a.length; i < len; i++) {
                if (!ns[a[i]]) {
                    return false;
                }

                ns = ns[a[i]];
            }

            return true;
        },

        extend: extend,

        getType: function (o) {
            return toString.call(o).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        },

        getValue: function (o, identifier) {
            var a = identifier.split('.'),
            item = o,
            i, len;

            for (i = 0, len = a.length; i < len && item; i++) {
                item = a[i] in item ? item[a[i]] : undefined;
            }

            return item;
        },

        isArray: isArray,

        isDate: function (o) {
            return toString.call(o) === '[object Date]';
        },

        isEmpty: function (o) {
            var p;

            if (o === null || o === undefined) {
                return true;
            } else if (typeof o === 'string' || isArray(o)) {
                return !!o.length;
            } else if (!isObject(o)) {
                throw new TypeError('Invalid data type.');
            }

            for (p in o) {
                return !p;
            }

            return true;
        },

        isFunction: isFunction,

        isNumber: function (o) {
            return typeof o === 'number';
        },

        isObject: isObject,

        isOwn: function (obj, key) {
            return hasOwnProperty.call(obj, key);
        },

        isPlainObject: function (o) {
            var key;

            // Borrowed for jQuery v1.8.2 (why re-invent the wheel)

            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that DOM nodes and window objects don't pass through, as well
            if (!o || !isObject(o) || o.nodeType || o === o.window) {
                return false;
            }

            try {
                // Not own constructor property must be Object
                if (o.constructor &&
                !hasOwnProperty.call(o, 'constructor') &&
                !hasOwnProperty.call(o.constructor.prototype, 'isPrototypeOf')) {
                    return false;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            for (key in o) { }

            return key === undefined || hasOwnProperty.call(o, key);
        },

        isString: function (o) {
            return typeof o === 'string';
        },

        keys: keys,

        makeArray: function (arr, index) {
            // For performance sake, this is a separate method from toArray

            return slice.call(arr, index || 0);
        },

        merge: function () {
            var args = [{}];

            push.apply(args, arguments);

            return extend.apply(this, args);
        },

        noop: function () {
            return function () { };
        },

        prxoy: proxy,
        
        toArray: toArray,

        values: function (obj) {
            var result = [], p;

            for (p in obj) {
                result.push(obj[p]);
            }

            return result;
        },

        wrap: function (func, wrapper) {
            return function () {
                var args = [func];
                push.apply(args, arguments);
                return wrapper.apply(this, args);
            };
        }
    });
});
