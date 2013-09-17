/*global clone,isFunction,toArray*/
define([
    '../core',
    '../var/push',
    './Method',
    '../session',
    '../core/Class'
], function (mdsol, push) {
    // NOTE: This requires mdsol.session, which is not yet implemented
    
    mdsol.ajax.UpsertMethod = (function () {
        var DEFAULT_PARAMS = ['session_id', 'field_data'];

        function UpsertMethod(options) {
            if (!(this instanceof UpsertMethod)) {
                return new UpsertMethod(options);
            }

            var _options = clone(options),
                _public = {
                    execute: function (/* [apiParamVal1][, apiParamVal2][, ...] */) {
                        // TODO: Check that we are correctly referencing the session ID
                        var token = mdsol.session.dbUser.session_id,
                            fieldData = '', newArgs = [this, 'execute'];

                        if (arguments.length && !isFunction(arguments[0])) {
                            fieldData = arguments[0];
                            push.apply(newArgs, arguments);
                        }

                        // Major performance boost (see http://jsperf.com/arrayconcatvsarraypushapply)
                        push.apply(newArgs, [token, fieldData]);

                        return mdsol.Class.base.apply(this, newArgs);
                    },

                    dispose: function () {
                        // Perform any cleanup
                    }
                };

            // Force option 'params' to an array and add the default request parameters
            _options.params = toArray(_options.params);
            push.apply(_options.params, DEFAULT_PARAMS);

            return mdsol.Class(this, _public)
                .base(_options)
                .valueOf();
        }

        return mdsol.Class(UpsertMethod)
            .inherits(mdsol.ajax.Method)
            .valueOf();
    } ());
});