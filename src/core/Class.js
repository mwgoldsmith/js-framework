define([
    '../core',
    '../var/global'
], function (mdsol, global) {
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
});