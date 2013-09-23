(function($, undefined) {
    'use strict';

var dontEnumBug = !({ toString: null }).propertyIsEnumerable('toString');

// @DONE (2013-09-17 09:27)
var global = (function () {
        /*
        * Provides access to global object without referencing window directly.
        * Will work in strict mode.
        */
        return this || (1, eval)('this');
    } ());

// @DONE (2013-09-17 09:20)
var natives = (function () {
        var toString = ({}).toString,
            map = {
                'String': '',
                'Number': 0,
                'Date': new Date(),
                'Boolean': true,
                'RegExp': /./,
                'Array': [],
                'Object': {},
                'Function': function () {}
            },
            hash = {},
            type, value;
        
        for (type in map) {
            if (map.hasOwnProperty(type)) {
                value = map[type];
                hash[toString.call(value)] = value.constructor.prototype;
            }
        }

        return hash;
    } ());

// @DONE (2013-09-17 09:32)
var hasOwnProperty = natives['[object Object]'].hasOwnProperty;

// @DONE (2013-09-17 09:35)
var push = natives['[object Array]'].push;

// @DONE (2013-09-17 09:34)
var slice = natives['[object Array]'].slice;

// @DONE (2013-09-17 09:33)
var toString = natives['[object Object]'].toString;

// @DONE (2013-09-17 09:30)
var isArray = (function () {
        var isArray = [].constructor.isArray;

        /*
        * Browser support for native implementation of `Array.isArray`:
        *
        * Chrome:             5
        * Firefox (Gecko):    4 (2.0)
        * Internet Explorer:  9
        * Opera:              10.5	
        * Safari:             5
        *
        * Use native method if it exists; otherwise, shim it.
        */
        return typeof isArray === 'function'
            ? isArray
            : function (obj) {
                return toString.call(obj) === '[object Array]';
            };
    } ());

/*global dontEnumBug*/
// @DONE (2013-09-17 10:20)
var keys = (function () {
        var keys = natives['[object Object]'].constructor.keys,
            dontEnum = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];
        
        /*
        * Browser support for native implementation of `Object.keys`:
        *
        * Chrome:             5
        * Firefox (Gecko):    4 (2.0)
        * Internet Explorer:  9
        * Opera:              12
        * Safari:             5
        *
        * Use native method if it exists; otherwise, shim it.
        */
        return typeof keys === 'function'
            ? keys
            : function (obj) {
                var p, i, len, result = [];

                if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
                    throw new TypeError('keys called on non-object');
                }

                for (p in obj) {
                    if (hasOwnProperty.call(obj, p)) {
                        result.push(p);
                    }
                }

                if (dontEnumBug) {
                    for (i = 0, len = dontEnum.lngth; i < len; i++) {
                        if (hasOwnProperty.call(obj, dontEnum[i])) {
                            result.push(dontEnum[i]);
                        }
                    }
                }

                return result;
            };
    } ());

    var mdsol;
    
    function error(msg) {
        throw new Error(msg);
    }

    function now() {
        return (new Date()).getTime();
    }
    
    /*
    * Checks if the provided object is a string.
    */
    function isString(obj) {
        return toString.call(obj) === '[object String]';
    }

    /*
    * Checks if the provided object is a number.
    */
    function isNumeric(obj) {
        return obj - parseFloat(obj) >= 0;
    }

    /*
    * Checks if the provided object is an object.
    */
    function isObject(obj) {
        return toString.call(obj) === '[object Object]';
    }

    /*
    * Checks if the provided object is a function.
    */
    function isFunction(obj) {
        return toString.call(obj) === '[object Function]';
    }

    /*
    * Checks if the provided object is an object literal (plain object), or if
    * it was created via a constructor.
    */
    function isPlainObject(obj) {
        var key;

        // Borrowed for jQuery v1.8.2 (why re-invent the wheel)

        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if (!obj || !isObject(obj) || obj.nodeType || obj === obj.window) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if (obj.constructor &&
                !hasOwnProperty.call(obj, 'constructor') &&
                !hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        for (key in obj) {
        }

        return key === undefined || hasOwnProperty.call(obj, key);
    }

    /*
    * Checks if the provided object is a date.
    */
    function isDate(o) {
        return toString.call(o) === '[object Date]';
    }

    function isEmpty(o) {
        var p;

        if (o === null || o === undefined) {
            return true;
        }
        if (typeof o === 'string' || isArray(o)) {
            return !o.length;
        }
        if (!isObject(o)) {
            throw new TypeError('Invalid data type.');
        }

        for (p in o) {
            return !p;
        }

        return true;
    }

    function isOwn(obj, key) {
        return hasOwnProperty.call(obj, key);
    }

    function getType(obj) {
        return toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }

    function toArray(value) {
        if (value === null || value === undefined) {
            return [];
        }
        if (isArray(value)) {
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
            m,
            i;

        // Copy the property if it is not a native prototype method
        for (i = methods.length; i--; ) {
            m = methods[i];
            if (org[m] !== nativeProto[m]) {
                tgt[m] = org[m];
            }
        }
    }

    function exists(identifier) {
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
    }

    function clone(obj) {
        var result, p;

        if (isArray(obj)) {
            result = [];
            for (p in obj) {
                result[p] = clone(obj[p]);
            }
        } else if (isObject(obj)) {
            if (isFunction(obj.clone)) {
                return obj.clone();
            }

            result = {};

            // See comment in declaration of dontEnumBug for details
            if (dontEnumBug) {
                safeCopyProperty(result, obj, ['toString', 'valueOf']);
            }

            for (p in obj) {
                if (obj.hasOwnProperty(p)) {
                    result[p] = clone(obj[p]);
                }
            }

            return result;
        }

        return obj;
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

            // See comment in declaration of dontEnumBug for details
            if (dontEnumBug) {
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
    }

    /*
    * Perform an action on each element in an array-like object.
    */
    function each(array, action) {
        var i, len;

        for (i = 0, len = array.length; i < len; i++) {
            action(array[i]);
        }

        return mdsol;
    }

    function merge() {
        var args = [{}];

        push.apply(args, arguments);

        return extend.apply(this, args);
    }

    function values(obj) {
        var result = [], p;

        for (p in obj) {
            result.push(obj[p]);
        }

        return result;
    }

    /*
    * Convert an array-like object to an array.
    * Ideal for converting `arguments` to an array.
    * For performance sake, this is a separate method from toArray.
    */
    function makeArray(obj, index) {
        return slice.call(obj, index || 0);
    }

    function getValue(o, identifier) {
        var a = identifier.split('.'),
            item = o,
            i, len;

        for (i = 0, len = a.length; i < len && item; i++) {
            item = a[i] in item ? item[a[i]] : undefined;
        }

        return item;
    }

    function proxy(obj, target, callback, methods) {
        var nativeProto = natives[toString.call(target)],
            available = Object.getOwnPropertyNames(nativeProto),
            override, i;

        for (i = available.length; i--; ) {
            override = available[i];
            if ((!methods.length || methods.indexOf(override) !== -1)
                && !target.hasOwnProperty(override)) {
                /*
                * Create native method on `target` which will call `callback` if provided;
                * otherwise, the call will be applied directly to `target`. Prevent
                * clobber of existing methods if present.
                */
                obj[override] = (function (that, tgt, c, nativeMethod) {
                    return c
                        ? function () {
                            return c.call(that, tgt, override, nativeMethod);
                        }
                        : function () {
                            return nativeMethod.apply(tgt, arguments);
                        };
                } (obj, target, callback, nativeProto[override]));
            }
        }

        return obj;
    }

    function noop() {
        return function () { };
    }

    function wrap(func, wrapper) {
        return function () {
            var args = [func];
            push.apply(args, arguments);
            return wrapper.apply(this, args);
        };
    }
    
    // Extend our base object with our public methods
    global.mdsol = mdsol = {
        clone: clone,

        each: each,

        error: error,

        exists: exists,

        extend: extend,

        getType: getType,

        getValue: getValue,

        isArray: isArray,

        isDate: isDate,

        isEmpty: isEmpty,

        isFunction: isFunction,

        isNumeric: isNumeric,

        isObject: isObject,

        isOwn: isOwn,

        isPlainObject: isPlainObject,

        isString: isString,

        keys: keys,

        makeArray: makeArray,

        merge: merge,

        noop: noop,

        now: now,
        
        proxy: proxy,

        toArray: toArray,

        values: values,

        wrap: wrap
    };

// @DONE (2013-09-17 11:03)

    var BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    
    /*
    * Encodes the specified string to Base 64.
    */
    function base64Encode(input) {
        var output = '',
            chr1, chr2, chr3,
            enc1, enc2, enc3,
            enc4, i = 0;

        input = global.escape(input);

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                    BASE64.charAt(enc1) +
                    BASE64.charAt(enc2) +
                    BASE64.charAt(enc3) +
                    BASE64.charAt(enc4);

        } while (i < input.length);

        return output;
    }

    /*
    * Decodes the specified Base 64 string.
    */
    function base64Decode(input) {
        var fromCharCode = ''.fromCharCode,
            output = '',
            chr1, chr2, chr3,
            enc1, enc2, enc3,
            enc4, i = 0;

        // Verify the input only contains valid characters
        if (/[^A-Za-z0-9\+\/\=]/g.exec(input)) {
            return null;
        }

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

        do {
            enc1 = BASE64.indexOf(input.charAt(i++));
            enc2 = BASE64.indexOf(input.charAt(i++));
            enc3 = BASE64.indexOf(input.charAt(i++));
            enc4 = BASE64.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + fromCharCode(chr1);

            if (enc3 !== 64) {
                output = output + fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + fromCharCode(chr3);
            }
        } while (i < input.length);

        return global.unescape(output);
    }

    extend(mdsol, {
        base64Encode: base64Encode,

        base64Decode: base64Decode
    });

// @DONE (2013-09-23 18:52)

    function getCookie(name) {
        var cookies = global.document.cookie.split(';')
                .map(
                    function (x) { return x.trim().split(/(=)/); })
                .reduce(
                    function (a, b) {
                        a[b[0]] = a[b[0]] ? a[b[0]] + ', ' + b.slice(2).join('') : b.slice(2).join('');
                        return a;
                    }, {});

        return cookies[name];
    }

    function setCookie(name, value, domain, expiration) {
        global.document.cookie = name + '=' + value
                + (expiration ? '; expires=' + expiration : '')
                + (domain ? '; domain=' + domain : '')
                + '; path=/';

        return mdsol;
    }

    function deleteCookie(name) {
        global.document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

        return mdsol;
    }

    extend(mdsol, {
        getCookie: getCookie,

        setCookie: setCookie,

        deleteCookie: deleteCookie
    });

// @DONE (2013-09-12 18:25)

    var parseJson = (function () {
        /*
        * https://github.com/douglascrockford/JSON-js/blob/master/json_parse_state.js
        */

        var _state,
            _stack,
            _container,
            _key,
            _value,
            _escapes = {
                '\\': '\\',
                '"': '"',
                '/': '/',
                't': '\t',
                'n': '\n',
                'r': '\r',
                'f': '\f',
                'b': '\b'
            },
            _string = {
                go: function () {
                    _state = 'ok';
                },
                firstokey: function () {
                    _key = _value;
                    _state = 'colon';
                },
                okey: function () {
                    _key = _value;
                    _state = 'colon';
                },
                ovalue: function () {
                    _state = 'ocomma';
                },
                firstavalue: function () {
                    _state = 'acomma';
                },
                avalue: function () {
                    _state = 'acomma';
                }
            },
            _number = {
                go: function () {
                    _state = 'ok';
                },
                ovalue: function () {
                    _state = 'ocomma';
                },
                firstavalue: function () {
                    _state = 'acomma';
                },
                avalue: function () {
                    _state = 'acomma';
                }
            },
            _action = {
                '{': {
                    go: function () {
                        _stack.push({ state: 'ok' });
                        _container = {};
                        _state = 'firstokey';
                    },
                    ovalue: function () {
                        _stack.push({ container: _container, state: 'ocomma', key: _key });
                        _container = {};
                        _state = 'firstokey';
                    },
                    firstavalue: function () {
                        _stack.push({ container: _container, state: 'acomma' });
                        _container = {};
                        _state = 'firstokey';
                    },
                    avalue: function () {
                        _stack.push({ container: _container, state: 'acomma' });
                        _container = {};
                        _state = 'firstokey';
                    }
                },
                '}': {
                    firstokey: function () {
                        var pop = _stack.pop();
                        _value = _container;
                        _container = pop.container;
                        _key = pop.key;
                        _state = pop.state;
                    },
                    ocomma: function () {
                        var pop = _stack.pop();
                        _container[_key] = _value;
                        _value = _container;
                        _container = pop.container;
                        _key = pop.key;
                        _state = pop.state;
                    }
                },
                '[': {
                    go: function () {
                        _stack.push({ state: 'ok' });
                        _container = [];
                        _state = 'firstavalue';
                    },
                    ovalue: function () {
                        _stack.push({ container: _container, state: 'ocomma', key: _key });
                        _container = [];
                        _state = 'firstavalue';
                    },
                    firstavalue: function () {
                        _stack.push({ container: _container, state: 'acomma' });
                        _container = [];
                        _state = 'firstavalue';
                    },
                    avalue: function () {
                        _stack.push({ container: _container, state: 'acomma' });
                        _container = [];
                        _state = 'firstavalue';
                    }
                },
                ']': {
                    firstavalue: function () {
                        var pop = _stack.pop();
                        _value = _container;
                        _container = pop.container;
                        _key = pop.key;
                        _state = pop.state;
                    },
                    acomma: function () {
                        var pop = _stack.pop();
                        _container.push(_value);
                        _value = _container;
                        _container = pop.container;
                        _key = pop.key;
                        _state = pop.state;
                    }
                },
                ':': {
                    colon: function () {
                        if (Object.hasOwnProperty.call(_container, _key)) {
                            throw new SyntaxError('Duplicate key "' + _key + '"');
                        }
                        _state = 'ovalue';
                    }
                },
                ',': {
                    ocomma: function () {
                        _container[_key] = _value;
                        _state = 'okey';
                    },
                    acomma: function () {
                        _container.push(_value);
                        _state = 'avalue';
                    }
                },
                'true': {
                    go: function () {
                        _value = true;
                        _state = 'ok';
                    },
                    ovalue: function () {
                        _value = true;
                        _state = 'ocomma';
                    },
                    firstavalue: function () {
                        _value = true;
                        _state = 'acomma';
                    },
                    avalue: function () {
                        _value = true;
                        _state = 'acomma';
                    }
                },
                'false': {
                    go: function () {
                        _value = false;
                        _state = 'ok';
                    },
                    ovalue: function () {
                        _value = false;
                        _state = 'ocomma';
                    },
                    firstavalue: function () {
                        _value = false;
                        _state = 'acomma';
                    },
                    avalue: function () {
                        _value = false;
                        _state = 'acomma';
                    }
                },
                'null': {
                    go: function () {
                        _value = null;
                        _state = 'ok';
                    },
                    ovalue: function () {
                        _value = null;
                        _state = 'ocomma';
                    },
                    firstavalue: function () {
                        _value = null;
                        _state = 'acomma';
                    },
                    avalue: function () {
                        _value = null;
                        _state = 'acomma';
                    }
                }
            };

        function debackslashify(text) {
            // Remove and replace any backslash escapement.

            return text.replace(/\\(?:u(.{4})|([^u]))/g, function (a, b, c) {
                return b ? String.fromCharCode(parseInt(b, 16)) : _escapes[c];
            });
        }

        return function (source, reviver) {
            var r,
                tx = /^[\x20\t\n\r]*(?:([,:\[\]{}]|true|false|null)|(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|"((?:[^\r\n\t\\\"]|\\(?:["\\\/trnfb]|u[0-9a-fA-F]{4}))*)")/;

            _state = 'go';
            _stack = [];

            try {
                for (; ; ) {
                    r = tx.exec(source);
                    if (!r) {
                        break;
                    }

                    if (r[1]) {
                        _action[r[1]][_state]();
                    } else if (r[2]) {
                        _value = +r[2];
                        _number[_state]();
                    } else {
                        _value = debackslashify(r[3]);
                        _string[_state]();
                    }

                    source = source.slice(r[0].length);
                }

            } catch (e) {
                _state = e;
            }

            if (_state !== 'ok' || /[^\x20\t\n\r]/.test(source)) {
                throw _state instanceof SyntaxError ? _state : new SyntaxError('JSON');
            }

            return typeof reviver === 'function' ? (function walk(holder, key) {
                var k, v, value = holder[key];

                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            } ({ '': _value }, '')) : _value;
        };
    } ());

    var toJson = (function () {
        /*
        * Derived from https://github.com/douglascrockford/JSON-js/blob/master/json2.js
        */

        var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap = '',
            indent = '',
            meta = {
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            },
            rep;

        function fmtDigit(n) {
            return n < 10 ? '0' + n : n;
        }

        function quote(string) {
            escapable.lastIndex = 0;

            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];

                return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }

        function str(key, holder) {
            var i, k, v,
                length,
                partial,
                mind = gap,
                value = holder[key];

            if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

            switch (typeof value) {
                case 'string':
                    return quote(value);

                case 'number':
                    return isFinite(value) ? String(value) : 'null';

                case 'boolean':
                case 'null':
                    return String(value);

                case 'object':
                    if (!value) {
                        return 'null';
                    }

                    gap += indent;
                    partial = [];

                    if (isString(value)) {
                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }

                        v = partial.length === 0
                            ? '[]'
                            : gap
                                ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                                : '[' + partial.join(',') + ']';

                        gap = mind;

                        return v;
                    }

                    if (rep && typeof rep === 'object') {
                        length = rep.length;

                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === 'string') {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {
                        for (k in value) {
                            if (hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }

                    v = partial.length === 0
                        ? '{}'
                        : gap
                            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                            : '{' + partial.join(',') + '}';

                    gap = mind;
                    return v;
            }

            throw TypeError('Unsupported object type');
        }

        if (!isFunction(Date.prototype.toJSON)) {
            Date.prototype.toJSON = function () {
                return isFinite(this.valueOf())
                    ? this.getUTCFullYear() + '-' +
                        fmtDigit(this.getUTCMonth() + 1) + '-' +
                        fmtDigit(this.getUTCDate()) + 'T' +
                        fmtDigit(this.getUTCHours()) + ':' +
                        fmtDigit(this.getUTCMinutes()) + ':' +
                        fmtDigit(this.getUTCSeconds()) + 'Z'
                    : null;
            };

            String.prototype.toJSON =
            Number.prototype.toJSON =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
        }

        return function(value) {
            return str('', { '': value });
        };
    } ());
    
    extend(mdsol, {
        parseJson: parseJson,

        toJson: toJson
    });

    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        function sha1Ft(t, b, c, d) {
            if (t < 20) {
                return (b & c) | ((~b) & d);
            }
            if (t < 40) {
                return b ^ c ^ d;
            }
            if (t < 60) {
                return (b & c) | (b & d) | (c & d);
            }
            return b ^ c ^ d;
        }

        function sha1Kt(t) {
            return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
        }

        function bitRol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        function str2RstrUtf8(input) {
            var output = '',
                i = -1,
                x,
                y;

            while (++i < input.length) {
                /* Decode utf-16 surrogate pairs */
                x = input.charCodeAt(i);
                y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
                
                if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                    x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                    i++;
                }

                /* Encode output as utf-8 */
                if (x <= 0x7F) {
                    output += String.fromCharCode(x);
                } else if (x <= 0x7FF) {
                    output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
                    0x80 | (x & 0x3F));
                } else if (x <= 0xFFFF) {
                    output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                    0x80 | ((x >>> 6) & 0x3F),
                    0x80 | (x & 0x3F));
                } else if (x <= 0x1FFFFF) {
                    output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                    0x80 | ((x >>> 12) & 0x3F),
                    0x80 | ((x >>> 6) & 0x3F),
                    0x80 | (x & 0x3F));
                }
            }

            return output;
        }

        function binb2Rstr(input) {
            var output = '',
                i;

            for (i = 0; i < input.length * 32; i += 8) {
                output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
            }

            return output;
        }
        
        function safeAdd(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
                msw = (x >> 16) + (y >> 16) + (lsw >> 16);

            return (msw << 16) | (lsw & 0xFFFF);
        }

        function binbSha1(x, len) {
            var w = [],
                a = 1732584193,
                b = -271733879,
                c = -1732584194,
                d = 271733878,
                e = -1009589776,
                i, j, t,
                olda, oldb, oldc,
                oldd, olde;

            x[len >> 5] |= 0x80 << (24 - len % 32);
            x[((len + 64 >> 9) << 4) + 15] = len;

            for (i = 0; i < x.length; i += 16) {
                olda = a;
                oldb = b;
                oldc = c;
                oldd = d;
                olde = e;

                for (j = 0; j < 80; j++) {
                    if (j < 16) {
                        w[j] = x[i + j];
                    } else {
                        w[j] = bitRol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                    }

                    t = safeAdd(safeAdd(bitRol(a, 5), sha1Ft(j, b, c, d)), safeAdd(safeAdd(e, w[j]), sha1Kt(j)));
                    e = d;
                    d = c;
                    c = bitRol(b, 30);
                    b = a;
                    a = t;
                }

                a = safeAdd(a, olda);
                b = safeAdd(b, oldb);
                c = safeAdd(c, oldc);
                d = safeAdd(d, oldd);
                e = safeAdd(e, olde);
            }

            return [a, b, c, d, e];
        }

        function rstr2Binb(input) {
            var output = [],
                i;

            output.length = input.length >> 2;
            for (i = 0; i < output.length; i++) {
                output[i] = 0;
            }

            for (i = 0; i < input.length * 8; i += 8) {
                output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (24 - i % 32);
            }

            return output;
        }

        function rstrSha1(s) {
            return binb2Rstr(binbSha1(rstr2Binb(s), s.length * 8));
        }

        function rstrHmacSha1(key, data) {
            var bkey = rstr2Binb(key),
                hash,
                ipad = [],
                opad = [],
                i;

            if (bkey.length > 16) {
                bkey = binbSha1(bkey, key.length * 8);
            }

            for (i = 0; i < 16; i++) {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }

            hash = binbSha1(ipad.concat(rstr2Binb(data)), 512 + data.length * 8);

            return binb2Rstr(binbSha1(opad.concat(hash), 512 + 160));
        }

        function rstr2Hex(input) {
            var hexTab = '0123456789ABCDEF',
                output = '',
                x,
                i;

            for (i = 0; i < input.length; i++) {
                x = input.charCodeAt(i);
                output += hexTab.charAt((x >>> 4) & 0x0F) + hexTab.charAt(x & 0x0F);
            }
            return output;
        }

        extend(mdsol, {
            sha1: function (data) {
                return rstr2Hex(rstrSha1(str2RstrUtf8(data)));
            },

            hmacSha1: function (key, data) {
                return rstr2Hex(rstrHmacSha1(str2RstrUtf8(key), str2RstrUtf8(data)));
            }
        });
    } ());

