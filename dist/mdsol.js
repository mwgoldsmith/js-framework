(function(window) {
  
var global = (function () {
        // Access to global object without referencing window directly 
        // (strict mode compliant)
        return this || (1, eval)('this');
    } ());

var natives = (function (map, undefined) {
        var objToString = ({}).toString,
            p, o;

        function natives(type) {
            return natives['[object ' + type.charAt(0).toUpperCase() + type.slice(1) + ']'];
        }

        for (p in map) {
            if (map.hasOwnProperty(p)) {
                o = map[p];
                if (o !== undefined && o !== null) {
                    natives[objToString.call(o)] = o.constructor.prototype;
                }
            }
        }

        return natives;
    } ({
        'Null': null,
        'Undefined': undefined,
        'String': '',
        'Number': 0,
        'Date': new Date(),
        'Boolean': true,
        'RegExp': /./,
        'Array': [],
        'Object': {},
        'Function': function () { }
    }));

var hasOwnProperty = natives['[object Object]'].hasOwnProperty;

var toString = natives['[object Object]'].toString;

var isArray = (function (isArray) {
        return typeof isArray === 'function'
            ? isArray
            : function(obj) {
                return toString.call(obj) === '[object Array]';
            };
    } ([].constructor.isArray));

var keys = (function(keys) {
        var hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return typeof keys === 'function'
            ? keys
            : function (obj) {
                var p, i, result = [];

                if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
                    throw new TypeError('keys called on non-object');
                }

                for (p in obj) {
                    if (hasOwnProperty.call(obj, p)) {
                        result.push(p);
                    }
                }

                if (hasDontEnumBug) {
                    for (i = 0; i < dontEnumsLength; i++) {
                        if (hasOwnProperty.call(obj, dontEnums[i])) {
                            result.push(dontEnums[i]);
                        }
                    }
                }

                return result;
            };
    }(natives['[object Object]'].keys));

var push = natives['[object Array]'].push;

var slice = natives['[object Array]'].slice;


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


    var BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        
    extend(mdsol, {
        base64Encode: function (input) {
            var output = '',
                chr1, chr2, chr3,
                enc1, enc2, enc3,
                enc4, i = 0;

            // Encodes the specified string to Base 64.

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
        },

        base64Decode: function (input) {
            var fromCharCode = ''.fromCharCode,
                output = '',
                chr1, chr2, chr3,
                enc1, enc2, enc3,
                enc4, i = 0;

            // Decodes the specified Base 64 string.

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
    });


    extend(mdsol, {
        getCookie: function (name) {
            var cookies = global.document.cookie.split(';')
                .map(
                    function (x) { return x.trim().split(/(=)/); })
                .reduce(
                    function (a, b) {
                        a[b[0]] = a[b[0]] ? a[b[0]] + ', ' + b.slice(2).join('') : b.slice(2).join('');
                        return a;
                    }, {});

            return cookies[name];
        },

        setCookie: function (name, value, domain, expiration) {
            var expirePart = expiration ? '; expires=' + expiration : '',
                domainPart = domain ? '; domain=' + domain : '';

            global.document.cookie = name + '=' + value + expirePart + domainPart + '; path=/';

            return mdsol;
        },

        deleteCookie: function(name) {
            global.document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

            return mdsol;
        }
    });

var trim = natives['[object String]'].trim;


    var REGEX_VALID_CHARS = /^[\],:{}\s]*$/,
        REGEX_VALID_BRACES = /(?:^|:|,)(?:\s*\[)+/g,
        REGEX_VALID_ESCAPE = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
        REGEX_VALID_TOKENS = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,
        _regexCx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        
    extend(mdsol, {
        parseJson: function (text) {
            var data = trim(text);

            // Logic borrowed from Crockford (https://github.com/douglascrockford/JSON-js/blob/master/json2.js)

            // Replace certain Unicode characters with escape sequences to prevent either silently
            // deleting them, or treating them as line endings
            _regexCx.lastIndex = 0;
            if (_regexCx.test(data)) {
                data = text.replace(_regexCx, function (a) {
                    return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // Use Native JSON parser if present
            if (global.JSON && isFunction(global.JSON.parse)) {
                return global.JSON.parse(data);
            }

            if (REGEX_VALID_CHARS.test(data.replace(REGEX_VALID_ESCAPE, '@')
                .replace(REGEX_VALID_TOKENS, ']')
                .replace(REGEX_VALID_BRACES, ''))) {

                return (new Function('return ' + data))();
            }

            throw new Error('Failed to parse JSON data.');
        },

        toJson: function (o) {
            var result = '',
                values,
                pairs,
                i, len;

            // This is far from robust, but it gets the job done for now
            // TODO: Refactor

            if (!o) {
                result = ' ';
            } else if (isArray(o)) {
                // Assume array of objects containing 'name' and 'value' properties
                for (i = 0, len = o.length; i < len; i++) {
                    result += '"' + o[i].name + '":"' + o[i].value + '",';
                }
            } else if (typeof o === 'string') {
                // Assume string of query string style name=value pairs
                pairs = o.split('&');
                for (i = 0, len = pairs.length; i < len; i++) {
                    values = pairs[i].split('=');
                    result += '"' + values[0] + '":"' + ((values.length > 1) ? values[1] : '') + '",';
                }
            } else {
                // Assume object; convert to stringified key:value pairs
                values = Object.keys(o);
                for (i = 0, len = values.length; i < len; i++) {
                    result += '"' + values[i] + '":"' + o[values[i]] + '",';
                }
            }

            return '{' + result.slice(0, -1) + '}';
        }
    });


    var REGEX_TRIM = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

    extend(mdsol, {
        alphaNumeric: function (value) {
            // Removes non alpha-numeric values from the specified string.
            return typeof value === 'string' ? value.replace(/\W/gi, '') : value;
        },

        trim: trim && !trim.call('\uFEFF\xA0') ?
            function (text) {
                return text === null ? '' : trim.call(text);
            } :
            function(text) {
                return text === null ? '' : (text + '').replace(REGEX_TRIM, '');
            }
    });


    mdsol.Class = (function (undefined) {
        function inherits(child, base) {
            child.parent = base.prototype;
            child.prototype = extend(Object.create(base.prototype), child.prototype);
            child.prototype.constructor = child;

            return child;
        }

        function Class(obj, proto) {
            var _class = obj,
                _isInstance = !mdsol.isPlainObject(obj) && mdsol.isObject(_class),
                _isConstructor = !_isInstance && mdsol.isFunction(_class),
                _public = {
                    mixin: function (/*sourceA [, sourceB[, ...]] */) {
                        var a = mdsol.makeArray(arguments),
                            mixer;

                        // See http://jsperf.com/mixin-fun/2
                        while (a.length) {
                            mixer = a.shift();
                            if (!mixer || !(mdsol.isFunction(mixer) || mdsol.isObject(mixer))) {
                                throw new Error('Invalid data type for mixin.');
                            }

                            mixer.call(_class.prototype);
                        }

                        return _public;
                    },

                    inherits: function (base) {
                        if (_isInstance) {
                            throw new Error('An already instantiated object cannot inherit from another object.');
                        } else if (!base || !mdsol.isFunction(base)) {
                            throw new Error('Invalid base constructor.');
                        }

                        inherits(_class, base);

                        return _public;
                    },

                    extend: function (members) {
                        var target = _isConstructor ? _class : _class.constructor;

                        extend(true, target, members);

                        return _public;
                    },

                    base: function (method/* [, argA[, argB[, ...]]]*/) {
                        var caller = arguments.callee.caller,
                            target, args, c,
                            found = false;

                        if (mdsol.DEBUG && !caller) {
                            throw new Error('base() cannot run in strict mode: arguments.caller not defined.');
                        }

                        target = caller.parent;
                        args = mdsol.makeArray(arguments, target ? 0 : 1);

                        // If this is a constructor, call the superclass constructor
                        if (target) {
                            target = target.constructor;
                        } else {
                            // If this is a method, locate the method in the prototype chain and
                            // target the superclassed method (method of the next parent)
                            for (c = _class.constructor; c; c = c.parent && c.parent.constructor) {
                                if (c.prototype[method] === caller) {
                                    found = true;
                                } else if (found) {
                                    target = c.prototype[method];
                                    break;
                                }
                            }

                            // If we did not find the caller in the prototype chain, then one of two
                            // things happened:
                            // 1) The caller is an instance method.
                            // 2) This method was not called by the right caller.
                            if (!target && _class[method] === caller) {
                                target = _class.constructor.prototype[method];
                            } else {
                                throw new Error('base() can only call a method of the same name');
                            }
                        }

                        return target.apply(_class, args);
                    },

                    valueOf: function () {
                        return _class;
                    }
                };

            if (!_isInstance && !_isConstructor) {
                throw new Error('Class object must be a constructor or an instance.');
            } else if (proto !== undefined && !isPlainObject(proto)) {
                throw new Error('Prototype must be an object literal.');
            }

            if (proto) {
                extend(true, _isInstance ? obj : obj.prototype, proto);
            }

            return _public;
        };

        Class.inherits = inherits;

        return Class;
    } ());


    mdsol.BitFlags = (function(undefined) {
        

        function BitFlags(flagsObject, initValue) {
            if (!(this instanceof BitFlags)) {
                return new BitFlags(flagsObject, initValue);
            }

            function getMaxValue(flags) {
                var f, all = 0;

                // Get combined value of all flags
                for (f in flags) {
                    if (typeof flags[f] !== 'number') {
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

            /* @flag = name | value */
            function flagValue(flag) {
                var value;

                if (typeof flag === 'string') {
                    // Verify the flag name exists
                    flag = _flags[flag];
                    value = flag !== undefined ? flag : null;
                } else if (typeof flag === 'number') {
                    // Verify value is a possible valid combination of flags
                    value = ((flag & _entropy) === flag) ? flag : null;
                } else {
                    // Invalid data type
                    value = null;
                }

                if (value === null) {
                    throw new Error('Invalid bit flag value');
                }

                return value;
            }

            /* @flags = [nameA[, nameB[, ...]]] | [valueA[, valueB[, ...]]] */
            function test(any, flags) {
                var f, i, match = !any;

                for (i = flags.length; i--;) {
                    f = flagValue(flags[i]);

                    // Test if the flag is set
                    if (!match || !any) {
                        if ((f & _value) === f) {
                            if (any) {
                                match = true;
                            }
                        } else if (!any) {
                            match = false;
                        }
                    }
                }

                return match;
            }

            /* @flags = [nameA[, nameB[, ...]]] | [valueA[, valueB[, ...]]] */
            function bitFlags(flags) {
                var i, value = 0;

                // Combine flag(s) to set
                for (i = flags.length; i--;) {
                    value = value | flagValue(flags[i]);
                }

                return value;
            }

            var _makeArray = mdsol.makeArray,
                _flags = mdsol.clone(flagsObject),
                _entropy = getMaxValue(_flags),
                _value = initValue !== undefined ? bitFlags(mdsol.toArray(initValue)) : 0,
                _public = {
                    value: function() {
                        if (arguments.length) {
                            _value = bitFlags(_makeArray(arguments));
                        }

                        return _value;
                    },

                    equals: function() {
                        return _value === bitFlags(_makeArray(arguments));
                    },

                    test: function() {
                        return test(false, _makeArray(arguments));
                    },

                    testAny: function() {
                        return test(true, _makeArray(arguments));
                    },

                    toString: function() {
                        var names = [],
                            p;

                        // Create array of flag names which are currently set
                        for (p in _flags) {
                            // Not using hasOwnProperty since _flags is guaranteed to be a
                            // simple object literal by getMaxValue() when instantiated
                            if (test(true, p)) {
                                names.push(p);
                            }
                        }

                        return names.toString();
                    },

                    valueOf: function() {
                        return _flags;
                    }
                };

            return mdsol.Class(this, _public).valueOf();
        }

        return BitFlags;
    }());


    mdsol.Enum = (function(undefined) {
        

        function Enum(enumObj, initValue) {
            if (!(this instanceof Enum)) {
                return new Enum(enumObj, initValue);
            }

            function getValues(o) {
                var values = [], p;

                for (p in o) {
                    if (typeof o[p] !== 'number') {
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

            function enumValue(v) {
                if (v === null) {
                    return null;
                } else if (typeof v === 'string' && _enum[v] !== undefined) {
                    // Verify it is a valid enum name (see: http://jsperf.com/hasownproperty-vs-in-vs-other/)
                    return _enum[v];
                } else if (typeof v === 'number' && _all.indexOf(v) !== -1) {
                    // Verify it is a valid enum value
                    return v;
                }

                throw new Error('Invalid enum value');
            }

            var _all = getValues(enumObj),
                _enum = mdsol.clone(enumObj),
                _value = initValue !== undefined ? enumValue(initValue) : null,
                _public = {
                    value: function(value) {
                        if (arguments.length) {
                            _value = enumValue(value);
                        }

                        return _value;
                    },

                    test: function(value) {
                        return _value === enumValue(value);
                    },

                    toString: function() {
                        var p;

                        for (p in _enum) {
                            // Not using hasOwnProperty since _enum is guaranteed to be a
                            // simple object literal by getValues() when instantiated
                            if (_enum[p] === _value) {
                                return p;
                            }
                        }

                        return null;
                    },

                    valueOf: function() {
                        return _enum;
                    }
                };

            return mdsol.Class(this, _public).valueOf();
        }

        return Enum;
    }());


    mdsol.ObjectArray = (function (undefined) {
        

        var _softIndexOf = function(arr, value) {
                var i, len;
            
                // Return the index of the first match for `value` within the
                // array. Strict comparison is not used.
            
                for (i = 0, len = arr.length; i < len; i++) {
                    if (arr[i] == value) {
                        return i;
                    }
                }

                return -1;
            },
            _getProperty = function (obj, identifier) {
                var a = identifier.split('.'),
                        item = obj,
                        i, len;

                for (i = 0, len = a.length; i < len && item; i++) {
                    item = a[i] in item ? item[a[i]] : undefined;
                }

                return item;
            },
            _filterItems = function (inclusive, prop/*, varValue*/) {
                var args = slice.call(arguments, 2),
                    exclude = !inclusive,
                    baseArray = this._array,
                    values,
                    v, i;

                values = isArray(args[0]) ? args[0] : toArray(args);

                for (i = baseArray.length; i--; ) {
                    v = _getProperty(baseArray[i], prop);

                    if (!!(exclude ^ !(v !== undefined && _softIndexOf(values, v) !== -1))) {
                        baseArray.splice(i, 1);
                    }
                }

                return this;
            },
            _getAll = function (inclusive, prop/*, varValue */) {
                var args = slice.call(arguments, 2),
                    baseArray = this._array,
                    exclude = !inclusive,
                    values,
                    result = [],
                    item, v, i;

                values = isArray(args[0]) ? args[0] : toArray(args);

                for (i = baseArray.length; i--; ) {
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
                    unique = [];

                for (i = baseArray.length; i--; ) {
                    item = baseArray[i];

                    exists = unique.some(function (e) {
                        for (j = props.length - 1, exists = false; j >= 0 && !exists; j--) {
                            exists = item[props[j]] === e[props[j]];
                        }

                        return exists;
                    });

                    if (!exists) {
                        unique.push(item);
                    }
                }

                return unique;
            },
            _prototype = {
                contains: function (key, value) {
                    // Returns true if any objects in the collection match the key:value pair
                    var baseArray = this._array,
                        i, exists = false;

                    // Determine if at least on item with the property/value pair exists
                    for (i = baseArray.length - 1; i >= 0 && !exists; i--) {
                        exists = baseArray[i][key] == value;
                    }

                    return exists;
                },

                filter: function (/*key, varValues*/) {
                    // Filters the collection to exclude all objects matching the key and 
                    // and any of the provided values
                    var args = [false];

                    push.apply(args, arguments);

                    return _filterItems.apply(this, args);
                },

                get: function (key, value) {
                    // Returns the first object in the collection which matches the key:value pair
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
                },

                getAll: function (/*key, varValues*/) {
                    // Returns all objects in the collection which match the key and any of the 
                    // provided values
                    var args = [true];

                    push.apply(args, arguments);

                    return _getAll.apply(this, args);
                },
            
                getNot: function (/*key, varValues*/) {
                    // Returns all objects in the collection which do not match the key and any
                    // of the provided values
                    var args = [false];

                    push.apply(args, arguments);

                    return _getAll.apply(this, args);
                },
            
                getUnique: function(/* varKeys */) {
                    return _getUnique.apply(this, arguments);
                },
            
                indexOf: function (key, value) {
                    // Returns the index in the collection of the first match for the key:value pair
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
                },

                lastIndexOf: function (key, value) {
                    // Returns the index in the collection of the last match for the key:value pair
                },

                move: function (srcIndex, dstIndex) {
                    // Moves an item in the collection from one index to another
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
                },

                pluck: function (key, unique) {
                    // Returns an array of values for each item in the collection matching the key
                    // If unique is provided, only unique values will be returned.
                    var values = [],
                        baseArray = this._array,
                        i, v;

                    for (i = baseArray.length; i--; ) {
                        v = _getProperty(baseArray[i], key);

                        if (v !== undefined && (!unique || _softIndexOf(values, v) === -1)) {
                            values.push(v);
                        }
                    }

                    return values;
                },

                size: function (key, value) {
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
                },

                unique: function (/* varKeys */) {
                    // Filters the collection to only contain objects which contain unique values
                    // for any of the provided values
                    this._array = _getUnique.apply(this, arguments);

                    return this;
                },

                value: function (value) {
                    if (!arguments.length) {
                        // Returns the collection
                        return this._array;
                    } else {
                        // Sets the collection
                        this._array = value;
                    }

                    return this;
                },

                where: function (/*key, varValues*/) {
                    // Filters the collection to only include objects matching the key and 
                    // any of the provided values
                    var args = [true];

                    push.apply(args, arguments);

                    return _filterItems.apply(this, args);
                },
            };

        function ObjectArray(value) {
            if (!(this instanceof ObjectArray)) {
                return new ObjectArray(value);
            }

            if (value && !mdsol.isArray(value)) {
                throw new TypeError('Invalid data type for ObjectArray initialization value.');
            }
        
            // TODO: Consider implementing more robust type-checking
            // We're making a pretty big assumption at this point that every element in
            // 'value' (if provided) is an object. Consider an optional flag which can
            // enable or disable this action.
        
            this._array = value || [];
        
            return mdsol.ArrayBase(this, this._array);
        }

        return mdsol.Class(ObjectArray, _prototype).valueOf();
    } ());



    // Expose mdsol, even in AMD and CommonJS for browser emulators
    return (window.mdsol = mdsol);
}));
