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

mdsol = (function (mdsol, undefined) {
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

    mdsol.DEBUG = true;

    var _regexCx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        _nativeArray = ([]),
        _nativeObject = ({}),
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
                    if (o.toString !== _nativeObject.toString) {
                        clone.toString = o.toString;
                    }
                    if (o.valueOf !== _nativeObject.valueOf) {
                        clone.valueOf = o.valueOf;
                    }
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
                    if (o.toString !== _nativeObject.toString) {
                        tgt.toString = o.toString;
                    }
                    if (o.valueOf !== _nativeObject.valueOf) {
                        tgt.valueOf = o.valueOf;
                    }
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
        clone: _clone,

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
} (mdsol));

mdsol.ArrayBase = (function (mdsol, undefined) {
    var ARRAY_RW_METHODS = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'],
        ARRAY_RO_METHODS = ['slice'];

    // NOTE: There is something about this oject I don't like. It is technically
    // a mixin, but given its required parameters cannot simply be added as such
    // to another object. Consider renaming this something more appropriate.
    // For now, as long as it works leave it alone.
    
    var _nativeArray = Array.prototype,
        _arrayMethod = function (obj, method) {
            return function () {
                return _nativeArray[method].apply(obj, arguments);
            };
        };

    function ArrayBase(t, a, rw, ro) {
        if (!mdsol.isObject(t) || t === mdsol.global) {
            // Verify we are passed a valid object as 't' and we are not being
            // applied to global namespace
            throw new Error('ArrayBase must be applied to a valid object.');
        } else if (!mdsol.isArray(a)) {
            // Verify array object is an actual array
            throw new Error('Invalid array object.');
        } else if ((rw && !mdsol.isFunction(rw) || (ro && !mdsol.isFunction(ro)))) {
            // Verify callbacks are functions (if provided)
            throw new Error('Invalid data type for predicate.');
        }

        return (function (that, obj, rwPredicate, roPredicate) {
            var rwApply = (rwPredicate || _arrayMethod).call,
                roApply = (roPredicate || rwApply).call;

            // Borrow native Array methods
            // Prevent clobber of existing methods if present
            mdsol.each(ARRAY_RW_METHODS, function (method) {
                if (that[method] === undefined) {
                    that[method] = rwApply(that, obj, method);
                }
            }).each(ARRAY_RO_METHODS, function (method) {
                if (that[method] === undefined) {
                    that[method] = roApply(that, obj, method);
                }
            });

            return this;
        } (t, a, rw, ro));
    };

    return ArrayBase;
} (mdsol));

mdsol.SingletonBase = (function () {
    // NOTE: There are a number of things about this object I don't like:
    // 1) It is technically a wrapper, so the name is misleading.
    // 2) The entire idea is a little superfluous. Singletons should be created
    //    as a simple object literal - why present any additional overhead. 
    // 3) Conflicts may occur if a constructor is wrapped with SingletonBase.
    //    If after being wrapped as a singleton, the same constructor either
    //    inherits from another object or applies a mixin, the wrapper is
    //    discarded after the provided constructor is instantiated.
    // For now, as long as it works leave it alone.
    
    function SingletonBase(c) {
        if (!mdsol.isFunction(c)) {
            // Verify we are passed a valid function as 'c'
            throw new Error('SingletonBase must be applied to a valid constructor.');
        }
        
        return (function(ctor) {
            var _instance = null;

            function Singleton() {
                if (_instance) {
                    return _instance;
                }

                _instance = new ctor();

                return _instance;
            }

            Singleton.getInstance = function() {
                return _instance || new Singleton();
            };

            return mdsol.Class.inherits(Singleton, ctor);
        }(c));
    }

    return SingletonBase;
} (mdsol));