// @DONE (2013-09-17 10:24)
var trim = (function () {
        var trim = natives['[object String]'].trim;

        /*
        * Browser support for native implementation of `String.prototype.trim`:
        *
        * Chrome:             (all)
        * Firefox (Gecko):    3.5
        * Internet Explorer:  9
        * Opera:              10.5
        * Safari:             5
        *
        * Use native method if it exists and can support unicode; otherwise,
        * shim it.
        */
        return trim && !trim.call('\uFEFF\xA0') ?
            function (text) {
                return !text ? '' : trim.call(text);
            } :
            function (text) {
                return !text ? '' : (text + '')
                    .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            };
    } ());

// @DONE (2013-09-23 18:25)

    /*
    * Removes non alpha-numeric values from the specified string.
    */
    function alphaNumeric(value) {
        return isString(value) ? value.replace(/\W/gi, '') : null;
    }

    extend(mdsol, {
        alphaNumeric: alphaNumeric,

        trim: trim
    });

    mdsol.Class = (function () {
        var _funcTest = /xyz/.test(function () { var xyz = 0; return xyz; }) ? /\bbase\b/ : /.*/,
            _isInstance = function (obj) {
                return isObject(obj) && !isPlainObject(obj);
            },
            _namespace = function (identifier, objects) {
                var ns = global, parts, i, item;

                if (identifier !== '') {
                    parts = identifier.split('.');
                    for (i = 0; i < parts.length; i++) {
                        if (!ns[parts[i]]) {
                            ns[parts[i]] = {};
                        }

                        ns = ns[parts[i]];
                    }
                }

                for (item in objects || {}) {
                    if (objects.hasOwnProperty(item)) {
                        ns[item] = objects[item];
                    }
                }

                return ns;
            },
            _wrappedSub = function (that, superFunc, subFunc) {
                return (function (t, sup, sub) {
                    return function () {
                        var ret,
                            tmp = t.base;

                        t.base = sup;
                        ret = sub.apply(t, arguments);
                        t.base = tmp;

                        return ret;
                    };
                })(that, superFunc, subFunc);
            },
            _inherits = function (child, parent) {
                var _super;

                if (_isInstance(child)) {
                    throw new Error('An already instantiated object cannot inherit from another object.');
                } else if (!parent || !isFunction(parent)) {
                    throw new Error('Invalid base constructor.');
                }

                _super = parent.prototype;
                child.prototype = extend(Object.create(_super), child.prototype, {
                    constructor: child,

                    base: (function (sup) {
                        return function () {
                            var p, m, s;

                            // For each method on the subclass which calls the superclass, provide
                            // a wrapped function which exposes a direct reference to the superclass
                            // function within its execution context.
                            for (p in this) {
                                m = this[p];
                                s = sup[p];

                                if (isFunction(m) && isFunction(s) && _funcTest.test(m)) {
                                    this[p] = _wrappedSub(this, s, m);
                                }
                            }

                            // Call the superclass constructor
                            sup.constructor.apply(this, arguments);

                            return this;
                        };
                    } (_super))
                });

                return child;
            },
            _implement = function (objects, target) {
                var objs = toArray(objects),
                    i, len, item, m;

                for (i = 0, len = objs.length; i < len; i++) {
                    item = objs[i];
                    if (isString(item)) {
                        item = mdsol.abstract[item];
                        if (!item) {
                            throw new Error('Unknown abstract object: "' + objs[i] + '"');
                        }
                        debugger;
                        // Copy the properties from the object to the target only if
                        // the target doesn't have an Own property of the same name
                        item = Object.create(item);
                        for (m in item) {
                            if (item.hasOwnProperty(m) && !target.hasOwnProperty(m)) {
                                target[m] = item[m];
                            }
                        }
                    }
                }

                return target;
            };

        function Class(obj, proto) {
            if (!(this instanceof Class)) {
                return new Class(obj, proto);
            }

            var _class = obj,
                _instance = _isInstance(_class);

            function inherits(parent) {
                _inherits(_class, parent);

                return this;
            }

            function implement(objects) {
                _implement(objects, _instance ? _class : _class.prototype);

                return this;
            }

            function valueOf() {
                return _class;
            }

            if (!_instance && !isFunction(_class)) {
                throw new Error('Class object must be a constructor or an instance.');
            } else if (proto !== undefined && !isPlainObject(proto)) {
                throw new Error('Prototype must be an object literal.');
            }

            if (proto) {
                extend(true, _instance ? obj : obj.prototype, proto);
            }

            return extend(this, {
                inherits: inherits,

                implement: implement,

                valueOf: valueOf
            });
        };

        return extend(Class, {
            inherits: _inherits,

            implement: _implement,

            namespace: _namespace
        });
    } ());

