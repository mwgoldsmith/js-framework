define([
    '../core',
    '../var/push',
    './Method',
    '../core/Class'
], function (mdsol, push) {
    mdsol.ajax.RequestMethod = (function () {
        var DEFAULT_PARAMS = ['audit_info', 'field_filter'];

        function audit(value) {
            if (!arguments.length) {
                return this._audit;
            }

            this._audit = !!value;

            return this;
        }

        function fields(/* varArgs */) {
            var value;

            if (!arguments.length) {
                return this._fields;
            }

            if (arguments.length === 1) {
                value = arguments[0];
                value = value === null ? [] : toArray(value);
            } else {
                value = makeArray(arguments);
            }
            
            this._fields = value;
            
            return this;
        }

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
            var args = makeArray(arguments);

            push.apply(args, [this._audit ? 'y' : 'n', this._fields.join(',')]);

            return this.base.apply(this, args);
        }

        function dispose() {
            // TODO: Implement
        }

        function RequestMethod(service, method, reqParams) {
            if (!(this instanceof RequestMethod)) {
                return new RequestMethod(service, method, reqParams);
            }

            return extend(this, {
                    _audit: false,

                    _fields: []
                })
                .base(service, method)
                .params(reqParams || []);
        }

        return mdsol.Class(RequestMethod, {
                audit: audit,

                fields: fields,

                params: params,

                execute: execute,

                dispose: dispose
            })
            .inherits(mdsol.ajax.Method)
            .valueOf();
    } ());
});