define([
    '../core'
], function (mdsol) {
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
});