/* @DONE: 2013-09-23 07:26 */

    mdsol.BitFlags = (function () {
        var _flagValue = function (flag) {
                /* @flag = name | value */
                var value, f;

                if (isString(flag)) {
                    // Verify the flag name exists
                    f = this._flags[flag];
                    value = f !== undefined ? f : null;
                } else if (isNumeric(flag)) {
                    // Verify value is a possible valid combination of flags
                    value = ((flag & this._entropy) === flag) ? flag : null;
                } else {
                    // Invalid data type
                    value = null;
                }

                if (value === null) {
                    throw new Error('Invalid bit flag value');
                }

                return value;
            },
            _test = function (any, flags) {
                /* @flags = [nameA[, nameB[, ...]]] | [valueA[, valueB[, ...]]] */
                var f, i, match = !any;

                for (i = flags.length; i--; ) {
                    f = this._flagValue(flags[i]);

                    // Test if the flag is set
                    if (!match || !any) {
                        if ((f & this._value) === f) {
                            if (any) {
                                match = true;
                            }
                        } else if (!any) {
                            match = false;
                        }
                    }
                }

                return match;
            },
            _bitFlags = function (flags) {
                /* @flags = [nameA[, nameB[, ...]]] | [valueA[, valueB[, ...]]] */
                var i, value = 0;

                // Combine flag(s) to set
                for (i = flags.length; i--; ) {
                    value = value | this._flagValue(flags[i]);
                }

                return value;
            },
            _value = function () {
                if (arguments.length) {
                    this._value = this._bitFlags(slice.call(arguments));
                }

                return this._value;
            };

        function equals() {
            return this._value === this._bitFlags(slice.call(arguments));
        }

        function test() {
            return this._test(false, slice.call(arguments));
        }

        function testAny() {
            return this._test(true, slice.call(arguments));
        }

        function toString() {
            var names = [],
                f = this._flags,
                p;

            // Create array of flag names which are currently set
            for (p in f) {
                if (f.hasOwnProperty(p) && this._test(true, p)) {
                    names.push(p);
                }
            }

            return names.toString();
        }

        function valueOf() {
            return this._flags;
        }

        function BitFlags(flagsObject, initValue) {
            if (!(this instanceof BitFlags)) {
                return new BitFlags(flagsObject, initValue);
            }

            function getMaxValue(flags) {
                var f, all = 0;

                // Get combined value of all flags
                for (f in flags) {
                    if (flags.hasOwnProperty(f) && !isNumeric(flags[f])) {
                        all = 0;
                        break;
                    }

                    all = all | flags[f];
                }

                if (!all) {
                    throw new Error('Invalid bit flag object');
                }

                return all;
            }

            // Value must be set after extend()
            // _bitFlags() is dependand on this._flags already existing
            return extend(this, {
                _entropy: getMaxValue(flagsObject),
                
                _flags: clone(flagsObject)
            }).value(initValue !== undefined ? toArray(initValue) : 0);
        }

        return mdsol.Class(BitFlags, {
            _flagValue: _flagValue,

            _test: _test,

            _bitFlags: _bitFlags,

            equals: equals,

            test: test,

            testAny: testAny,

            toString: toString,

            value: _value,

            valueOf: valueOf
        }).valueOf();
    } ());

