define([
    '../core',
    '../core/BitFlags',
    '../core/OptionsBase',
    '../ajax'
], function (mdsol) {
    // NOTE: Requires mdsol.ui.MessageBox, which has not yet been implemented

    mdsol.ajax.Method = (function (undefined) {
        var BASE_URL = 'http://dlcdkpcs1.ad.mdsol.com/api/Services/',
            _statusFlags = {
                NONE: 0,                // The method has not yet executed
                EXECUTING: 0x01,        // The method is currently executing
                COMPLETED: 0x02,        // The method has completed execution
                SUCCESS: 0x02 | 0x10,   // The method has completed successfully
                FAILED: 0x02 | 0x20     // The method has completed with errors
            },
            _defaultOptions = {
                service: null,
                method: null,
                params: null,
                callback: noop,
                userData: null
            };

        function Method(options) {
            if (!(this instanceof Method)) {
                return new Method(options);
            }

            var _self = this,
                _public = {
                    status: mdsol.BitFlags(_statusFlags, 'NONE'),

                    execute: function (/*[callback, ][apiParamVal1][, apiParamVal2][, ...] */) {
                        var a = makeArray(arguments),
                            o = this.option(),
                            userData = clone(o),
                            params = o.params || [],
                            uri,
                            paramObj = {},
                            i, len, data;

                        // TODO: Refactor
                        // Move this to the prototype. In order to do that, we need to wrap the
                        // reference to onCompleted and capture the current value of `this`.

                        if (a.length && isFunction(a[0])) {
                            userData.callback = a.shift();
                        }

                        for (i = 0, len = params.length; i < len; i++) {
                            paramObj[params[i]] = a[i];
                        }

                        uri = BASE_URL + o.service + '.asmx/' + o.method;
                        data = mdsol.toJson(paramObj);

                        mdsol.ajax.post(uri, 'JSON', data, onCompleted, userData);

                        return this;
                    },

                    dispose: function () {
                        // Perform any cleanup
                        return this;
                    }
                };

            function onCompleted(success, data, params, xhr) {
                var error = null, e,
                    buttonEnum = mdsol.ui.MessageBox.buttonEnum,
                    msgboxOptions = {
                        buttons: buttonEnum.OK,
                        title: 'An error occured',
                        visible: true,
                        autoSize: true
                    };

                _self.option('status', ['COMPLETED', success ? 'SUCCESS' : 'FAILED']);

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
                    } else {
                        e = $.Event(this.eventName, { xhrMethod: _self, params: params });
                        if (this.callback) {
                            this.callback(e, success, data);
                        }
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

            // TODO: Cleanup
            // Something needs to be changed about this. Not sure if it just the name,
            // but its not clear what is being done
            mdsol.OptionsBase(this, options);

            return extend(this, _public);
        }

        Method.statusFlags = _statusFlags;

        // TODO: Cleanup
        // Something needs to be changed about this. Not sure if it just the name,
        // but its not clear what is being done
        mdsol.OptionsBase(Method, _defaultOptions);

        return Method;
    } ());
});