mdsol.OptionsBase = (function () {
    function OptionsBase(obj, options) {
        var _isInstance = !mdsol.isPlainObject(obj) && mdsol.isObject(obj),
            _isConstructor = !_isInstance && mdsol.isFunction(obj),
            _option = function (/* [key] | [key, value] | [object] */) {
                var o = this._options,
                    setter = this._setOption,
                    key, value, p, ret;

                if (arguments.length) {
                    key = arguments[0];
                    if (typeof key === 'string') {
                        if (arguments.length > 1) {
                            value = arguments[1];

                            // If no setter function or it returned false, set the value
                            if (setter) {
                                ret = setter(key, value);
                            }

                            o[key] = (ret !== undefined) ? ret : value;
                        } else {
                            // Getter
                            if (o[key] !== undefined) {
                                return o[key];
                            } else {
                                throw new Error('Invalid option provided: "' + key + '"');
                            }
                        }
                    } else if (mdsol.isObject(key)) {
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
            },
            _setter = function (key, value) {
                return function () {
                    var setter = this._setOption,
                        ret;

                    // If no setter function or it returned false, set the value
                    if (setter) {
                        ret = setter(key, value);
                    }

                    this._options[key] = (ret !== undefined) ? ret : value;

                    return this;
                };
            };

        function addToConstructor() {
            var proto = obj.prototype;
            
            proto._options = options || {};
            proto.option = _option;

            if (proto._options.visible !== undefined) {
                proto.show = _setter('visible', true);
                proto.hide = _setter('visible', false);
            }

            if (proto._options.enabled !== undefined) {
                proto.enable = _setter('enabled', true);
                proto.disable = _setter('enabled', false);
            }
        }

        function applyDefaultOptions() {
            var opts, defs, c;

            for (c = obj; c; ) {
                if (c.hasOwnProperty('_options')) {
                    break;
                }

                c = Object.getPrototypeOf(c);
            }

            if (c) {
                opts = c._options || {},
                defs = c.constructor.prototype._options || {};

                obj._options = mdsol.merge(opts, defs, options);
            }
        }

        if (_isConstructor) {
            addToConstructor();
        } else if (_isInstance) {
            applyDefaultOptions();
        }

        return obj;
    }

    return OptionsBase;
} (mdsol));

mdsol.Class = (function (mdsol, undefined) {
    var _makeArray = mdsol.makeArray,
        _extend = mdsol.extend,
        _inherits = function (child, base) {
            child.parent = base.prototype;
            child.prototype = _extend(Object.create(base.prototype), child.prototype);
            child.prototype.constructor = child;

            return child;
        };

    function Class(obj, proto) {
        var _class = obj,
            _isInstance = !mdsol.isPlainObject(obj) && mdsol.isObject(_class),
            _isConstructor = !_isInstance && mdsol.isFunction(_class),
            _public = {
                mixin: function (/*sourceA [, sourceB[, ...]] */) {
                    var a = _makeArray(arguments),
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
                    } else if (!base || typeof base !== 'function') {
                        throw new Error('Invalid base constructor.');
                    }

                    _inherits(_class, base);

                    return _public;
                },

                extend: function (members) {
                    var target = _isConstructor ? _class : _class.constructor;

                    _extend(true, target, members);

                    return _public;
                },
                /*
                options: function (options) {
                    var c, opts, defs;

                    if (_isConstructor) {
                        mdsol.OptionsBase.call(_class.prototype, options || {});
                    } else if (_isInstance) {
                        for (c = _class; c; ) {
                            if (c.hasOwnProperty('_options')) {
                                break;
                            }

                            c = Object.getPrototypeOf(c);
                        }

                        if (c) {
                            opts = c._options || {},
                            defs = c.constructor.prototype._options || {};

                            _class._options = mdsol.merge(opts, defs, options);
                        }
                    }

                    return _public;
                },*/

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
        } else if (proto !== undefined && !mdsol.isPlainObject(proto)) {
            throw new Error('Prototype must be an object literal.');
        }

        if (proto) {
            _extend(true, _isInstance ? obj : obj.prototype, proto);
        }

        return _public;
    };

    Class.inherits = _inherits;

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

        var _makeArray = mdsol.makeArray,
            _flags = mdsol.clone(flagsObject),
            _entropy = getMaxValue(_flags),
            _value = initValue !== undefined ? bitFlags(mdsol.toArray(initValue)) : 0,
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
    }

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
} (mdsol));