/* @DONE: 2013-09-23 07:26 */

    mdsol.Enum = (function () {
        var _enumValue = function(v) {
                if (v === null) {
                    return null;
                } else if (isNumeric(v) && this._enum[v] !== undefined) {
                    // Verify it is a valid enum name (see: http://jsperf.com/hasownproperty-vs-in-vs-other/)
                    return _enum[v];
                } else if (isNumeric(v) && this._all.indexOf(v) !== -1) {
                    // Verify it is a valid enum value
                    return v;
                }

                throw new Error('Invalid enum value');
            },
            _value = function(value) {
                if (arguments.length) {
                    this._value = this._enumValue(value);
                }

                return this._value;
            };

        function test(value) {
            return this._value === this._enumValue(value);
        }

        function toString() {
            var e = this._enum, p;

            for (p in e) {
                if (e.hasOwnProperty(p) && e[p] === _value) {
                    return p;
                }
            }

            return null;
        }

        function valueOf() {
            return this._enum;
        }
        
        function Enum(enumObj, initValue) {
            if (!(this instanceof Enum)) {
                return new Enum(enumObj, initValue);
            }

            function getValues(o) {
                var values = [], p;

                for (p in o) {
                    if (o.hasOwnProperty(p) && !isNumeric(o[p])) {
                        values = [];
                        break;
                    }

                    values.push(o[p]);
                }

                if (!values.length) {
                    throw new Error('Invalid enum object');
                }

                return values;
            }

            // Value must be set after extend()
            // _enumValue() is dependand on this._enum already existing
            return extend(this, {
                _all: getValues(enumObj),

                _enum: clone(enumObj),
                
                _value: null
            }).value(initValue !== undefined ? initValue : null);
        }

        return mdsol.Class(Enum, {
            _enumValue: _enumValue,
            
            test: test,
            
            toString: toString,
            
            value: _value, 
            
            valueOf: valueOf
        }).valueOf();
    }());

    mdsol.ObjectArray = (function () {
        var ARRAY_METHODS = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'slice'],
            _softIndexOf = function (arr, value) {
                /*
                * Return the index of the first match for `value` within the
                * array. Strict comparison is not used.
                */
                var i, len;
                
                for (i = 0, len = arr.length; i < len; i++) {
                    if (arr[i] == value) {
                        return i;
                    }
                }

                return -1;
            },
            _getProperty = function(obj, identifier) {
                var a = identifier.split('.'),
                    item = obj,
                    i, len;

                for (i = 0, len = a.length; i < len && item; i++) {
                    item = a[i] in item ? item[a[i]] : undefined;
                }

                return item;
            },
            _filterItems = function(inclusive, prop/*, varValue*/) {
                var args = slice.call(arguments, 2),
                    exclude = !inclusive,
                    baseArray = this._array,
                    values,
                    v, i;

                values = isArray(args[0]) ? args[0] : toArray(args);

                for (i = baseArray.length; i--;) {
                    v = _getProperty(baseArray[i], prop);

                    if (!!(exclude ^ !(v !== undefined && _softIndexOf(values, v) !== -1))) {
                        baseArray.splice(i, 1);
                    }
                }

                return this;
            },
            _getAll = function(inclusive, prop/*, varValue */) {
                var args = slice.call(arguments, 2),
                    baseArray = this._array,
                    exclude = !inclusive,
                    values,
                    result = [],
                    item, v, i;

                values = isArray(args[0]) ? args[0] : toArray(args);

                for (i = baseArray.length; i--;) {
                    item = baseArray[i];
                    v = _getProperty(item, prop);

                    if (!!(exclude ^ (v !== undefined && _softIndexOf(values, v) !== -1))) {
                        result.push(item);
                    }
                }

                return result;
            },
            _getUnique = function(/* varKey */) {
                var props = slice.call(arguments),
                    baseArray = this._array,
                    item, i, j,
                    exists,
                    result = [];

                for (i = baseArray.length; i--;) {
                    item = baseArray[i];

                    exists = result.some(function (e) {
                        for (j = props.length - 1, exists = false; j >= 0 && !exists; j--) {
                            exists = item[props[j]] === e[props[j]];
                        }

                        return exists;
                    });

                    if (!exists) {
                        result.push(item);
                    }
                }

                return result;
            },
            _value = function (value) {
                if (!arguments.length) {
                    // Returns the collection
                    return this._array;
                } else {
                    // Sets the collection
                    this._array = value;
                }

                return this;
            };

        function contains(key, value) {
            /*
            * Returns true if any objects in the collection match the key:value pair
            */
            var baseArray = this._array,
                i, exists = false;

            // Determine if at least on item with the property/value pair exists
            for (i = baseArray.length - 1; i >= 0 && !exists; i--) {
                exists = baseArray[i][key] == value;
            }

            return exists;
        }

        function filter(/*key, varValues*/) {
            /*
            * Filters the collection to exclude all objects matching the key and 
            * and any of the provided values
            */
            var args = [false];

            push.apply(args, arguments);

            return _filterItems.apply(this, args);
        }

        function get(key, value) {
            /*
            * Returns the first object in the collection which matches the key:value pair
            */
            
            var baseArray = this._array,
                i, item, v;

            for (i = baseArray.length; i--; ) {
                item = baseArray[i];
                v = _getProperty(item, key);

                if (value !== undefined && v == value) {
                    return item;
                }
            }

            return null;
        }

        function getAll(/* key, varValues */) {
            /*
            * Returns all objects in the collection which match the key and any of the 
            * provided values
            */
            
            var args = [true];

            push.apply(args, arguments);

            return _getAll.apply(this, args);
        }

        function getNot(/* key, varValues */) {
            /*
            * Returns all objects in the collection which do not match the key and any
            * of the provided values
            */
            
            var args = [false];

            push.apply(args, arguments);

            return _getAll.apply(this, args);
        }

        function move(srcIndex, dstIndex) {
            /*
            * Moves an item in the collection from one index to another
            */
            
            var baseArray = this._array,
                len = baseArray.length,
                k;

            if (dstIndex >= len) {
                k = dstIndex - len;
                while ((k--) + 1) {
                    baseArray.push(undefined);
                }
            }

            baseArray.splice(dstIndex, 0, baseArray.splice(srcIndex, 1)[0]);

            return this;
        }

        function getUnique(/* varKeys */) {
            return _getUnique.apply(this, arguments);
        }

        function indexOf(key, value) {
            /*
            * Returns the index in the collection of the first match for the key:value pair
            */
            
            var baseArray = this._array,
                i, len, item, v;

            for (i = 0, len = baseArray.length; i < len; i++) {
                item = baseArray[i];
                v = _getProperty(item, key);

                if (v !== undefined && v == value) {
                    return i;
                }
            }

            return -1;
        }

        function unique(/* varKeys */) {
            /*
            * Filters the collection to only contain objects which contain unique values
            * for any of the provided values
            */
            
            this._array = _getUnique.apply(this, arguments);

            return this;
        }
        
        function size(key, value) {
            var baseArray = this._array,
                i, len = 0;

            if (!arguments.length) {
                // Returns length of collection
                return baseArray.length;
            } else {
                // Returns number of objects in the collection matching the key:value pair
                for (i = baseArray.length; i--; ) {
                    if (_getProperty(baseArray[i], key) == value) {
                        len++;
                    }
                }

                return len;
            }
        }

        function pluck(key, uniqueFlag) {
            /*
            * Returns an array of values for each item in the collection matching the key
            * If unique is provided, only unique values will be returned.
            */
            
            var values = [],
                baseArray = this._array,
                i, v;

            for (i = baseArray.length; i--; ) {
                v = _getProperty(baseArray[i], key);

                if (v !== undefined && (!uniqueFlag || _softIndexOf(values, v) === -1)) {
                    values.push(v);
                }
            }

            return values;
        }

        function lastIndexOf(/*key, value*/) {
            /*
            * Returns the index in the collection of the last match for the key:value pair
            */
            
            // TODO: Implement
        }

        function where(/* key, varValues */) {
            /*
            * Filters the collection to only include objects matching the key and 
            * any of the provided values
            */
            
            var args = [true];

            push.apply(args, arguments);

            return _filterItems.apply(this, args);
        }

        function ObjectArray(value) {
            if (!(this instanceof ObjectArray)) {
                return new ObjectArray(value);
            }

            if (value && !isArray(value)) {
                throw new TypeError('Invalid data type for ObjectArray initialization value.');
            }

            // TODO: Consider implementing more robust type-checking
            // We're making a pretty big assumption at this point that every element in
            // `value` (if provided) is an object. On the other hand, to force type
            // checking every time an ObjectArray is created could produce significant 
            // wasteful overhead. Consider having type checking enabled by default and
            // having an optional flag which can disable this.

            this._array = value || [];

            return proxy(this, this._array, null, ARRAY_METHODS);
        }

        return mdsol.Class(ObjectArray, {
            contains: contains,

            filter: filter,

            get: get,

            getAll: getAll,

            getNot: getNot,

            getUnique: getUnique,

            indexOf: indexOf,

            lastIndexOf: lastIndexOf,

            move: move,

            pluck: pluck,

            size: size,

            unique: unique,

            value: _value,

            where: where
        }).valueOf();
    } ());

