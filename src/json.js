// @DONE (2013-09-12 18:25)
define([
    './core',
    './var/global',
    './var/hasOwnProperty'
], function (mdsol, global, hasOwnProperty) {
    var parseJson = (function () {
        /*
        * https://github.com/douglascrockford/JSON-js/blob/master/json_parse_state.js
        */

        var _state,
            _stack,
            _container,
            _key,
            _value,
            _escapes = {
                '\\': '\\',
                '"': '"',
                '/': '/',
                't': '\t',
                'n': '\n',
                'r': '\r',
                'f': '\f',
                'b': '\b'
            },
            _string = {
                go: function () {
                    _state = 'ok';
                },
                firstokey: function () {
                    _key = _value;
                    _state = 'colon';
                },
                okey: function () {
                    _key = _value;
                    _state = 'colon';
                },
                ovalue: function () {
                    _state = 'ocomma';
                },
                firstavalue: function () {
                    _state = 'acomma';
                },
                avalue: function () {
                    _state = 'acomma';
                }
            },
            _number = {
                go: function () {
                    _state = 'ok';
                },
                ovalue: function () {
                    _state = 'ocomma';
                },
                firstavalue: function () {
                    _state = 'acomma';
                },
                avalue: function () {
                    _state = 'acomma';
                }
            },
            _action = {
                '{': {
                    go: function () {
                        _stack.push({ state: 'ok' });
                        _container = {};
                        _state = 'firstokey';
                    },
                    ovalue: function () {
                        _stack.push({ container: _container, state: 'ocomma', key: _key });
                        _container = {};
                        _state = 'firstokey';
                    },
                    firstavalue: function () {
                        _stack.push({ container: _container, state: 'acomma' });
                        _container = {};
                        _state = 'firstokey';
                    },
                    avalue: function () {
                        _stack.push({ container: _container, state: 'acomma' });
                        _container = {};
                        _state = 'firstokey';
                    }
                },
                '}': {
                    firstokey: function () {
                        var pop = _stack.pop();
                        _value = _container;
                        _container = pop.container;
                        _key = pop.key;
                        _state = pop.state;
                    },
                    ocomma: function () {
                        var pop = _stack.pop();
                        _container[_key] = _value;
                        _value = _container;
                        _container = pop.container;
                        _key = pop.key;
                        _state = pop.state;
                    }
                },
                '[': {
                    go: function () {
                        _stack.push({ state: 'ok' });
                        _container = [];
                        _state = 'firstavalue';
                    },
                    ovalue: function () {
                        _stack.push({ container: _container, state: 'ocomma', key: _key });
                        _container = [];
                        _state = 'firstavalue';
                    },
                    firstavalue: function () {
                        _stack.push({ container: _container, state: 'acomma' });
                        _container = [];
                        _state = 'firstavalue';
                    },
                    avalue: function () {
                        _stack.push({ container: _container, state: 'acomma' });
                        _container = [];
                        _state = 'firstavalue';
                    }
                },
                ']': {
                    firstavalue: function () {
                        var pop = _stack.pop();
                        _value = _container;
                        _container = pop.container;
                        _key = pop.key;
                        _state = pop.state;
                    },
                    acomma: function () {
                        var pop = _stack.pop();
                        _container.push(_value);
                        _value = _container;
                        _container = pop.container;
                        _key = pop.key;
                        _state = pop.state;
                    }
                },
                ':': {
                    colon: function () {
                        if (Object.hasOwnProperty.call(_container, _key)) {
                            throw new SyntaxError('Duplicate key "' + _key + '"');
                        }
                        _state = 'ovalue';
                    }
                },
                ',': {
                    ocomma: function () {
                        _container[_key] = _value;
                        _state = 'okey';
                    },
                    acomma: function () {
                        _container.push(_value);
                        _state = 'avalue';
                    }
                },
                'true': {
                    go: function () {
                        _value = true;
                        _state = 'ok';
                    },
                    ovalue: function () {
                        _value = true;
                        _state = 'ocomma';
                    },
                    firstavalue: function () {
                        _value = true;
                        _state = 'acomma';
                    },
                    avalue: function () {
                        _value = true;
                        _state = 'acomma';
                    }
                },
                'false': {
                    go: function () {
                        _value = false;
                        _state = 'ok';
                    },
                    ovalue: function () {
                        _value = false;
                        _state = 'ocomma';
                    },
                    firstavalue: function () {
                        _value = false;
                        _state = 'acomma';
                    },
                    avalue: function () {
                        _value = false;
                        _state = 'acomma';
                    }
                },
                'null': {
                    go: function () {
                        _value = null;
                        _state = 'ok';
                    },
                    ovalue: function () {
                        _value = null;
                        _state = 'ocomma';
                    },
                    firstavalue: function () {
                        _value = null;
                        _state = 'acomma';
                    },
                    avalue: function () {
                        _value = null;
                        _state = 'acomma';
                    }
                }
            };

        function debackslashify(text) {
            // Remove and replace any backslash escapement.

            return text.replace(/\\(?:u(.{4})|([^u]))/g, function (a, b, c) {
                return b ? String.fromCharCode(parseInt(b, 16)) : _escapes[c];
            });
        }

        return function (source, reviver) {
            var r,
                tx = /^[\x20\t\n\r]*(?:([,:\[\]{}]|true|false|null)|(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|"((?:[^\r\n\t\\\"]|\\(?:["\\\/trnfb]|u[0-9a-fA-F]{4}))*)")/;

            _state = 'go';
            _stack = [];

            try {
                for (; ; ) {
                    r = tx.exec(source);
                    if (!r) {
                        break;
                    }

                    if (r[1]) {
                        _action[r[1]][_state]();
                    } else if (r[2]) {
                        _value = +r[2];
                        _number[_state]();
                    } else {
                        _value = debackslashify(r[3]);
                        _string[_state]();
                    }

                    source = source.slice(r[0].length);
                }

            } catch (e) {
                _state = e;
            }

            if (_state !== 'ok' || /[^\x20\t\n\r]/.test(source)) {
                throw _state instanceof SyntaxError ? _state : new SyntaxError('JSON');
            }

            return typeof reviver === 'function' ? (function walk(holder, key) {
                var k, v, value = holder[key];

                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            } ({ '': _value }, '')) : _value;
        };
    } ());

    var toJson = (function () {
        /*
        * Derived from https://github.com/douglascrockford/JSON-js/blob/master/json2.js
        */

        var escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap = '',
            indent = '',
            meta = {
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"': '\\"',
                '\\': '\\\\'
            },
            rep;

        function fmtDigit(n) {
            return n < 10 ? '0' + n : n;
        }

        function quote(string) {
            escapable.lastIndex = 0;

            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];

                return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }

        function str(key, holder) {
            var i, k, v,
                length,
                partial,
                mind = gap,
                value = holder[key];

            if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

            switch (typeof value) {
                case 'string':
                    return quote(value);

                case 'number':
                    return isFinite(value) ? String(value) : 'null';

                case 'boolean':
                case 'null':
                    return String(value);

                case 'object':
                    if (!value) {
                        return 'null';
                    }

                    gap += indent;
                    partial = [];

                    if (isString(value)) {
                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }

                        v = partial.length === 0
                            ? '[]'
                            : gap
                                ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                                : '[' + partial.join(',') + ']';

                        gap = mind;

                        return v;
                    }

                    if (rep && typeof rep === 'object') {
                        length = rep.length;

                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === 'string') {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {
                        for (k in value) {
                            if (hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }

                    v = partial.length === 0
                        ? '{}'
                        : gap
                            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                            : '{' + partial.join(',') + '}';

                    gap = mind;
                    return v;
            }

            throw TypeError('Unsupported object type');
        }

        if (!isFunction(Date.prototype.toJSON)) {
            Date.prototype.toJSON = function () {
                return isFinite(this.valueOf())
                    ? this.getUTCFullYear() + '-' +
                        fmtDigit(this.getUTCMonth() + 1) + '-' +
                        fmtDigit(this.getUTCDate()) + 'T' +
                        fmtDigit(this.getUTCHours()) + ':' +
                        fmtDigit(this.getUTCMinutes()) + ':' +
                        fmtDigit(this.getUTCSeconds()) + 'Z'
                    : null;
            };

            String.prototype.toJSON =
            Number.prototype.toJSON =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
        }

        return function(value) {
            return str('', { '': value });
        };
    } ());
    
    extend(mdsol, {
        parseJson: parseJson,

        toJson: toJson
    });
});