mdsol.ObjectArray = (function (mdsol, undefined) {
    var _prototype = {
        contains: function (key, value) {
            // Returns true if any objects in the collection match the key:value pair
        },

        excluded: function (key, varValues) {
            // Returns all objects in the collection which do not match the key and any
            // of the provided values
        },

        find: function (key, value) {
            // Returns the first object in the collection which matches the key:value pair
        },

        filter: function (key, varValues) {
            // Filters the collection to exclude all objects matching the key and 
            // and any of the provided values
        },

        indexOf: function (key, value) {
            // Returns the index in the collection of the first match for the key:value pair
        },

        lastIndexOf: function (key, value) {
            // Returns the index in the collection of the last match for the key:value pair
        },

        matches: function (key, varValues) {
            // Returns all objects in the collection which match the key and any of the 
            // provided values
        },

        move: function (srcIndex, dstIndex) {
            // Moves an item in the collection from one index to another
        },

        pluck: function (key, unique) {
            // Returns an array of values for each item in the collection matching the key
            // If unique is provided, only unique values will be returned.
        },

        size: function (key, value) {
            if (!arguments.length) {
                // Returns length of collection
            } else {
                // Returns number of objects in the collection matching the key:value pair
            }
        },

        unique: function (varKeys) {
            // Filters the collection to only contain objects which contain unique values
            // for any of the provided values
        },

        value: function (value) {
            if (!arguments.length) {
                // Returns the collection
            } else {
                // Sets the collection
            }
        },

        where: function (key, varValues) {
            // Filters the collection to only include objects matching the key and 
            // any of the provided values
        }
    };

    function ObjectArray() {
        var _array = [];
        
        return mdsol.ArrayBase.call(this, _array);
    }

    return mdsol.Class(ObjectArray, _prototype).valueOf();
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

    return mdsol.SingletonBase(UserSession);
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

        var _requests = {},
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

            if (!mdsol.isEmpty(_requests)) {
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

            if (mdsol.isFunction(callback)) {
                callback(true, data, this.userData, this);
            }
        }

        function onAjaxError(xhr/*, status, err*/) {
            var callback = this.callback;

            updateRequests(this.uuid);

            if (mdsol.isFunction(callback)) {
                callback(false, xhr, this.userData, this);
            }
        }

        return _class(this, _public).valueOf();
    };

    return mdsol.SingletonBase(_class(Handler).extend(_static).valueOf());
} (mdsol));