// @DONE (2013-09-17 11:06)

    /*
    * Use IIFE to prevent cluttering of globals
    *
    * NOTE: This module requires jQuery, however it should not be listed as an AMD module 
    *       dependency. Only build-time dependencies should be listed above.
    */
    (function () {
        var _$element,
            _requests = {},
            _uuid = 0,
            _contentTypeEnum = {
                JSON: 'application/json; charset=utf-8',
                TEXT: 'text/plain; charset=utf-8',
                HTML: 'text/html; charset=utf-8'
            };

        function container(value) {
            var $container;

            if (!arguments.length) {
                return _$element && _$element.parent();
            }

            // Destroy current element
            if (_$element) {
                _$element.remove();
                _$element = null;
            }

            // Locate new container element
            if (isString(value)) {
                $container = $(value);
            } else if (!value || (value && value.jquery)) {
                $container = value;
            }

            // Create new element and append to container
            if ($container) {
                _$element = $('<div id="ajax_progress"><img src="./images/ajax.gif" /><span>Please wait...</span></div>')
                    .hide()
                    .appendTo($container);
            }

            return mdsol;
        }

        function updateRequests(uuid, params) {
            if (arguments.length === 1) {
                delete _requests[uuid];
            } else {
                _requests[uuid] = params;
            }

            if (!isEmpty(_requests)) {
                // Create the 'please wait' display if it doesnt exist. This should only
                // happen the first time an ajax request is made.
                if (!_$element) {
                    container('body');
                }

                // Show 'waiting' display
                _$element.show();
                mdsol.ui.center(_$element);
            } else {
                // Hide 'waiting' display
                _$element.hide();
            }
        }

        function onAjaxSuccess(data/*, status, xhr*/) {
            var callback = this.callback;

            updateRequests(this.uuid);

            if (isFunction(callback)) {
                callback(true, data, this.userData, this);
            }
        }

        function onAjaxError(xhr/*, status, err*/) {
            var callback = this.callback;

            updateRequests(this.uuid);

            if (isFunction(callback)) {
                callback(false, xhr, this.userData, this);
            }
        }

        function jxhrRequest(uri, method, contentType, data, callback, userData) {
            var type = (contentType || 'html'),
                params = {
                    type: method,
                    url: uri,
                    data: data,
                    contentType: _contentTypeEnum[type.toUpperCase()],
                    cache: false,
                    dataType: type.toLowerCase(),
                    userData: userData,
                    uuid: _uuid,
                    callback: callback,
                    success: onAjaxSuccess,
                    error: onAjaxError
                };

            updateRequests(_uuid, params);
            _uuid++;

            $.ajax(params);

            return mdsol;
        }

        function post(uri, contentType, data, callback, userData) {
            return jxhrRequest(uri, 'POST', contentType, data, callback, userData);
        }

        function get(uri, contentType, data, callback, userData) {
            return jxhrRequest(uri, 'GET', contentType, data, callback, userData);
        }

        function dispose() {
            // TODO: Perform any cleanup

            container(null);

            return mdsol;
        }

        // Expose public members
        mdsol.Class.namespace('mdsol.ajax', {
            container: container,

            contentTypeEnum: _contentTypeEnum,

            post: post,

            get: get,

            dispose: dispose
        });
    } ());

    mdsol.Class.namespace('mdsol.abstract', {
        api: (function () {
            function apiGetMethod(name) {
                var methods = this._methods;
                
                if (!methods) {
                    this._methods = methods = {};
                }

                if (!methods.hasOwnProperty(name)) {
                    throw new Error('Unknown method: "' + name + '"');
                }

                return methods[name];
            }

            function apiMethods(value) {
                if (!arguments.length) {
                    return this._methods || {};
                }

                this._methods = value;

                return this;
            }

            return {
                apiMethods: apiMethods,

                apiGetMethod: apiGetMethod
            };
        } ())
    });

    mdsol.Class.namespace('mdsol.abstract', {
        options: (function() {
            function options() {
                var o = this._options,
                    setter = this._setOption,
                    key, value, p, ret;

                // If `_options` does not yet exist on object instance, create it
                if (!o) {
                    this._options = o = {};
                }
                
                if (arguments.length) {
                    key = arguments[0];
                    if (isString(key)) {
                        if (arguments.length > 1) {
                            value = arguments[1];

                            // If setter returns a value, use that for the value
                            ret = setter(key, value);
                            o[key] = (ret !== undefined) ? ret : value;
                        } else {
                            // Getter
                            if (o[key] !== undefined) {
                                return o[key];
                            } else {
                                throw new Error('Invalid option provided: "' + key + '"');
                            }
                        }
                    } else if (isObject(key)) {
                        // Setter - argument is object of key/value pairs
                        for (p in key) {
                            if (key.hasOwnProperty(p)) {
                                value = key[p];

                                // If no setter function or it returned false, set the value
                                if (setter) {
                                    ret = setter(key, value);
                                }

                                o[key] = (ret !== undefined) ? ret : value;
                            }
                        }
                    } else {
                        // Invalid arguments
                        throw new Error('Invalid arguments');
                    }
                } else {
                    // Getter - return all options
                    return o;
                }

                return this;
            }

            function defaults(values) {
                var ctr = this.constructor;

                if (!arguments.length) {
                    return ctr._options;
                }

                ctr.options = values;

                return this;
            }

            function initialize(values) {
                var defaultOpts = this.constructor._options || {};

                // Set the options to the default values, overriden
                // by the provided values
                this._options = merge(defaultOpts, values);

                return this;
            }

            function setOption(key, value) {
                // Default method - returns value to be set for key.
                // This method should be defined in the implementing object
                // to provide any special handling for verious keys.
                return value;
            }

            return {
                _setOption: setOption,

                options: extend(options, {
                    defaults: defaults,

                    initialize: initialize
                })
            };
        }())
    });

    mdsol.Class.namespace('mdsol.abstract', {
        control: (function() {
            function enable() {
                this.options('enabled', true);
            }

            function disable() {
                this.options('enabled', false);
            }

            function show() {
                this.options('visible', true);
            }

            function hide() {
                this.options('visible', false);
            }

            return mdsol.Class.implement('options', {
                enable: enable,

                disable: disable,

                show: show,

                hide: hide
            });
        }())
    });

    mdsol.Class.namespace('mdsol.abstract', {
        subscribable: (function () {
            function subscribe(msg, func, priority) {
                var m = this._messages;

                if (!isString(msg) || !isFunction(func)) {
                    throw new TypeError('Invalid data type for subscription message or callback');
                }

                if (!m) {
                    this._messages = m = {};
                }

                if (!m[msg]) {
                    m[msg] = [];
                }

                m[msg].push({ priority: priority || 0, callback: func });

                return this;
            }

            function unsubscribe(msg, func) {
                var m = this._messages,
                    i;

                if (!isString(msg) || (func && !isFunction(func))) {
                    throw new TypeError('Invalid data type for subscription message or callback');
                }

                if (!m) {
                    this._messages = m = {};
                }

                if (!m.hasOwnProperty(msg)) {
                    throw new Error('Message does not exist.');
                }

                if (!func) {
                    delete m[msg];
                } else {
                    m = m[msg];
                    for (i = m.length; i--; ) {
                        if (m[i].func === func) {
                            m.splice(i, 1);
                            break;
                        }
                    }
                }

                return this;
            }

            function publish(msg, data) {
                var m = this._messages,
                    subscribers,
                    msgData = data,
                    result,
                    s;

                if (!isString(msg)) {
                    throw new TypeError('Invalid data type for subscription message');
                }

                if (!m) {
                    this._messages = m = {};
                }

                // Sort the subscribers by priority
                subscribers = clone(m[msg])
                    .sort(function (a, b) {
                        return (a.priority > b.priority)
                            ? 1
                            : (a.priority < b.priority)
                                ? -1
                                : 0;
                    });

                // Notify each subscriber
                while (subscribers.length) {
                    s = subscribers.pop();

                    // If the subscriber returns a value, use that as `data` for the
                    // remaining subscribers.
                    result = s.func(msg, msgData);
                    if (result !== undefined) {
                        msgData = result;
                    }
                }

                return msgData;
            }

            return {
                subscribe: subscribe,

                unsubscribe: unsubscribe,

                publish: publish
            };
        } ())
    });

// @DONE (2013-09-17 12:22)

    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        function dispose() {
            return mdsol;
        }

        function center($element, parent) {
            var $p = parent ? $element.parent() : $(window);

            $element.css({
                'position': 'absolute',
                'top': (Math.max(((parent.height() - $element.outerHeight()) / 2) + $p.scrollTop(), 0) + 'px'),
                'left': (Math.max(((parent.width() - $element.outerWidth()) / 2) + $p.scrollLeft(), 0) + 'px')
            });

            return $element;
        }
        
        mdsol.Class.namespace('mdsol.ui', {
            center: center,
            
            dispose: dispose
        });
    } ());

    mdsol.ui.DialogBox = (function () {
        function DialogBox() {
            if (!(this instanceof DialogBox)) {
                return new DialogBox();
            }
            
            return this;
        }

        return DialogBox;
    } ());

    mdsol.ui.DialogPage = (function () {
        function DialogPage() {
            if (!(this instanceof DialogPage)) {
                return new DialogPage();
            }

            return this;
        }

        return DialogPage;
    } ());

    mdsol.ui.DialogSubpage = (function () {
        function DialogSubpage() {
            if (!(this instanceof DialogSubpage)) {
                return new DialogSubpage();
            }

            return this;
        }

        return DialogSubpage;
    } ());

    mdsol.ui.Dropdown = (function () {
        function Dropdown() {
            if (!(this instanceof Dropdown)) {
                return new Dropdown();
            }

            return this;
        }

        return Dropdown;
    } ());

    mdsol.ui.DropdownMenu = (function () {
        function DropdownMenu() {
            if (!(this instanceof DropdownMenu)) {
                return new DropdownMenu();
            }

            return this;
        }

        return DropdownMenu;
    } ());

    mdsol.ui.DropdownSelect = (function () {
        function DropdownSelect() {
            if (!(this instanceof DropdownSelect)) {
                return new DropdownSelect();
            }

            return this;
        }

        return DropdownSelect;
    } ());

    mdsol.ui.MessageBox = (function () {
        var _buttonEnum = {
            OK: 1
        };

        function MessageBox() {
            if (!(this instanceof MessageBox)) {
                return new MessageBox();
            }

            return this;
        }

        MessageBox.buttonEnum = _buttonEnum;

        return MessageBox;
    } ());

