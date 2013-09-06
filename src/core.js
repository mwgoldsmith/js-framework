define([
    './var/native'
], function (native) {
    var REGEX_TRIM = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        REGEX_VALID_CHARS = /^[\],:{}\s]*$/,
	    REGEX_VALID_BRACES = /(?:^|:|,)(?:\s*\[)+/g,
	    REGEX_VALID_ESCAPE = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	    REGEX_VALID_TOKENS = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,
        IS_DONTENUM_BUGGY = (function () {
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

    var _regexCx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        _native = native,
        _nativeArray = _native['[object Array]'],
        _nativeObject = _native['[object Object]'],
        _protoTrim = String.prototype.trim,
        _protoSlice = _nativeArray.slice,
        _protoPush = _nativeArray.push,
        _protoToString = _nativeObject.toString,
        _protoHasOwn = _nativeObject.hasOwnProperty,
        _isArray = typeof Array.isArray !== 'function' || function (obj) {
            return _protoToString.call(obj) === '[object Array]';
        },
        _isObject = function (o) {
            return _protoToString.call(o) === '[object Object]';
        },
        _toArray = function (value) {
            if (value === null || value === undefined) {
                return [];
            } else if (_isArray(value)) {
                return value;
            }

            // It would make sense at this point to add functionality to convert
            // an 'arguments' object to an actual array. Due to the overhead of
            // testing if 'value' is an actual 'Arguments' object accurately and
            // cross-browser, however, we will maintain makeArray() separately.

            return [value];
        },
        _keys = typeof Object.keys !== 'function' || function (obj) {
            var result = [], k;

            // This is subject to various browser bugs. However, this framework currently
            // assumes the ES5 shim is used we should therefore never even get here.
            // Consider removing the shim as a dependency.

            for (k in obj) {
                if (_protoHasOwn.call(obj, k)) {
                    result.push(k);
                }
            }

            return result;
        },
        _safeCopyProperty = function (tgt, org, methods) {
            var nativeProto = _native[_protoToString.call(tgt)],
                m, i;

            // Copy the property if it is not a native prototype method
            for (i = methods.length; i--; ) {
                m = methods[i];
                if (org[m] !== nativeProto[m]) {
                    tgt[m] = org[m];
                }
            }
        },
        _clone = function (o) {
            var array = _isArray(o),
                object = !array && _isObject(o),
                clone, p;

            if (array || object) {
                if (typeof o.clone === 'function') {
                    return o.clone();
                }

                clone = array ? [] : {};

                // See comment in declaration of IS_DONTENUM_BUGGY for details
                if (object && IS_DONTENUM_BUGGY) {
                    _safeCopyProperty(clone, o, ['toString', 'valueOf']);
                }

                for (p in o) {
                    clone[p] = _clone(o[p]);
                }

                return clone;
            }

            return o;
        },
        _extend = function (/*[ deep,] target, srcA[, srcB[, ...]] */) {
            var a = _protoSlice.call(arguments),
                shallow = true,
                tgt, src,
                o, p, i, v,
                len;

            if (typeof a[0] === 'boolean') {
                shallow = !a.shift();
            }

            tgt = a.shift();
            src = _toArray(a);

            // Clone each object
            for (i = 0, len = src.length; i < len; i++) {
                o = src[i] || {};

                // See comment in declaration of IS_DONTENUM_BUGGY for details
                if (IS_DONTENUM_BUGGY) {
                    _safeCopyProperty(tgt, o, ['toString', 'valueOf']);
                }

                // Clone next object
                for (p in o) {
                    if (o.hasOwnProperty(p)) {
                        v = o[p];
                        if (!shallow && v && _isObject(v)) {
                            tgt[p] = tgt[p] || {};
                            _extend(true, tgt[p], v);
                        } else {
                            tgt[p] = v;
                        }
                    }
                }
            }

            return tgt;
        },
        _trim = _protoTrim && !_protoTrim.call('\uFEFF\xA0') ?
            function (text) {
                return text === null ? '' : _protoTrim.call(text);
            } :
            function (text) {
                return text === null ? '' : (text + '').replace(REGEX_TRIM, '');
            },
        _global = (function () {
            // ReSharper disable HeuristicallyUnreachableCode
            // Access to global object without referencing window directly 
            // (strict mode compliant)
            return this || (1, eval)('this');
            // ReSharper restore HeuristicallyUnreachableCode
        } ());

    // Extend our base object with our public methods
    return _extend(mdsol, {
        alphaNumeric: function (value) {
            // Removes non alpha-numeric values from the specified string.
            return typeof value === 'string' ? value.replace(/\W/gi, '') : value;
        },

        base64Encode: function (input) {
            var output = '',
                chr1, chr2, chr3,
                enc1, enc2, enc3,
                enc4, i = 0;

            // Encodes the specified string to Base 64.

            input = _global.escape(input);

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
            var output = '',
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

                output = output + String.fromCharCode(chr1);

                if (enc3 !== 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 !== 64) {
                    output = output + String.fromCharCode(chr3);
                }
            } while (i < input.length);

            return _global.unescape(output);
        },

        clone: _clone,

        deleteCookie: function (name) {
            _global.document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

            return mdsol;
        },

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
                ns = _global;

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

        extend: _extend,

        getCookie: function (name) {
            var cookies = _global.document.cookie.split(';')
                .map(
                    function (x) { return x.trim().split(/(=)/); })
                .reduce(
                    function (a, b) {
                        a[b[0]] = a[b[0]] ? a[b[0]] + ', ' + b.slice(2).join('') : b.slice(2).join('');
                        return a;
                    }, {});

            return cookies[name];
        },

        getType: function (o) {
            return _protoToString.call(o).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
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

        global: _global,

        isArray: _isArray,

        isDate: function (o) {
            return _protoToString.call(o) === '[object Date]';
        },

        isEmpty: function (o) {
            var p;

            if (o === null || o === undefined) {
                return true;
            } else if (typeof o === 'string' || _isArray(o)) {
                return !!o.length;
            } else if (!_isObject(o)) {
                throw new TypeError('Invalid data type.');
            }

            for (p in o) {
                return !p;
            }

            return true;
        },

        isFunction: function (o) {
            return typeof o === 'function';
        },

        isNumber: function (o) {
            return typeof o === 'number';
        },

        isObject: _isObject,

        isOwn: function (obj, key) {
            return _protoHasOwn.call(obj, key);
        },

        isPlainObject: function (o) {
            var key;

            // Borrowed for jQuery v1.8.2 (why re-invent the wheel)

            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that DOM nodes and window objects don't pass through, as well
            if (!o || !_isObject(o) || o.nodeType || o === o.window) {
                return false;
            }

            try {
                // Not own constructor property must be Object
                if (o.constructor &&
                !_protoHasOwn.call(o, 'constructor') &&
                !_protoHasOwn.call(o.constructor.prototype, 'isPrototypeOf')) {
                    return false;
                }
            } catch (e) {
                // IE8,9 Will throw exceptions on certain host objects #9897
                return false;
            }

            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
            for (key in o) { }

            return key === undefined || _protoHasOwn.call(o, key);
        },

        isString: function (o) {
            return typeof o === 'string';
        },

        keys: _keys,

        makeArray: function (arr, index) {
            // For performance sake, this is a separate method from toArray

            return _protoSlice.call(arr, index || 0);
        },

        merge: function () {
            var args = [{}];

            _protoPush.apply(args, arguments);

            return _extend.apply(this, args);
        },

        noop: function () {
            return function () { };
        },

        parseJson: function (text) {
            var data = _trim(text);

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
            if (_global.JSON && _global.JSON.parse) {
                return _global.JSON.parse(data);
            }

            if (REGEX_VALID_CHARS.test(data.replace(REGEX_VALID_ESCAPE, '@')
            .replace(REGEX_VALID_TOKENS, ']')
            .replace(REGEX_VALID_BRACES, ''))) {

                return (new Function('return ' + data))();

            }

            throw new Error('Failed to parse JSON data.');
        },

        setCookie: function (name, value, domain, expiration) {
            var expirePart = expiration ? '; expires=' + expiration : '',
                domainPart = domain ? '; domain=' + domain : '';

            _global.document.cookie = name + '=' + value + expirePart + domainPart + '; path=/';

            return mdsol;
        },

        toArray: _toArray,

        toJson: function (o) {
            var result = '',
            values,
            pairs,
            i, len;

            // This is far from robust, but it gets the job done for now
            // TODO: Refactor

            if (!o) {
                result = ' ';
            } else if (_isArray(o)) {
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
        },

        trim: _trim,

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
                _protoPush.apply(args, arguments);
                return wrapper.apply(this, args);
            };
        }
    });
});