mdsol.ajax.Method = (function (mdsol, undefined) {
    var BASE_URL = 'http://dlcdkpcs1.ad.mdsol.com/api/Services/';

    var _handler = null,
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
            callback: mdsol.noop,
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
            _public = {
                status: mdsol.BitFlags(_statusFlags, 'NONE'),

                execute: function (/*[callback, ][apiParamVal1][, apiParamVal2][, ...] */) {
                    var handler = _handler || mdsol.ajax.Handler.getInstance(),
                        a = mdsol.makeArray(arguments),
                        o = this.option(),
                        userData = mdsol.clone(o),
                        params = o.params || [],
                        uri,
                        paramObj = {},
                        i, len, data;

                    // TODO: Refactor
                    // Move this to the prototype. In order to do that, we need to wrap the
                    // reference to onCompleted and capture the current value of 'this'.

                    if (a.length && mdsol.isFunction(a[0])) {
                        userData.callback = a.shift();
                    }

                    for (i = 0, len = params.length; i < len; i++) {
                        paramObj[params[i]] = a[i];
                    }

                    uri = BASE_URL + o.service + '.asmx/' + o.method;
                    data = mdsol.toJson(paramObj);

                    handler.post(uri, 'JSON', data, onCompleted, userData);

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
                    data = mdsol.parseJson(data.d);
                } catch (err) {
                    data = null;
                    success = false;
                    error = getExceptionError(xhr, err);
                }

                if (!success) {
                    msgboxOptions.autoSize = false;
                } else if (data && mdsol.isArray(data) && data.length && data[0].error_time) {
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

        mdsol.OptionsBase(this, options);
    
        return _class(this, _public).valueOf();
    }

    Method.statusFlags = _statusFlags;

    mdsol.OptionsBase(Method, _defaultOptions);
    
    return _class(Method, _prototype).valueOf();
} (mdsol));

mdsol.ajax.RequestMethod = (function (mdsol, undefined) {
    var DEFAULT_PARAMS = ['audit_info', 'field_filter'];

    var _class = mdsol.Class,
        _protoPush = Array.prototype.push,
        _ajaxMethod = mdsol.ajax.Method,
        _defaultOptions = mdsol.merge(_ajaxMethod.defaultOptions, { fields: [], audit: false });

    function RequestMethod(options) {
        if (!(this instanceof RequestMethod)) {
            return new RequestMethod(options);
        }

        function createOptions(defaultOptions, o) {
            var params = o ? mdsol.toArray(o.params) : [],
                results = mdsol.merge(_defaultOptions, o || {}, { params: params });

            _protoPush.apply(results.params, DEFAULT_PARAMS);

            return results;
        }

        function createArguments(that, method, args) {
            var audit = that.option('audit'),
                fields = that.options('fields'),
                newArgs = [that, 'execute'];

            // Major performance boost (see http://jsperf.com/arrayconcatvsarraypushapply)
            _protoPush.apply(newArgs, args);
            _protoPush.apply(newArgs, [audit ? 'y' : 'n', fields.join(',')]);

            return newArgs;
        }

        var _public = {
            _setOption: function (key, value) {
                if (key === 'fields') {
                    return mdsol.toArray(value);
                }

                return undefined;
            },

            execute: function (/* [apiParamVal1][, apiParamVal2][, ...] */) {
                var a = createArguments(this, 'execute', mdsol.makeArray(arguments));

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

    var _class = mdsol.Class,
        _protoPush = Array.prototype.push;

    function UpsertMethod(options) {
        if (!(this instanceof UpsertMethod)) {
            return new UpsertMethod(options);
        }

        var _options = mdsol.clone(options),
            _public = {
                execute: function (/* [apiParamVal1][, apiParamVal2][, ...] */) {
                    var token = ctms.userSession.dbUser.session_id,
                        fieldData = '', newArgs = [this, 'execute'];

                    if (arguments.length && !mdsol.isFunction(arguments[0])) {
                        fieldData = arguments[0];
                        _protoPush.apply(newArgs, arguments);
                    }

                    // Major performance boost (see http://jsperf.com/arrayconcatvsarraypushapply)
                    _protoPush.apply(newArgs, [token, fieldData]);

                    return _class.base.apply(this, newArgs);
                },

                dispose: function () {
                    // Perform any cleanup
                }
            };

        // Force option 'params' to an array and add the default request parameters
        _options.params = mdsol.toArray(_options.params);
        _protoPush.apply(_options.params, DEFAULT_PARAMS);

        return _class(this, _public)
            .base(_options)
            .valueOf();
    };

    return _class(UpsertMethod)
        .inherits(mdsol.ajax.Method)
        .valueOf();
} (mdsol));

mdsol.ui.NavigationBar = (function (mdsol, undefined) {
    //"use strict";

    function NavigationBar() {
        var _public = {
            dispose: function () {
                // Perform any cleanup
            }
        };

        return mdsol.Class(this, _public).valueOf();
    };

    return mdsol.SingletonBase(NavigationBar);
} (mdsol));

mdsol.ui.SchemaCanvas = (function (mdsol, undefined) {
    //"use strict";

    function SchemaCanvas() {
        var _public = {
            dispose: function () {
                // Perform any cleanup
            }
        };

        return mdsol.Class(this, _public).valueOf();
    };

    return mdsol.SingletonBase(SchemaCanvas);
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


