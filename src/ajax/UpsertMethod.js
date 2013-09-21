/*global clone,isFunction,toArray*/
define([
    '../core',
    '../var/push',
    './Method',
    '../session',
    '../core/Class'
], function (mdsol, push) {
    mdsol.ajax.UpsertMethod = (function () {
        var DEFAULT_PARAMS = ['session_id', 'field_data'];

        function UpsertMethod(service, method, params) {
            if (!(this instanceof UpsertMethod)) {
                return new UpsertMethod(service, method, params);
            }

            var _public = {
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
                    // TODO: Check that we are correctly referencing the session ID
                    var token = mdsol.session.dbUser.session_id,
                        fieldData = '',
                        args = [this];

                    if (arguments.length && !isFunction(arguments[0])) {
                        fieldData = arguments[0];
                        push.apply(args, arguments);
                    }

                    push.apply(args, [token, fieldData]);

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

        return mdsol.Class(UpsertMethod)
            .inherits(mdsol.ajax.Method)
            .valueOf();
    } ());
});