// @DONE (2013-09-17 11:11)

    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        var SESSION_SERVICE = 'Sessions',
            _method = mdsol.ajax.Method,
            _methods = {
                userLogout: _method(SESSION_SERVICE, 'UserLogout', 'session_id'),
                userLogin: _method(SESSION_SERVICE, 'UserLogin')
                    .params('username', 'password_hash'),
                resumeSession: _method(SESSION_SERVICE, 'ResumeSession')
                    .params('session_id', 'username'),
                guestLogin: _method(SESSION_SERVICE, 'GuestLogin'),
                getUserLoginToken: _method(SESSION_SERVICE, 'UserGetLoginToken', 'username'),
                getNextSaltValue: _method(SESSION_SERVICE, 'GetNextSaltValue')
            },
            _user = null;

        function getSessionCookie() {
            var value = mdsol.getCookie('metabaselogin'),
                cookie = null,
                raw, a;

            raw = value && mdsol.decodeBase64(value);
            if (raw) {
                a = raw.split('/');

                try {
                    cookie = {
                        username: a[0],
                        session_id: a[1],
                        expires: new Date(parseInt(a[2], 10))
                    };
                } catch (e) {
                    cookie = null;
                }
            }

            return cookie;
        };

        function initialize() {
            var cookie;

            // 1. Check for presence of login cookie
            cookie = getSessionCookie();
            // 2. If the session stored in the cookie has not yet expired:
            if (cookie && cookie.username.length && cookie.username !== 'guest' && cookie.expires > now()) {
                // 2a. Attempt to resume the session.
                // 2a1. If successful, go to step 4 
            }

            /*
            3. Else, attempt to login as guest user.
            3a. If successful, go to step 4 
            3b. Else, if failure:
            3b1. Alert user the system is currently unavailable
            3b2. Terminate
            4. Create the new user session
            4a. Set the user information (see action F - SETTING USER INFORMATION)
            4b. Set the user access (see action D - SETTING USER ACCESS)
            5. Initialize the navigation bar
            6. Attempt to load the products
            7. Attempt to load the dialogs
            */
        }

        function login(username, password) {
            this.publish('beforeLogin', { username: username });

        }

        function logout() {
            this.publish('beforeLogout', { user: _user });

        }

        function isAdmin() {

        }

        function getUserData() {

        }

        function getDialogAccess() {

        }

        function getDataObjectAccess() {

        }

        function getSubDataObjectAccess() {

        }

        function dispose() {
            return mdsol;
        }

        function onTokenLoaded(success, data, xhrMethod) {
            var apiLogin;

            if (success && data && data.length) {

            } else {
                apiLogin = this.apiGetMethod('userLogin');
                
                _user.login_token = data[0].login_token;
                _user.salt = data[0].salt;
                _user.password = mdsol.sha1(_user.password + _user.salt);
                
                apiLogin.execute(onLogin, _user.username, mdsol.sha1(_user.password + _user.login_token));
            }
        }

        function onLogin(success, data, xhrMethod) {
            if (success) {
                // TODO: Implement

                this.publish('afterLogin', { _user: _user });
            } else {
                // TODO: Implement
            }
        }

        function onLogout(success, data, xhrMethod) {
            var username = _user.username;

            // TODO: Implement

            this.publish('afterLogout', { username: username });
        }

        var session = mdsol.Class.implement(['subscribable', 'api'], {
            initialize: initialize,

            login: login,

            logout: logout,

            isAdmin: isAdmin,

            getUserData: getUserData,

            getDialogAccess: getDialogAccess,

            getDataObjectAccess: getDataObjectAccess,

            getSubDataObjectAccess: getSubDataObjectAccess,

            dispose: dispose
        });

        session.apiMethods(_methods);

        // Expose public members
        mdsol.Class.namespace('mdsol.session', session);
    } ());

    /*
    * Use IIFE to prevent cluttering of globals
    *
    * NOTE: This module requires jQuery, however it should not be listed as an AMD module 
    *       dependency. Only build-time dependencies should be listed above.
    */
    (function () {
        function addMenu() {

        }

        function removeMenu() {

        }

        function getMenu() {

        }

        function dispose() {
            return mdsol;
        }

        mdsol.session.subscribe('afterLogout', onLogout);
        
        function onLogout() {
            // Reset all of the menus
        }
        
        // Expose public members
        mdsol.Class.namespace('mdsol.toolbar', {
            addMenu: addMenu,

            removeMenu: removeMenu,

            getMenu: getMenu,

            dispose: dispose
        });
    } ());

    mdsol.ajax.Method = (function () {
        var BASE_URL = 'http://dlcdkpcs1.ad.mdsol.com/api/Services/',
            _statusFlags = {
                NONE: 0,                // The method has not yet executed
                EXECUTING: 0x01,        // The method is currently executing
                COMPLETED: 0x02,        // The method has completed execution
                SUCCESS: 0x02 | 0x10,   // The method has completed successfully
                FAILED: 0x02 | 0x20     // The method has completed with errors
            };

        function service(value) {
            if (!arguments.length) {
                return this._service;
            }

            this._service = value;

            return this;
        }

        function method(value) {
            if (!arguments.length) {
                return this._method;
            }

            this._method = value;

            return this;
        }

        function params() {
            var value;

            if (!arguments.length) {
                return this._params;
            }

            if (arguments.length === 1) {
                value = arguments[0];
                value = value === null ? [] : toArray(value);
            } else {
                value = makeArray(arguments);
            }
            
            this._params = value;
            
            return this;
        }

        function callback(value) {
            if (!arguments.length) {
                return this._callback;
            }

            this._callback = isFunction(value) ? value : null;

            return this;
        }

        function execute(/*[callback, ][apiParamVal1][, apiParamVal2][, ...] */) {
            var a = makeArray(arguments),
                self = this,
                handler = this._callback,
                parameters = this._params,
                paramObj = {},
                uri, data,
                i, len;

            if (a.length && isFunction(a[0])) {
                handler = a.shift();
            }

            if (parameters.length !== a.length) {
                throw new Error('Invalid argument count for Method.');
            }

            for (i = 0, len = parameters.length; i < len; i++) {
                paramObj[parameters[i]] = a[i];
            }

            uri = BASE_URL + this._service + '.asmx/' + this._method;
            data = mdsol.toJson(paramObj);

            mdsol.ajax.post(uri, 'JSON', data, function () {
                return onCompleted.apply(self, arguments);
            }, handler);

            return this;
        }

        function dispose() {
            // Perform any cleanup
            return this;
        }

        function onCompleted(success, data, handler, xhr) {
            var error = null,
                buttonEnum = mdsol.ui.MessageBox.buttonEnum,
                msgboxOptions = {
                    buttons: buttonEnum.OK,
                    title: 'An error occured',
                    visible: true,
                    autoSize: true
                };

            this.status.value('COMPLETED', success ? 'SUCCESS' : 'FAILED');

            if (!success) {
                error = parseServerError(xhr, data);
            } else {
                try {
                    data = mdsol.parseJson(data.d);
                } catch (err) {
                    data = null;
                    success = false;
                    error = getExceptionError(xhr, err);
                }

                if (!success) {
                    msgboxOptions.autoSize = false;
                } else if (data && isArray(data) && data.length && data[0].error_time) {
                    error = parseServiceError(xhr, data);
                }

                if (isFunction(handler)) {
                    handler(success, data, this);
                }
            }

            if (error) {
                msgboxOptions.text = error;
                mdsol.ui.MessageBox(msgboxOptions);
            }
        }

        function errorLine(name, message, rawText) {
            var line = '<div><span style="width: 100px; display: inline-block; font-weight: bold;">' +
                name + '</span>';

            if (rawText) {
                return line + '</div><br /><pre>' + message + '</pre><br />';
            }

            return line + message + '</div>';
        }

        function parseServiceError(xhr, data) {
            var message = '',
                i, len, item;

            message += 'The following errors occured while proccessing a request:<br /><br />' +
                errorLine('URL:', xhr.url) + '<br />';

            for (i = 0, len = data.length; i < len; i++) {
                item = data[i];

                if (item.error_time && item.message) {
                    message += errorLine('Time:', item.error_time) + errorLine('Message:', item.message) + '<br />';
                }
            }

            return '<div style="text-align:left;padding-left: 5px;padding-right: 5px;">' + message + '</div>';
        }

        function parseServerError(xhr, data) {
            var message, a, b, item;

            message = '<div style="text-align:left;padding-left: 5px;padding-right: 5px;">' +
                data.statusText + '<br /><br />' +
                errorLine('URL:', xhr.url) + '<br />';

            try {
                if (data.responseText.substring(0, '<!DOCTYPE html>'.length) === '<!DOCTYPE html>') {
                    a = data.responseText.indexOf('<!--') + '<!--'.length;
                    b = data.responseText.indexOf('-->', a);
                    message += errorLine('Response:', data.responseText.substr(a, b), true);
                } else {
                    // TODO: Move away from the evil eval
                    data = eval('[' + data.responseText.replace(/\\r/g, '\\\\r').replace(/\\n/g, '\\\\n') + ']');

                    for (item in data[0]) {
                        if (data[0].hasOwnProperty(item)) {
                            a = data[0][item];
                            if (a.indexOf('\\r') !== -1 || a.indexOf('\\n') !== -1) {
                                a = a.replace(/\\r/g, '\r').replace(/\\n/g, '\n');
                                message += errorLine(item, a, true);
                            } else {
                                message += errorLine(item, a);
                            }
                        }
                    }
                }

                message += '<br /></div>';
            } catch (err) {
                message += errorLine('Response:', data);
            }

            return message;
        }

        function getExceptionError(xhr, error) {
            return '<div style="text-align:left;padding-left: 5px;padding-right: 5px;">' +
                'Failed to parse data from server!<br /><br />' +
                errorLine('URL:', xhr.url) + '<br />' +
                errorLine('Message:', error) + '<br /></div>';
        }

        function Method(serviceName, methodName, parameters) {
            if (!(this instanceof Method)) {
                return new Method(serviceName, methodName, parameters);
            }

            return extend(this, {
                _service: serviceName || null,

                _method: methodName || null,

                _params: toArray(parameters) || [],

                _callback: null,

                status: mdsol.BitFlags(_statusFlags, 'NONE')
            });
        }

        Method.statusFlags = _statusFlags;

        return mdsol.Class(Method, {
            service: service,

            method: method,

            params: params,

            callback: callback,

            execute: execute,

            dispose: dispose
        }).valueOf();
    } ());

    mdsol.ajax.RequestMethod = (function () {
        var DEFAULT_PARAMS = ['audit_info', 'field_filter'];

        function audit(value) {
            if (!arguments.length) {
                return this._audit;
            }

            this._audit = !!value;

            return this;
        }

        function fields(/* varArgs */) {
            var value;

            if (!arguments.length) {
                return this._fields;
            }

            if (arguments.length === 1) {
                value = arguments[0];
                value = value === null ? [] : toArray(value);
            } else {
                value = makeArray(arguments);
            }
            
            this._fields = value;
            
            return this;
        }

        function params() {
            var curParams, value,
                args;

            if (!arguments.length) {
                curParams = this.base();

                // Get params from base; exclude defaul parameters
                return curParams.filter(function (el/*, idx, arr*/) {
                    return DEFAULT_PARAMS.indexOf(el) === -1;
                });
            }

            if (arguments.length === 1) {
                value = arguments[0];
                args = value === null ? [] : toArray(value);
            } else {
                args = makeArray(arguments);
            }

            push.apply(args, DEFAULT_PARAMS);

            return this.base.apply(this, args);
        }

        function execute(/* [apiParamVal1][, apiParamVal2][, ...] */) {
            var args = makeArray(arguments);

            push.apply(args, [this._audit ? 'y' : 'n', this._fields.join(',')]);

            return this.base.apply(this, args);
        }

        function dispose() {
            // TODO: Implement
        }

        function RequestMethod(service, method, reqParams) {
            if (!(this instanceof RequestMethod)) {
                return new RequestMethod(service, method, reqParams);
            }

            return extend(this, {
                    _audit: false,

                    _fields: []
                })
                .base(service, method)
                .params(reqParams || []);
        }

        return mdsol.Class(RequestMethod, {
                audit: audit,

                fields: fields,

                params: params,

                execute: execute,

                dispose: dispose
            })
            .inherits(mdsol.ajax.Method)
            .valueOf();
    } ());

    mdsol.ajax.UpsertMethod = (function () {
        var DEFAULT_PARAMS = ['session_id', 'field_data'];

        function params() {
            var curParams, value,
                args;

            if (!arguments.length) {
                curParams = this.base();

                // Get params from base; exclude defaul parameters
                return curParams.filter(function (el/*, idx, arr*/) {
                    return DEFAULT_PARAMS.indexOf(el) === -1;
                });
            }

            if (arguments.length === 1) {
                value = arguments[0];
                args = value === null ? [] : toArray(value);
            } else {
                args = makeArray(arguments);
            }

            push.apply(args, DEFAULT_PARAMS);

            return this.base.apply(this, args);
        }

        function execute(/* [apiParamVal1][, apiParamVal2][, ...] */) {
            // TODO: Check that we are correctly referencing the session ID
            var token = mdsol.session.dbUser.session_id,
                fieldData = '',
                args = [];

            if (arguments.length && !isFunction(arguments[0])) {
                fieldData = arguments[0];
                push.apply(args, arguments);
            }

            push.apply(args, [token, fieldData]);

            return this.base.apply(this, args);
        }

        function UpsertMethod(service, method, upParams) {
            if (!(this instanceof UpsertMethod)) {
                return new UpsertMethod(service, method, upParams);
            }

            function dispose() {
                // Perform any cleanup
            }

            return extend(this, {
                dispose: dispose
            })
                .base(service, method)
                .params(upParams || []);
        }

        return mdsol.Class(UpsertMethod, {
            params: params,

            execute: execute
        })
            .inherits(mdsol.ajax.Method)
            .valueOf();
    } ());

    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        function dispose() {
            // TODO: Implement
        }
        
        // Expose public members
        mdsol.Class.namespace('mdsol.data', {
            dispose: dispose
        });
    } ());

    mdsol.data.DataTable = (function () {
        function load() {
            var method = this.apiGetMethod(this._loadMethod);

            if (method) {
                method.callback(onLoaded);

                if (!arguments.length) {
                    method.execute();
                } else {
                    method.execute.apply(method, arguments);
                }
            }

            return this;
        }

        function save() {
            var method = this.apiGetMethod(this._saveMethod);

            if (method) {
                method.callback(onSaved);

                if (!arguments.length) {
                    method.execute();
                } else {
                    method.execute.apply(method, arguments);
                }
            }

            return this;
        }

        function template(value) {
            if (!arguments.length) {
                return this._template;
            }

            this._template = value;

            return mdsol;
        }

        function onLoaded(success, data, xhrRequest) {
            var messageData = { success: success, data: data, canceled: false };

            messageData = this.publish('onLoaded', messageData);
            if (!messageData.canceled) {
                // TODO: Import the data

                this.publish('afterLoaded', messageData);
            }
        }

        function onSaved(success, data, xhrUpsert) {
            var messageData = { success: success, data: data, canceled: false };

            messageData = this.publish('onSaved', messageData);
            if (!messageData.canceled) {
                // TODO: Reconcile the data

                this.publish('afterSaved', messageData);
            }
        }

        function DataTable(dataTemplate, dataMethods, loadMethod, saveMethod) {
            if (!(this instanceof DataTable)) {
                return new DataTable(dataTemplate, dataMethods, loadMethod, saveMethod);
            }

            this.apiMethods(dataMethods);

            mdsol.session.subscribe('afterLogout', onLogout);

            function dispose() {

            }

            function onLogout() {
                // Reset all data
            }

            return extend(this, {
                _loadMethod: loadMethod,
                
                _saveMethod: saveMethod,
                
                _template: dataTemplate || {},
                
                template: template,

                dispose: dispose
            }).base();
        }

        return mdsol.Class(DataTable, {
                template: template,
            
                load: load,
            
                save: save
            })
            .implement('api')
            .inherits(mdsol.ObjectArray)
            .valueOf();
    } ());

    mdsol.data.clients = (function () {
        var SERVICE = 'Clients',
            TEMPLATE = {
                id: 0,
                name: '',
                abbreviation: null,
                internal: 'N',
                active: 'Y'
            },
            _methods = {
                getClients: mdsol.ajax.RequestMethod(SERVICE, 'GetClients')
                    .fields(keys(TEMPLATE)),
                upsertClients: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertClients')
            },
            clients = mdsol.data.DataTable(TEMPLATE, _methods, 'getClients', 'upsertClients');

        return mdsol.Class.implement('subscribable', clients);
    } ());

    mdsol.data.dialogs = (function () {
        var SERVICE = 'Dialogs',
            TEMPLATE = {
                id: 0,
                name: '',
                display: '',
                product_id: null,
                dropdown_accessable: 'N',
                req_product: 'N',
                req_client: 'N',
                req_environment: 'N',
                admin_only: 'N',
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _methods = {
                getDialogs: _request(SERVICE, 'GetDialogs')
                    .fields(keys(TEMPLATE)),
                getDialogsByProductId: _request(SERVICE, 'GetDialogsByProductId', 'product_id')
                    .fields(keys(TEMPLATE)),
                upsertDialogs: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertDialogs')
            },
            dialogs = mdsol.data.DataTable(TEMPLATE, _methods, 'getDialogs', 'upsertDialogs');

        return mdsol.Class.implement('subscribable', dialogs);
    } ());

    mdsol.data.fields = (function () {
        var SERVICE = 'Fields',
            TEMPLATE = {
                id: 0,
                table_id: 0,
                name: '',
                datatype_id: 0,
                key_type: null,
                nullable: 'N',
                default_value: null,
                comments: null,
                deprecated: 'N',
                mainstream: 'Y',
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _keyFields = [
                'id',
                'table_id', 
                'name',
                'key_type', 
                'active',
                'pk', 
                'fk'
            ],
            _maxFields = keys(TEMPLATE).concat('datatype_name'),
            _methods = {
                getKeyFieldsByTableIt: _request(SERVICE, 'GetKeyFieldsByTableId')
                    .params('site_id', 'table_ids')
                    .fields(_keyFields),
                getFieldsByTableId: _request('Fields', 'GetFieldsByTableId')
                    .params('site_id', 'table_ids')
                    .fields(_maxFields),
                getAllKeysByTableId: _request('ForeignKeys', 'GetAllKeysByTableId')
                    .params('site_id', 'table_id')
                    .fields(_maxFields),
                upsertFields: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertFields')
            },
            fields = mdsol.data.DataTable(TEMPLATE, _methods, 'getKeyFieldsByTableId', 'upsertFields');

        return mdsol.Class.implement('subscribable', fields);
    } ());

    mdsol.data.keys = (function () {
        var SERVICE = 'ForeignKeys',
            TEMPLATE = {
                id: 0,
                table_id: 0,
                field_id: 0,
                fk_table_id: 0,
                fk_field_id: 0,
                source_method_code: null,
                generic: 'N',
                mainstream: 'Y',
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _minFields = [
                'table_id',
                'field_id',
                'fk_table_id',
                'fk_field_id',
                'generic'
            ],
            _maxFields = keys(TEMPLATE).concat([
               'fk_table_name',
                'fk_field_name',
                'table_name',
                'field_name'
            ]),
            _methods = {
                getAllKeysBySiteId: _request(SERVICE, 'GetAllKeysBySiteId', 'site_id')
                    .fields(_minFields),
                getAllKeysByTableId: _request(SERVICE, 'GetAllKeysByTableId')
                    .params('site_id', 'table_id')
                    .fields(_maxFields),
                upsertKeys: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertKeys')
            },
            foreignKeys = mdsol.data.DataTable(TEMPLATE, _methods, 'getAllKeysBySiteId', 'upsertKeys');

        return mdsol.Class.implement('subscribable', foreignKeys);
    } ());

    mdsol.data.products = (function () {
        var SERVICE = 'Products',
            TEMPLATE = {
                id: 0,
                name: '',
                internal_client_id: null,
                enabled: 'Y',
                active: 'Y'
            },
            _methods = {
                getProducts: mdsol.ajax.RequestMethod(SERVICE, 'GetProducts')
                    .fields(keys(TEMPLATE)),
                upsertProducts: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertProducts')
            },
            products = mdsol.data.DataTable(TEMPLATE, _methods, 'getProducts', 'upsertProducts');

        return mdsol.Class.implement('subscribable', products);
    } ());

    mdsol.data.roleAcls = (function () {
        var SERVICE = 'Roles',
            TEMPLATE = {
                id: 0,
                role_id: 0,
                dialog: null,
                data_object: null,
                sub_data_object: null,
                gui_exposed: null,
                grant_create: null,
                grant_read: null,
                grant_update: null,
                grant_delete: null,
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _maxFields = keys(TEMPLATE).concat(['role_code', 'role_name']),
            _methods = {
                getRoleAcls: _request(SERVICE, 'GetRoleAcls')
                    .fields(_maxFields),
                getRoleAclsById: _request(SERVICE, 'GetRoleAclsById', 'role_id')
                    .fields(_maxFields),
                getRoleAclsByUsername: _request(SERVICE, 'GetRoleAclsByUsername', 'username')
                    .fields(_maxFields),
                upsertRoleAcls: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertRoleAcls')
            },
            roleAcls = mdsol.data.DataTable(TEMPLATE, _methods, 'getRoleAcls', 'upsertRoleAcls');

        return mdsol.Class.implement('subscribable', roleAcls);
    } ());

    mdsol.data.roles = (function () {
        var SERVICE = 'Roles',
            TEMPLATE = {
                id: 0,
                code: '',
                name: '',
                internal: 'N',
                active: 'Y'
            },
            _methods = {
                getRoles: mdsol.ajax.RequestMethod(SERVICE, 'GetRoles')
                    .fields(keys(TEMPLATE)),
                upsertRoles: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertRoles')
            },
            roles = mdsol.data.DataTable(TEMPLATE, _methods, 'getRoles', 'upsertRoles');

        return mdsol.Class.implement('subscribable', roles);
    } ());

    mdsol.data.serviceProperties = (function () {
        var SERVICE = 'ServiceProperties',
            TEMPLATE = {
                id: 0,
                service_id: 0,
                field_id: 0,
                site_id: 0,
                exposed: 'N',
                custom: 'N',
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _maxFields = [
                'id',
                'service_id',
                'field_id',
                'exposed',
                'custom',
                'active',
                'client_id',
                'client_name',
                'table_id',
                'table_name',
                'field_name',
                'service_name'
            ],
            _methods = {
                getServicesPropertiesBySiteId: _request(SERVICE, 'GetServicesPropertiesBySiteId', 'site_id')
                    .fields(_maxFields),
                getServicesPropertiesByTableId: _request(SERVICE, 'GetServicesPropertiesByTableId', 'table_id')
                    .fields(_maxFields),
                upsertServiceProperties: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertServiceProperties')
            },
            serviceProperties = mdsol.data.DataTable(TEMPLATE, _methods, 'getServicesPropertiesBySiteId', 'upsertServiceProperties');

        return mdsol.Class.implement('subscribable', serviceProperties);
    } ());

    mdsol.data.services = (function () {
        var SERVICE = 'Services',
            TEMPLATE = {
                id: 0,
                name: '',
                table_id: 0,
                description: null,
                file_location: null,
                mainstream: 'Y',
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod, 
            _maxFields = keys(TEMPLATE).concat('data_object'),
            _minFields = [
                'id',
                'name',
                'data_object'
            ],
            _serviceSitesFields = [
                'id',
                'site_id',
                'client_id',
                'client_name',
                'environment_code', 
                'environment_order',
                'active'
            ],
            _methods = {
                getServicesBySiteId: _request(SERVICE, 'GetServicesBySiteId', 'site_id')
                    .fields(_maxFields),
                getByDataObject: _request(SERVICE, 'GetServicesByDataObject')
                    .params('site_id', 'table_id')
                    .fields(_minFields),
                getServiceSites: _request(SERVICE, 'GetServiceSites')
                    .params('product_id', 'environment_code', 'environment_order')
                    .fields(_serviceSitesFields),
                upsertServices: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertServices')
            },
            services = mdsol.data.DataTable(TEMPLATE, _methods, 'getServicesBySiteId', 'upsertServices');

        return mdsol.Class.implement('subscribable', services);
    } ());

    mdsol.data.sites = (function () {
        var SERVICE = 'Sites',
            TEMPLATE = {
                id: 0,
                product_id: 0,
                client_id: 0,
                environment_code: '10',
                environment_order: 0,
                project: null,
                url: null,
                schema_version: null,
                database_name: null,
                import_profile_id: null,
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _upsert = mdsol.ajax.UpsertMethod,
            _minFields = [
                'id',
                'client_id', 
                'client_name', 
                'abbreviation', 
                'project', 
                'environment_code',
                'environment_order', 
                'product_id', 
                'environment'
            ],
            _serviceSitesFields = [
                'id', 
                'site_id', 
                'client_id', 
                'client_name',
                'environment', 
                'active'
            ],
            _maxFields = keys(TEMPLATE).concat('client_name', 'abbreviation', 'project'),
            _methods = {
                getSites: _request(SERVICE, 'GetSites')
                    .fields(_minFields),
                getSitesByProductId: _request(SERVICE, 'GetSitesByProductId', 'product_id')
                    .fields(_minFields),
                getSitesByEnvironment: _request(SERVICE, 'GetSitesByEnvironment')
                    .params('product_id', 'environment_code', 'environment_order')
                    .fields(_minFields),
                getUsageSitesByTableId: _request(SERVICE, 'GetUsageSitesByTableId')
                    .params('environment_code', 'environment_order', 'table_id'),
                getSitesByServiceId: _request(SERVICE, 'GetSitesByServiceId')
                    .params('environment_code', 'environment_order', 'service_id')
                    .fields(_serviceSitesFields),
                getSitesByClientId: _request(SERVICE, 'GetSitesByClientId', 'client_id')
                    .fields(_maxFields),
                encryptSiteCredentials: mdsol.ajax.Method(SERVICE, 'EncryptSiteCredentials')
                    .params('username', 'password'),
                upsertSites: _upsert(SERVICE, 'UpsertSites'),
                upsertServiceSites: _upsert(SERVICE, 'UpsertServiceSites')
            },
            sites = mdsol.data.DataTable(TEMPLATE, _methods, 'getSitesByProductId', 'upsertSites');

            return mdsol.Class.implement('subscribable', sites);
    } ());

    mdsol.data.tables = (function () {
        var SERVICE = 'Tables',
            TEMPLATE = {
                id: 0,
                product_id: 0,
                name: '',
                friendly_name: '',
                comments: '',
                mainstream: 'Y',
                active: 'Y'
            },
            _request = mdsol.ajax.RequestMethod,
            _minFields = [
                'id', 
                'name', 
                'friendly_name',
                'active'],
            _usageFields = [
                'client_id',
                'client_name',
                'client_abbreviation',
                'site_id',
                'product_id',
                'environment_display',
                'environment_order',
                'table_id',
                'table_name', 
                'rows'],
            _methods = {
                getTablesBySiteId: _request(SERVICE, 'GetTablesBySiteId', 'site_id')
                    .fields(_minFields),
                getTablesByProductId: _request(SERVICE, 'GetTablesByProductId', 'product_id')
                    .fields(_minFields),
                getTableUsage: _request(SERVICE, 'GetTableUsage')
                    .params('site_id', 'environment_display', 'table_id')
                    .fields(_usageFields),
                upsertTables: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertTables')
            },
            tables = mdsol.data.DataTable(TEMPLATE, _methods, 'getTablesBySiteId', 'upsertTables');

        return mdsol.Class.implement('subscribable', tables);
    } ());

    mdsol.data.users = (function () {
        var SERVICE = 'Users',
            TEMPLATE = {
                id: 0,
                first_name: '',
                last_name: '',
                admin: 'N',
                role_id: 0,
                username: '',
                password: null,
                salt: null,
                locked: 'N',
                login_attempts: 0,
                login_count: 0,
                last_login_date: null,
                last_logout_date: null,
                last_login_attempt: null,
                login_token: null,
                session_id: null,
                uuid: null,
                active: 'Y'
            },
            _maxFields = keys(TEMPLATE).concat('role_code', 'role_name'),
            _methods = {
                getUsers: mdsol.ajax.RequestMethod(SERVICE, 'GetUsers').fields(_maxFields),
                upsertUsers: mdsol.ajax.UpsertMethod(SERVICE, 'UpsertUsers'),
            },
            users = mdsol.data.DataTable(TEMPLATE, _methods, 'getUser', 'upsertUsers');

        return mdsol.Class.implement('subscribable', users);
    } ());

// @DONE (2013-09-17 11:11)

    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        function clear() {
            return mdsol;
        }
        
        function dispose() {
            return mdsol;
        }

        mdsol.Class.namespace('mdsol.schema', {
            clear: clear,

            dispose: dispose
        });
    } ());

    mdsol.schema.Field = (function () {
        function Field() {
            if (!(this instanceof Field)) {
                return new Field();
            }

            return this;
        }

        return Field;
    } ());

    (function () {
        
        
    } ());

    mdsol.schema.Table = (function () {
        function Table() {
            if (!(this instanceof Table)) {
                return new Table();
            }

            return this;
        }

        return Table;
    } ());

    mdsol.schema.TitleBar = (function () {
        function TitleBar() {
            if (!(this instanceof TitleBar)) {
                return new TitleBar();
            }

            return this;
        }

        return TitleBar;
    } ());

// @DONE (2013-09-16 21:12)

    // Expose mdsol library to global object
    global.mdsol = mdsol;
}(jQuery));