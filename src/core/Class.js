define([
    '../core'
], function (mdsol) {
    mdsol.Class = (function () {
        function inherits(child, parent) {
            child.parent_ = parent.prototype;
            child.prototype = extend(Object.create(parent.prototype), child.prototype);
            child.prototype.constructor = child;

            return child;
        }

        function base(/* [, argA[, argB[, ...]]] */) {
            var caller = arguments.callee.caller,
                target, that, f,
                baseProto, baseFunc;

            if (mdsol.DEBUG && !caller) {
                throw new Error('base() cannot run in strict mode: arguments.caller not defined.');
            }

            // Ugliy fix for the fact that both Class.base() and Class().base() call
            // this function using apply(). We need the function which called that
            // method.
            caller = caller.caller;

            // If this is not a constructor, call the superclass method
            if (!caller.parent_) {
                return caller.super_.apply(this, arguments);
            }

            target = caller.parent_.constructor;
            baseProto = this;

            // Walk the prototype chain until we find [[Prototype]]
            // for the base
            while (baseProto) {
                if (baseProto.constructor === target) {
                    break;
                }

                baseProto = Object.getPrototypeOf(baseProto);
            }

            // Call the base class constructor in the context of its own
            // [[Prototype]]. NOTE: This will cause the base constructor
            // to fail to recognize it is instantiated using instanceof.
            that = target.apply(baseProto, arguments);
            if (that !== undefined) {
                // Allow return value to override value of `this` to be
                // consistant with typical constructor behaviour. See:
                // http://www.ecma-international.org/ecma-262/5.1/#sec-13.2.2
                // If the constructor returned a value for `this`, it is
                // safe to assume it auto-instantiated. To preserve any
                // public members exposed, move them to the [[Prototype]]
                // of base.
                extend(baseProto, that);
            }

            // Set a reference to the super method for each method on the
            // object which also exists on the base. This way, every call
            // to base() from a method will just need to retreive that 
            // value instead of finding the base proto first.
            for (f in this) {
                baseFunc = isFunction(this[f]) && baseProto[f];
                if (isFunction(baseFunc)) {
                    this[f].super_ = baseFunc;
                }
            }

            return this;
        }

        function Class(obj, proto) {
            var _class = obj,
                _isInstance = !isPlainObject(obj) && isObject(_class),
                _isConstructor = !_isInstance && isFunction(_class),
                _public = {
                    mixin: function (/*sourceA [, sourceB[, ...]] */) {
                        var a = makeArray(arguments),
                            mixer;

                        // See http://jsperf.com/mixin-fun/2
                        while (a.length) {
                            mixer = a.shift();
                            if (!mixer || !(isFunction(mixer) || isObject(mixer))) {
                                throw new Error('Invalid data type for mixin.');
                            }

                            mixer.call(_class.prototype);
                        }

                        return _public;
                    },

                    inherits: function (baseConstructor) {
                        if (_isInstance) {
                            throw new Error('An already instantiated object cannot inherit from another object.');
                        } else if (!base || !isFunction(baseConstructor)) {
                            throw new Error('Invalid base constructor.');
                        }

                        inherits(_class, baseConstructor);

                        return _public;
                    },

                    extend: function (members) {
                        var target = _isConstructor ? _class : _class.constructor;

                        extend(true, target, members);

                        return _public;
                    },

                    base: function () {
                        _class = base.apply(_class, arguments);
                        return _public;
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

        return extend(Class, {
            inherits: inherits,

            base: function (that) {
                return base.apply(that, makeArray(arguments, 1));
            }
        });
    } ());
});