/*global noop,makeArray,clone,isFunction,isArray,extend*/
define([
    '../core',
    '../ajax',
    '../core/BitFlags',
    '../ui/MessageBox'
], function (mdsol) {
    mdsol.ajax.Method = (function () {
        var BASE_URL = 'http://dlcdkpcs1.ad.mdsol.com/api/Services/',
            _statusFlags = {
                NONE: 0,                // The method has not yet executed
                EXECUTING: 0x01,        // The method is currently executing
                COMPLETED: 0x02,        // The method has completed execution
                SUCCESS: 0x02 | 0x10,   // The method has completed successfully
                FAILED: 0x02 | 0x20     // The method has completed with errors
            };

        function service(value) {
            if (!arguments.length) {
                return this._service;
            }

            this._service = value;

            return this;
        }

        function method(value) {
            if (!arguments.length) {
                return this._method;
            }

            this._method = value;

            return this;
        }

        function params() {
            var value;

            if (!arguments.length) {
                return this._params;
            }

            if (arguments.length === 1) {
                value = arguments[0];
                this._params = value === null ? [] : toArray(value);
            } else {
                this._params = makeArray(arguments);
            }

            return this;
        }

        function callback(value) {
            if (!arguments.length) {
                return this._callback;
            }

            this._callback = isFunction(value) ? value : null;

            return this;
        }

        function execute(/*[callback, ][apiParamVal1][, apiParamVal2][, ...] */) {
            var a = makeArray(arguments),
                self = this,
                handler = this._callback,
                parameters = this._params,
                paramObj = {},
                uri, data,
                i, len;

            if (a.length && isFunction(a[0])) {
                handler = a.shift();
            }

            if (parameters.length !== a.length) {
                throw new Error('Invalid argument count for Method.');
            }

            for (i = 0, len = parameters.length; i < len; i++) {
                paramObj[parameters[i]] = a[i];
            }

            uri = BASE_URL + this._service + '.asmx/' + this._method;
            data = mdsol.toJson(paramObj);

            mdsol.ajax.post(uri, 'JSON', data, function () {
                return onCompleted.apply(self, arguments);
            }, handler);

            return this;
        }

        function dispose() {
            // Perform any cleanup
            return this;
        }

        function onCompleted(success, data, handler, xhr) {
            var error = null,
                buttonEnum = mdsol.ui.MessageBox.buttonEnum,
                msgboxOptions = {
                    buttons: buttonEnum.OK,
                    title: 'An error occured',
                    visible: true,
                    autoSize: true
                };

            this.status.value('COMPLETED', success ? 'SUCCESS' : 'FAILED');

            if (!success) {
                error = parseServerError(xhr, data);
            } else {
                try {
                    data = mdsol.parseJson(data.d);
                } catch (err) {
                    data = null;
                    success = false;
                    error = getExceptionError(xhr, err);
                }

                if (!success) {
                    msgboxOptions.autoSize = false;
                } else if (data && isArray(data) && data.length && data[0].error_time) {
                    error = parseServiceError(xhr, data);
                }

                if (isFunction(handler)) {
                    handler(success, data, this);
                }
            }

            if (error) {
                msgboxOptions.text = error;
                mdsol.ui.MessageBox(msgboxOptions);
            }

            return true;
        }

        function errorLine(name, message, rawText) {
            var line = '<div><span style="width: 100px; display: inline-block; font-weight: bold;">' +
                name + '</span>';

            if (rawText) {
                return line + '</div><br /><pre>' + message + '</pre><br />';
            }

            return line + message + '</div>';
        }

        function parseServiceError(xhr, data) {
            var message = '',
                i, len, item;

            message += 'The following errors occured while proccessing a request:<br /><br />' +
                errorLine('URL:', xhr.url) + '<br />';

            for (i = 0, len = data.length; i < len; i++) {
                item = data[i];

                if (item.error_time && item.message) {
                    message += errorLine('Time:', item.error_time) + errorLine('Message:', item.message) + '<br />';
                }
            }

            return '<div style="text-align:left;padding-left: 5px;padding-right: 5px;">' + message + '</div>';
        }

        function parseServerError(xhr, data) {
            var message, a, b, item;

            message = '<div style="text-align:left;padding-left: 5px;padding-right: 5px;">' +
                data.statusText + '<br /><br />' +
                errorLine('URL:', xhr.url) + '<br />';

            try {
                if (data.responseText.substring(0, '<!DOCTYPE html>'.length) === '<!DOCTYPE html>') {
                    a = data.responseText.indexOf('<!--') + '<!--'.length;
                    b = data.responseText.indexOf('-->', a);
                    message += errorLine('Response:', data.responseText.substr(a, b), true);
                } else {
                    // TODO: Move away from the evil eval
                    data = eval('[' + data.responseText.replace(/\\r/g, '\\\\r').replace(/\\n/g, '\\\\n') + ']');

                    for (item in data[0]) {
                        if (data[0].hasOwnProperty(item)) {
                            a = data[0][item];
                            if (a.indexOf('\\r') !== -1 || a.indexOf('\\n') !== -1) {
                                a = a.replace(/\\r/g, '\r').replace(/\\n/g, '\n');
                                message += errorLine(item, a, true);
                            } else {
                                message += errorLine(item, a);
                            }
                        }
                    }
                }

                message += '<br /></div>';
            } catch (err) {
                message += errorLine('Response:', data);
            }

            return message;
        }

        function getExceptionError(xhr, error) {
            return '<div style="text-align:left;padding-left: 5px;padding-right: 5px;">' +
                'Failed to parse data from server!<br /><br />' +
                errorLine('URL:', xhr.url) + '<br />' +
                errorLine('Message:', error) + '<br /></div>';
        }

        function Method(serviceName, methodName, parameters) {
            if (!(this instanceof Method)) {
                return new Method(serviceName, methodName, parameters);
            }

            return extend(this, {
                _service: serviceName || null,

                _method: methodName || null,

                _params: toArray(parameters) || [],

                _callback: noop,

                status: mdsol.BitFlags(_statusFlags, 'NONE')
            });
        }

        Method.statusFlags = _statusFlags;

        return mdsol.Class(Method, {
            service: service,

            method: method,

            params: params,

            callback: callback,

            execute: execute,

            dispose: dispose
        }).valueOf();
    } ());
});