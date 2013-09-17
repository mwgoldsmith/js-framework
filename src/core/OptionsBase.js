/*global isPlainObject,isObject,isFunction,isString*/
define([
    '../core'
], function (mdsol) {
    mdsol.OptionsBase = (function () {
        // TODO: Cleanup
        // There are a number of things about this object I don't like.
        // For now, as long as it works leave it alone.

        function OptionsBase(obj, options) {
            var _isInstance = !isPlainObject(obj) && isObject(obj),
                _isConstructor = !_isInstance && isFunction(obj),
                _option = function (/* [key] | [key, value] | [object] */) {
                    var o = this._options,
                        setter = this._setOption,
                        key, value, p, ret;

                    if (arguments.length) {
                        key = arguments[0];
                        if (isString(key)) {
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

                for (c = obj; c;) {
                    if (c.hasOwnProperty('_options')) {
                        break;
                    }

                    c = Object.getPrototypeOf(c);
                }

                if (c) {
                    opts = c._options || {};
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
    } ());
});
