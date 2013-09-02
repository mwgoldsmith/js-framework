
var namespace = (function (global) {
    /**
    * Creates an Object following the specified namespace identifier.
    */
    return function (identifier, objects) {
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

        if (!objects) {
            return ns;
        }

        for (item in objects) {
            if (objects.hasOwnProperty(item)) {
                ns[item] = objects[item];
            }
        }

        return ns;
    };
} (window));

; namespace('mdsol.ajax');
; namespace('mdsol.ui');
; namespace('mdsol.db');

var mdsol = mdsol || {};

mdsol.DEBUG = true;

mdsol.Core = (function (undefined) {
    var _error = function (msg) {
            throw new Error(msg);
        },
        _getType = function (o) {
            return ({}).toString.call(o).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        },
        _isString = function (o) {
            return typeof o === 'string';
        },
        _isArray = Array.isArray || function (o) {
            return _getType(o) === 'array';
        },
        _toArray = function (v) {
            if (v === null || v === undefined) {
                return [];
            } else if (_isArray(v)) {
                return v;
            }

            return [v];
        },
        _makeArray = function (arr, index) {
            return Array.prototype.slice.call(arr, index || 0);
        },
        _global = (function () {
            // ReSharper disable HeuristicallyUnreachableCode
            // Access to global object without referencing window directly (strict mode compliant)
            return this || (1, eval)('this');
            // ReSharper restore HeuristicallyUnreachableCode
        } ());

    return {
        noop: function() {
            return function() {};
        },
        
        each: function (array, action) {
            var i, len;

            for (i = 0, len = array.length; i < len; i++) {
                action(array[i]);
            }

            return Util;
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

        error: _error,

        getValue: function (o, identifier) {
            var a = identifier.split('.'),
                item = o,
                i, len;

            for (i = 0, len = a.length; i < len && item; i++) {
                item = a[i] in item ? item[a[i]] : undefined;
            }

            return item;
        },

        getGlobal: function () {
            return _global;
        },

        getType: _getType,

        isFunction: function (o) {
            return typeof o === 'function';
        },

        isObject: function (o) {
            return _getType(o) === 'object';
        },

        isDate: function (o) {
            return _getType(o) === 'date';
        },

        isString: _isString,

        isNumber: function(o) {
            return typeof o === 'number';
        },

        isArray: _isArray,

        toArray: _toArray,

        toJson: function (o) {
            var result = '',
                values,
                pairs,
                i, len;

            if (!o) {
                result = ' ';
            } else if (_isArray(o)) {
                for (i = 0, len = o.length; i < len; i++) {
                    result += '"' + o[i].name + '":"' + o[i].value + '",';
                }
            } else if (_isString(o)) {
                pairs = o.split('&');
                for (i = 0; i < pairs.length; i++) {
                    values = pairs[i].split('=');
                    result += '"' + values[0] + '":"' + ((values.length > 1) ? values[1] : '') + '",';
                }
            } else {
                values = Object.keys(o);
                for (i = 0; i < values.length; i++) {
                    result += '"' + values[i] + '":"' + o[values[i]] + '",';
                }
            }

            return '{' + result.slice(0, -1) + '}';
        },

        makeArray: _makeArray
    };
} ());

mdsol.String = (function (mdsol, undefined) {
    var REGEX_TRIM = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
    	REGEX_VALID_CHARS = /^[\],:{}\s]*$/,
	    REGEX_VALID_BRACES = /(?:^|:|,)(?:\s*\[)+/g,
	    REGEX_VALID_ESCAPE = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	    REGEX_VALID_TOKENS = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g;

    var _regexCx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        _global = mdsol.Core.getGlobal(),
        _protoTrim = String.prototype.trim,
        _core = mdsol.Core,
        _trim = _protoTrim && !_protoTrim.call('\uFEFF\xA0') ?
            function (text) {
                return text === null ? '' : _protoTrim.call(text);
            } :
            function (text) {
                return text === null ? '' : (text + '').replace(REGEX_TRIM, '');
            };

    return {
        trim: _trim,

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

            return _core.error('Failed to parse JSON data');
        }
    };
} (mdsol));

