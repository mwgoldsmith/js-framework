define([
    '../core',
    '../var/push',
    './Method',
    '../core/Class'
], function (mdsol, push) {
    mdsol.ajax.RequestMethod = (function (undefined) {
        var DEFAULT_PARAMS = ['audit_info', 'field_filter'],
            _defaultOptions = merge(mdsol.ajax.Method.defaultOptions, { fields: [], audit: false });

        function RequestMethod(options) {
            if (!(this instanceof RequestMethod)) {
                return new RequestMethod(options);
            }

            function createOptions(defaultOptions, o) {
                var params = o ? toArray(o.params) : [],
                    results = merge(_defaultOptions, o || {}, { params: params });

                push.apply(results.params, DEFAULT_PARAMS);

                return results;
            }

            function createArguments(that, method, args) {
                var audit = that.option('audit'),
                    fields = that.options('fields'),
                    newArgs = [that, 'execute'];
                
                // Major performance boost (see http://jsperf.com/arrayconcatvsarraypushapply)
                push.apply(newArgs, args);
                push.apply(newArgs, [audit ? 'y' : 'n', fields.join(',')]);

                return newArgs;
            }

            var _public = {
                _setOption: function (key, value) {
                    if (key === 'fields') {
                        return toArray(value);
                    }

                    return undefined;
                },

                execute: function (/* [apiParamVal1][, apiParamVal2][, ...] */) {
                    var a = createArguments(this, 'execute', makeArray(arguments));

                    return mdsol.Class.base.apply(this, a);
                },

                dispose: function () {
                    // Perform any cleanup
                }
            };

            return mdsol.Class(this, _public)
                .base(createOptions(_defaultOptions, options))
                .valueOf();
        };

        return mdsol.Class(RequestMethod).inherits(mdsol.ajax.Method).valueOf();
    } ());
});