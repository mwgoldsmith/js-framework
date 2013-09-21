define([
    '../core',
    '../data',
    '../core/Class',
    '../core/ObjectArray'
], function (mdsol) {
    mdsol.data.RemoteData = (function () {
        function RemoteData(dataTemplate, dataMethods, loadMethod, saveMethod) {
            if (!(this instanceof RemoteData)) {
                return new RemoteData(dataTemplate, dataMethods, loadMethod, saveMethod);
            }

            var _template = dataTemplate,
                _methods = dataMethods,
                _loadMethod = loadMethod,
                _saveMethod = saveMethod;

            function template(value) {
                if (!arguments.length) {
                    return _template;
                }

                _template = value;

                return mdsol;
            }

            function methods(value) {
                if (!arguments.length) {
                    return _methods;
                }

                _methods = value;

                return mdsol;
            }

            function load() {

            }

            function save() {

            }

            function getMethod() {

            }

            function dispose() {

            }

            return mdsol.Class(extend(this, {
                template: template,

                methods: methods,

                load: load,

                save: save,

                getMethod: getMethod,

                dispose: dispose
            })).base().valueOf();
        }

        return mdsol.Class(RemoteData).inherits(mdsol.ObjectArray).valueOf();
    } ());
});