mdsol.Object = (function (mdsol, undefined) {
    var _protoToString = Object.prototype.toString,
        _protoHasOwn = Object.prototype.hasOwnProperty,
        _objString = _protoToString.call({}),
        _core = mdsol.Core,
        _isArray = _core.isArray,
        _isObject = _core.isObject,
        _makeArray = _core.makeArray,
        _toArray = _core.toArray,
        _clone = function (o) {
            var array = _isArray(o),
                object = !array && _isObject(o),
                clone, p;

            if (array || object) {
                if (o.clone) {
                    return o.clone();
                }

                clone = array ? [] : {};
                for (p in o) {
                    clone[p] = _clone(o[p]);
                }

                return clone;
            }

            return o;
        },

        _extend = function (/*[ deep,] target, srcA[, srcB[, ...]] */) {
            var a = _makeArray(arguments),
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

                // Clone next object
                for (p in o) {
                    if (o.hasOwnProperty(p)) {
                        v = o[p];
                        if (!shallow && v && _objString === _protoToString.call(v)) {
                            tgt[p] = tgt[p] || {};
                            _extend(true, tgt[p], v);
                        } else {
                            tgt[p] = v;
                        }
                    }
                }
            }

            return tgt;
        };

    return {
        clone: _clone,

        extend: _extend,

        merge: function () {
            var a = [{}].concat(_makeArray(arguments));

            return _extend.apply(this, a);
        },

        getKeys: function (o) {
            var result = [], p;

            for (p in o) {
                result.push(p);
            }

            return result;
        },

        getValues: function (o) {
            var result = [], p;

            for (p in o) {
                result.push(o[p]);
            }

            return result;
        },

        isPlainObject: function (o) {
            var key;

            // Borrowed for jQuery v1.8.2

            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that DOM nodes and window objects don't pass through, as well
            if (!o || mdsol.Core.getType(o) !== 'object' || o.nodeType || o === o.window) {
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

        isEmpty: function (o) {
            var p;

            for (p in o) { }

            return p === undefined;
        }
    };
} (mdsol));

mdsol.Class = (function (mdsol, undefined) {
    var _core = mdsol.Core,
        _object = mdsol.Object,
        _makeArray = _core.makeArray,
        _error = _core.error,
        _extend = _object.extend,
        _inherits = function (child, parent) {

        },
        _mixin = function (target/* , sourceA [, sourceB[, ...]] */) {
            var src = _makeArray(arguments, 1),
                p, s;

            if (_core.isFunction(target)) {
                target = target.prototype;
            }

            while (src.length) {
                s = src.shift();

                for (p in s) {
                    target[p] = s[p];
                }
            }

            return target;
        },
        _option = function (/* [key] | [key, value] | [object] */) {
            var o = this._options,
                setter = this._setOption,
                key, value, p;

            if (arguments.length) {
                key = arguments[0];
                if (typeof key === 'string') {
                    if (arguments.length > 1) {
                        value = arguments[1];

                        // If no setter function or it returned false, set the value
                        if (!setter || (setter && setter({ key: key, value: value }))) {
                            o[key] = value;
                        }
                    } else {
                        // Getter
                        if (key in o) {
                            return o[key];
                        } else {
                            return _error('Invalid option provided: "' + key + '"');
                        }
                    }
                } else if (_core.isObject(key)) {
                    // Setter - argument is object of key/value pairs
                    for (p in key) {
                        if (key.hasOwnProperty(p)) {
                            value = key[p];

                            // If no setter function or it returned false, set the value
                            if (!setter || (setter && setter({ key: key, value: value }))) {
                                o[key] = value;
                            }
                        }
                    }
                } else {
                    // Invalid arguments
                    return _error('Invalid arguments');
                }
            } else {
                // Getter - return all options
                return o;
            }

            return this;
        },
        _setter = function (key, value) {
            return function () {
                var setter = this._setOption;

                // If no setter function or it returned false, set the value
                if (!setter || (setter && setter({ key: key, value: value }))) {
                    this._options[key] = value;
                }

                return this;
            };
        },
        _singleton = function (constructor) {
            return (function (c) {
                var _instance = null;

                function Singleton() {
                    if (_instance) {
                        return _instance;
                    }

                    if (!(this instanceof Singleton)) {
                        return new Singleton();
                    }

                    _instance = new c();

                    return _extend(true, this, _instance);
                }

                Singleton.getInstance = function () {
                    return _instance || new Singleton();
                };

                return _inherits(Singleton, c);
            } (constructor));
        };

    function Class(obj, proto) {
        var _class = obj,
            _isInstance = !_object.isPlainObject(obj) && _core.isObject(_class),
            _isConstructor = !_isInstance && _core.isFunction(_class),
            _public = {
                singleton: function () {
                    if (_isInstance) {
                        throw new Error('Cannot convert an already instantiated object into a singleton constructor.');
                    }

                    _class = _singleton(_class);

                    return _public;
                },

                mixin: function (/*sourceA [, sourceB[, ...]] */) {
                    var a = _makeArray(arguments);

                    if (a.length === 1) {
                        _mixin(_class, a[0]);
                    } else {
                        _mixin.apply(_public, [_class].concat(a));
                    }

                    return _public;
                },

                inherits: function (base) {
                    if (_isInstance) {
                        throw new Error('An already instantiated object cannot inherit from another object.');
                    } else if (!base || typeof base !== 'function') {
                        throw new Error('Invalid base constructor.');
                    }

                    _class.parent = base.prototype;
                    _class.prototype = _extend(Object.create(base.prototype), _class.prototype);
                    _class.prototype.constructor = _class;

                    return _public;
                },

                staticMembers: function (members) {
                    var target = _isConstructor ? _class : _class.constructor;

                    _extend(true, target, members);

                    return _public;
                },

                options: function (/* defaults[, visibility][, enabling] | options */) {
                    var a = _core.makeArray(arguments),
                        mix, o, d;

                    if (_isConstructor) {
                        mix = { option: _option, _options: a[0] };
                        if (a[1]) {
                            mix.show = _setter('visible', true);
                            mix.hide = _setter('visible', false);
                        }

                        if (a[2]) {
                            mix.enable = _setter('enabled', true);
                            mix.disable = _setter('enabled', false);
                        }

                        _mixin(_class.prototype, mix);
                    } else if (_isInstance) {
                        o = _class._options || {},
                        d = _class.prototype._options || {};

                        _class._options = _object.merge(o, d, a[0]);
                    }

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
                    args = _makeArray(arguments, target ? 0 : 1);

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
        } else if (proto !== undefined && !_object.isPlainObject(proto)) {
            throw new Error('Prototype must be an object literal.');
        }

        if (proto) {
            _extend(true, _isInstance ? obj : obj.prototype, proto);
        }

        return _public;
    };

    return Class;
} (mdsol));

mdsol.BitFlags = (function (mdsol, undefined) {
    "use strict";

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

            for (i = flags.length; i--; ) {
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
            for (i = flags.length; i--; ) {
                value = value | flagValue(flags[i]);
            }

            return value;
        }

        var _makeArray = mdsol.Core.makeArray,
            _flags = mdsol.Object.clone(flagsObject),
            _entropy = getMaxValue(_flags),
            _value = initValue !== undefined ? bitFlags(mdsol.Core.toArray(initValue)) : 0,
            _public = {
                value: function () {
                    if (arguments.length) {
                        _value = bitFlags(_makeArray(arguments));
                    }

                    return _value;
                },

                equals: function () {
                    return _value === bitFlags(_makeArray(arguments));
                },

                test: function () {
                    return test(false, _makeArray(arguments));
                },

                testAny: function () {
                    return test(true, _makeArray(arguments));
                },

                toString: function () {
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

                valueOf: function () {
                    return _flags;
                }
            };

        return mdsol.Class(this, _public).valueOf();
    };

    return BitFlags;
} (mdsol));

mdsol.Enum = (function (mdsol, undefined) {
    "use strict";

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
            _enum = mdsol.Object.clone(enumObj),
            _value = initValue !== undefined ? enumValue(initValue) : null,
            _public = {
                value: function (value) {
                    if (arguments.length) {
                        _value = enumValue(value);
                    }

                    return _value;
                },

                test: function (value) {
                    return _value === enumValue(value);
                },

                toString: function () {
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

                valueOf: function () {
                    return _enum;
                }
            };

        return mdsol.Class(this, _public).valueOf();
    };

    return Enum;
} (mdsol));

mdsol.ObjectArray = (function (mdsol, undefined) {

} (mdsol));

mdsol.ObjectMap = (function (mdsol, undefined) {

} (mdsol));

mdsol.ObjectView = (function (mdsol, undefined) {

} (mdsol));

mdsol.UserSession = (function (mdsol, undefined) {
    //"use strict";

    var _class = mdsol.Class;
    
    function UserSession() {
        if (!(this instanceof UserSession)) {
            return new UserSession();
        }

        var _public = {
            dispose: function () {
                // Perform any cleanup
            }
        };

        return _class(this, _public).valueOf();
    };

    return _class(UserSession).singleton().valueOf();
} (mdsol));

mdsol.ajax.Handler = (function (mdsol, undefined) {
    //"use strict";

    var _class = mdsol.Class,
        _contentTypeEnum = {
            JSON: 'application/json; charset=utf-8',
            TEXT: 'text/plain; charset=utf-8',
            HTML: 'text/html; charset=utf-8'
        },
        _static = {
            contentTypeEnum: _contentTypeEnum
        };

    function Handler() {
        if (!(this instanceof Handler)) {
            return new Handler();
        }

        var _core = mdsol.Core,
            _requests = {},
            _uuid = 0,
            _public = {
                post: function (uri, contentType, data, callback, userData) {
                    jxhrRequest(uri, 'POST', contentType, data, callback, userData);

                    return this;
                },

                get: function (uri, contentType, data, callback, userData) {
                    jxhrRequest(uri, 'GET', contentType, data, callback, userData);

                    return this;
                },

                dispose: function () {
                    // Perform any cleanup
                }
            };

        function updateRequests(uuid, params) {
            if (arguments.length === 1) {
                delete _requests[uuid];
            } else {
                _requests[uuid] = params;
            }

            if (Object.keys(_requests).length) {
                // TODO: Update/show 'waiting' display
            } else {
                // TODO: Hide 'waiting' display
            }
        }

        function jxhrRequest(uri, method, contentType, data, callback, userData) {
            var params = {
                type: method,
                url: uri,
                data: data,
                contentType: _contentTypeEnum[contentType.toUpperCase()],
                cache: false,
                dataType: contentType.toLowerCase() || 'html',
                userData: userData,
                uuid: _uuid,
                callback: callback,
                success: onAjaxSuccess,
                error: onAjaxError
            };
            
            updateRequests(_uuid, params);
            _uuid++;

            $.ajax(params);
        }

        function onAjaxSuccess(data/*, status, xhr*/) {
            var callback = this.callback;

            updateRequests(this.uuid);

            if (_core.isFunction(callback)) {
                callback(true, data, this.userData, this);
            }
        }

        function onAjaxError(xhr/*, status, err*/) {
            var callback = this.callback;

            updateRequests(this.uuid);

            if (_core.isFunction(callback)) {
                callback(false, xhr, this.userData, this);
            }
        }

        return _class(this, _public).valueOf();
    };

    return _class(Handler)
        .staticMembers(_static)
        .singleton()
        .valueOf();
} (mdsol));

mdsol.ajax.Method = (function (mdsol, undefined) {
    var BASE_URL = 'http://dlcdkpcs1.ad.mdsol.com/api/Services/';
    var _core = mdsol.Core,
        _object = mdsol.Object,
        _class = mdsol.Class,
        _statusFlags = {
            NONE: 0,                // The method has not yet executed
            EXECUTING: 0x01,        // The method is currently executing
            COMPLETED: 0x02,        // The method has completed execution
            SUCCESS: 0x02 | 0x10,   // The method has completed successfully
            FAILED: 0x02 | 0x20     // The method has completed with errors
        },
        _defaultOptions = {
            service: null,
            method: null,
            params: null,
            callback: _core.noop,
            userData: null
        },
        _prototype = {

            getStatus: function () {
                return this._status.valueOf();
            }
        };

    function Method(options) {
        if (!(this instanceof Method)) {
            return new Method(options);
        }

        var _self = this,
            _handler = mdsol.ajax.Handler.getInstance(),
            _public = {
                _status: mdsol.BitFlags(_statusFlags, 'NONE'),

                _setOption: function (option) {
                    var value;
                    
                    if (option.key === 'status') {
                        value = option.value;
                        if (mdsol.Core.isArray(value)) {
                            _self._status.value.apply(this, value);
                        } else {
                            _self._status.value(value);
                        }
                        
                        return false;
                    }
                    
                    return true;
                },

                execute: function (/*[callback, ][apiParamVal1][, apiParamVal2][, ...] */) {
                    var a = _core.makeArray(arguments),
                        o = this.option(),
                        userData = _object.clone(o),
                        params = o.params || [],
                        uri,
                        paramObj = {},
                        i, len, data;

                    if (a.length && _core.isFunction(a[0])) {
                        userData.callback = a.shift();
                    }

                    for (i = 0, len = params.length; i < len; i++) {
                        paramObj[params[i]] = a[i];
                    }

                    uri = BASE_URL + o.service + '.asmx/' + o.method;
                    data = _core.toJson(paramObj);

                    _handler.post(uri, 'JSON', data, onCompleted, userData);

                    return this;
                },

                dispose: function () {
                    // Perform any cleanup
                    return this;
                }
            };

        function onCompleted(success, data, params, xhr) {
            var error = null, e,
                buttonEnum = mdsol.ui.MessageBox.buttonEnum,
                msgboxOptions = {
                    buttons: buttonEnum.OK,
                    title: 'An error occured',
                    visible: true,
                    autoSize: true
                };

            _self.option('status', ['COMPLETED', success ? 'SUCCESS' : 'FAILED']);

            if (!success) {
                error = parseServerError(xhr, data);
            } else {
                try {
                    data = mdsol.String.parseJson(data.d);
                } catch (err) {
                    data = null;
                    success = false;
                    error = getExceptionError(xhr, err);
                }

                if (!success) {
                    msgboxOptions.autoSize = false;
                } else if (data && _core.isArray(data) && data.length && data[0].error_time) {
                    error = parseServiceError(xhr, data);
                } else {
                    e = $.Event(this.eventName, { xhrMethod: _self, params: params });
                    if (this.callback) {
                        this.callback(e, success, data);
                    }
                }
            }

            if (error) {
                msgboxOptions.text = error;
                mdsol.ui.MessageBox(msgboxOptions);
            }

            return true;
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
                    message += errorLine('Time:', item.error_time) +
                        errorLine('Message:', item.message) + '<br />';
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
        
        return _class(this, _public).options(options).valueOf();
    }

    Method.statusFlags = _statusFlags;

    return _class(Method, _prototype)
        .options(_defaultOptions)
        .valueOf();
} (mdsol));

mdsol.ajax.RequestMethod = (function (mdsol, undefined) {
    var DEFAULT_PARAMS = ['audit_info', 'field_filter'];

    var _core = mdsol.Core,
        _class = mdsol.Class,
        _merge = mdsol.Object.merge,
        _ajaxMethod = mdsol.ajax.Method,
        _defaultOptions = _merge(_ajaxMethod.defaultOptions, { fields: [], audit: false });

    function RequestMethod(options) {
        if (!(this instanceof RequestMethod)) {
            return new RequestMethod(options);
        }

        function createOptions(defaultOptions, o) {
            var params = o ? _core.toArray(o.params) : [];

            return _merge(_defaultOptions, o || {}, {
                params: params.concat(DEFAULT_PARAMS)
            });
        }

        function createArguments(that, method, args) {
            var audit = that.option('audit'),
                fields = that.options('fields'),
                a = [audit ? 'y' : 'n', fields.join(',')];

            return [that, 'execute'].concat(args, a);
        }

        var _public = {
                _setOption: function (option) {
                    var key = option.key;
                    
                    if (key === 'fields') {
                        option.value = _core.toArray(option.value);
                    }

                    return true;
                },

                execute: function (/* [apiParamVal1][, apiParamVal2][, ...] */) {
                    var a = createArguments(this, 'execute', _core.makeArray(arguments));

                    return _class.base.apply(this, a);
                },

                dispose: function () {
                    // Perform any cleanup
                }
            };
        
        return _class(this, _public)
            .base(createOptions(_defaultOptions, options))
            .valueOf();
    };
    
    return _class(RequestMethod).inherits(_ajaxMethod).valueOf();
} (mdsol));

mdsol.ajax.UpsertMethod = (function (mdsol, undefined) {
    var DEFAULT_PARAMS = ['session_id', 'field_data'];

    var _core = mdsol.Core,
        _class = mdsol.Class,
        _object = mdsol.Object;

    function UpsertMethod(options) {
        if (!(this instanceof UpsertMethod)) {
            return new UpsertMethod(options);
        }

        var _options = _object.clone(options),
            _public = {
                execute: function (/* [apiParamVal1][, apiParamVal2][, ...] */) {
                    var token = ctms.userSession.dbUser.session_id,
                        args = _core.makeArray(arguments),
                        fieldData = '', a;
                    
                    if (args.length && !_core.isFunction(args[0])) {
                        fieldData = args[0];
                    }
                    
                    a = [token, fieldData];
                    
                    return _class.base.apply(this, [this, 'execute'].concat(args, a));
                },

                dispose: function () {
                    // Perform any cleanup
                }
            };

        // Force option 'params' to an array and add the default request parameters
        _options.params = _core.toArray(_object.params).concat(DEFAULT_PARAMS);
        
        return _class(this, _public)
            .options(_options)
            .valueOf();
    };

    return _class(UpsertMethod)
        .inherits(mdsol.ajax.Method)
        .valueOf();
} (mdsol));

mdsol.ui.NavigationBar = (function (mdsol, undefined) {
    //"use strict";

    var _class = mdsol.Class;
        
    function NavigationBar() {
        if (!(this instanceof NavigationBar)) {
            return new NavigationBar();
        }

        var _public = {
            dispose: function () {
                // Perform any cleanup
            }
        };

        return _class(this, _public).valueOf();
    };

    return _class(NavigationBar)
            .singleton()
            .valueOf();
} (mdsol));

mdsol.ui.SchemaCanvas = (function (mdsol, undefined) {
    //"use strict";

    function SchemaCanvas() {
        if (!(this instanceof SchemaCanvas)) {
            return new SchemaCanvas();
        }

        var _public = {
            dispose: function () {
                // Perform any cleanup
            }
        };

        return mdsol.Object.extend(this, _public);
    };

    return mdsol.Class(SchemaCanvas).singleton().valueOf();
} (mdsol));

mdsol.ui.Dropdown = (function (mdsol, undefined) {

} (mdsol));

mdsol.ui.DropdownSelect = (function (mdsol, undefined) {

} (mdsol));

mdsol.ui.DropdownMenu = (function (mdsol, undefined) {

} (mdsol));

mdsol.ui.DialogContainer = (function (mdsol, undefined) {
    var _methods = {
        options: function () {

        },
        show: function () {

        },
        hide: function () {

        },
        refresh: function () {

        },
        dispose: function () {

        },
        addDialog: function () {

        },
        getDialog: function () {

        },
        removeDialog: function () {

        },
        selectedDialog: function () {

        },
        clearDialogs: function () {

        }
    };
} (mdsol));

mdsol.ui.Dialog = (function (mdsol, undefined) {

} (mdsol));

mdsol.ui.DialogPage = (function (mdsol, undefined) {

    var _callbacks = {
        onLoading: null,
        onInitialized: null,
        onDisplaying: null,
        onHiding: null,
        onSaving: null,
        onClosing: null,
        onRefreshing: null,
        onMenuSelect: null
    },
        _methods = {
            options: function () {

            },
            show: function () {

            },
            hide: function () {

            },
            enable: function () {

            },
            disable: function () {

            },
            refresh: function () {

            },
            dispose: function () {

            },
            callbacks: function () {

            },
            addButton: function () {

            },
            getButton: function () {

            },
            removeButton: function () {

            },
            selectedSubpage: function () {

            },
            load: function () {

            },
            save: function () {

            },
            close: function () {

            }
        };
} (mdsol));

mdsol.ui.DialogSubpage = (function (mdsol, undefined) {

    var _callbacks = {
        onInitialized: null,
        onDisplaying: null,
        onHiding: null,
        onSaving: null,
        onClosing: null,
        onRefreshing: null
    };
} (mdsol));

mdsol.ui.DialogBox = (function (mdsol, undefined) {

} (mdsol));

mdsol.ui.MessageBox = (function (mdsol, undefined) {
    var _buttonEnum = {
            OK: 0x01
        },
        _defaultOptions = {
            buttons: _buttonEnum.OK,
            title: '',
            text: '',
            visible: true,
            autoSize: true,
            callback: null
        };
    
} (mdsol));


