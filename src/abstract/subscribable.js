define([
    '../core'
], function (mdsol) {
    mdsol.Class.namespace('mdsol.abstract', {
        subscribable: (function () {
            function subscribe(msg, func, priority) {
                var m = this._messages;

                if (!isString(msg) || !isFunction(func)) {
                    throw new TypeError('Invalid data type for subscription message or callback');
                }

                if (!m) {
                    this._messages = m = {};
                }

                if (!m[msg]) {
                    m[msg] = [];
                }

                m[msg].push({ priority: priority || 0, callback: func });

                return this;
            }

            function unsubscribe(msg, func) {
                var m = this._messages,
                    i;

                if (!isString(msg) || (func && !isFunction(func))) {
                    throw new TypeError('Invalid data type for subscription message or callback');
                }

                if (!m) {
                    this._messages = m = {};
                }

                if (!m.hasOwnProperty(msg)) {
                    throw new Error('Message does not exist.');
                }

                if (!func) {
                    delete m[msg];
                } else {
                    m = m[msg];
                    for (i = m.length; i--; ) {
                        if (m[i].func === func) {
                            m.splice(i, 1);
                            break;
                        }
                    }
                }

                return this;
            }

            function publish(msg, data) {
                var m = this._messages,
                    subscribers,
                    msgData = data,
                    result,
                    s;

                if (!isString(msg)) {
                    throw new TypeError('Invalid data type for subscription message');
                }

                if (!m) {
                    this._messages = m = {};
                }

                // Sort the subscribers by priority
                subscribers = clone(m[msg])
                    .sort(function (a, b) {
                        return (a.priority > b.priority)
                            ? 1
                            : (a.priority < b.priority)
                                ? -1
                                : 0;
                    });

                // Notify each subscriber
                while (subscribers.length) {
                    s = subscribers.pop();

                    // If the subscriber returns a value, use that as `data` for the
                    // remaining subscribers.
                    result = s.func(msg, msgData);
                    if (result !== undefined) {
                        msgData = result;
                    }
                }

                return msgData;
            }

            return {
                subscribe: subscribe,

                unsubscribe: unsubscribe,

                publish: publish
            };
        } ())
    });
});
