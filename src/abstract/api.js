define([
    '../core'
], function (mdsol) {
    mdsol.Class.namespace('mdsol.abstract', {
        api: (function () {
            function apiGetMethod(name) {
                var methods = this._methods;
                
                if (!methods) {
                    this._methods = methods = {};
                }

                if (!methods.hasOwnProperty(name)) {
                    throw new Error('Unknown method: "' + name + '"');
                }

                return methods[name];
            }

            function apiMethods(value) {
                if (!arguments.length) {
                    return this._methods || {};
                }

                this._methods = value;

                return this;
            }

            return {
                apiMethods: apiMethods,

                apiGetMethod: apiGetMethod
            };
        } ())
    });
});
