define([
    '../core'
], function (mdsol) {
    mdsol.Class = (function (undefined) {
        function inherits(child, base) {
            child.parent = base.prototype;
            child.prototype = extend(Object.create(base.prototype), child.prototype);
            child.prototype.constructor = child;

            return child;
        }

        function Class(obj, proto) {
            var _class = obj,
                _isInstance = !isPlainObject(obj) && isObject(_class),
                _isConstructor = !_isInstance && isFunction(_class),
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
});