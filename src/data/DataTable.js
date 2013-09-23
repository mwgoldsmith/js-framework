define([
    '../core',
    './data',
    '../session',
    '../abstract/api',
    '../core/Class',
    '../core/ObjectArray'
], function (mdsol) {
    mdsol.data.DataTable = (function () {
        function load() {
            var method = this.apiGetMethod(this._loadMethod);

            if (method) {
                method.callback(onLoaded);

                if (!arguments.length) {
                    method.execute();
                } else {
                    method.execute.apply(method, arguments);
                }
            }

            return this;
        }

        function save() {
            var method = this.apiGetMethod(this._saveMethod);

            if (method) {
                method.callback(onSaved);

                if (!arguments.length) {
                    method.execute();
                } else {
                    method.execute.apply(method, arguments);
                }
            }

            return this;
        }

        function template(value) {
            if (!arguments.length) {
                return this._template;
            }

            this._template = value;

            return mdsol;
        }

        function onLoaded(success, data, xhrRequest) {
            var messageData = { success: success, data: data, canceled: false };

            messageData = this.publish('onLoaded', messageData);
            if (!messageData.canceled) {
                // TODO: Import the data

                this.publish('afterLoaded', messageData);
            }
        }

        function onSaved(success, data, xhrUpsert) {
            var messageData = { success: success, data: data, canceled: false };

            messageData = this.publish('onSaved', messageData);
            if (!messageData.canceled) {
                // TODO: Reconcile the data

                this.publish('afterSaved', messageData);
            }
        }

        function DataTable(dataTemplate, dataMethods, loadMethod, saveMethod) {
            if (!(this instanceof DataTable)) {
                return new DataTable(dataTemplate, dataMethods, loadMethod, saveMethod);
            }

            this.apiMethods(dataMethods);

            mdsol.session.subscribe('afterLogout', onLogout);

            function dispose() {

            }

            function onLogout() {
                // Reset all data
            }

            return extend(this, {
                _loadMethod: loadMethod,
                
                _saveMethod: saveMethod,
                
                _template: dataTemplate || {},
                
                template: template,

                dispose: dispose
            }).base();
        }

        return mdsol.Class(DataTable, {
                template: template,
            
                load: load,
            
                save: save
            })
            .implement('api')
            .inherits(mdsol.ObjectArray)
            .valueOf();
    } ());
});