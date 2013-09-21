/*global merge,toArray,makeArray*/
define([
    '../core',
    '../var/push',
    './Method',
    '../core/Class'
], function (mdsol, push) {
    mdsol.ajax.RequestMethod = (function () {
        var DEFAULT_PARAMS = ['audit_info', 'field_filter'];

        function RequestMethod(service, method, params) {
            if (!(this instanceof RequestMethod)) {
                return new RequestMethod(service, method, params);
            }

            var _audit = false,
                _fields = [],
                _public = {
                    audit: function (value) {
                        if (!arguments.length) {
                            return _audit;
                        }

                        _audit = !!value;

                        return this;
                    },

                    fields: function (/* varArgs */) {
                        var value;

                        if (!arguments.length) {
                            return _fields;
                        }

                        if (arguments.length === 1) {
                            value = arguments[0];
                            _fields = value === null ? [] : toArray(value);
                        } else {
                            _fields = makeArray(arguments);
                        }

                        return this;
                    },

                    params: function () {
                        var curParams, value,
                            args = [this];

                        if (!arguments.length) {
                            curParams = mdsol.Class.base(this);

                            // Get params from base; exclude defaul parameters
                            return curParams.filter(function (el/*, idx, arr*/) {
                                return DEFAULT_PARAMS.indexOf(el) === -1;
                            });
                        }

                        if (arguments.length === 1) {
                            value = arguments[0];
                            if (value !== null) {
                                push.apply(args, toArray(value));
                            }
                        } else {
                            push.apply(args, arguments);
                        }

                        push.apply(args, DEFAULT_PARAMS);

                        return mdsol.Class.base.apply(this, args);
                    },

                    execute: function (/* [apiParamVal1][, apiParamVal2][, ...] */) {
                        var args = [this];

                        push.apply(args, arguments);
                        push.apply(args, [_audit ? 'y' : 'n', _fields.join(',')]);

                        return mdsol.Class.base.apply(this, args);
                    },

                    dispose: function () {
                        // Perform any cleanup
                    }
                };

            return mdsol.Class(this, _public)
                .base(service, method, toArray(params).concat(DEFAULT_PARAMS))
                .valueOf();
        }

        return mdsol.Class(RequestMethod).inherits(mdsol.ajax.Method).valueOf();
    } ());
});