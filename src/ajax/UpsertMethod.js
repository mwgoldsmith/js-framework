define([
    '../core',
    '../var/push',
    './Method',
    '../session',
    '../core/Class'
], function (mdsol, push) {
    mdsol.ajax.UpsertMethod = (function () {
        var DEFAULT_PARAMS = ['session_id', 'field_data'];

        function params() {
            var curParams, value,
                args;

            if (!arguments.length) {
                curParams = this.base();

                // Get params from base; exclude defaul parameters
                return curParams.filter(function (el/*, idx, arr*/) {
                    return DEFAULT_PARAMS.indexOf(el) === -1;
                });
            }

            if (arguments.length === 1) {
                value = arguments[0];
                args = value === null ? [] : toArray(value);
            } else {
                args = makeArray(arguments);
            }

            push.apply(args, DEFAULT_PARAMS);

            return this.base.apply(this, args);
        }

        function execute(/* [apiParamVal1][, apiParamVal2][, ...] */) {
            // TODO: Check that we are correctly referencing the session ID
            var token = mdsol.session.dbUser.session_id,
                fieldData = '',
                args = [];

            if (arguments.length && !isFunction(arguments[0])) {
                fieldData = arguments[0];
                push.apply(args, arguments);
            }

            push.apply(args, [token, fieldData]);

            return this.base.apply(this, args);
        }

        function UpsertMethod(service, method, upParams) {
            if (!(this instanceof UpsertMethod)) {
                return new UpsertMethod(service, method, upParams);
            }

            function dispose() {
                // Perform any cleanup
            }

            return extend(this, {
                dispose: dispose
            })
                .base(service, method)
                .params(upParams || []);
        }

        return mdsol.Class(UpsertMethod, {
            params: params,

            execute: execute
        })
            .inherits(mdsol.ajax.Method)
            .valueOf();
    } ());
});