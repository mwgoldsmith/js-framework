define([
    '../core',
    './Class'
], function(mdsol) {
    mdsol.Enum = (function(undefined) {
        "use strict";

        function Enum(enumObj, initValue) {
            if (!(this instanceof Enum)) {
                return new Enum(enumObj, initValue);
            }

            function getValues(o) {
                var values = [], p;

                for (p in o) {
                    if (typeof o[p] !== 'number') {
                        values = [];
                        break;
                    }

                    values.push(o[p]);
                }

                if (!values.length) {
                    throw new Error('Invalid enum object');
                }

                return values;
            }

            function enumValue(v) {
                if (v === null) {
                    return null;
                } else if (typeof v === 'string' && _enum[v] !== undefined) {
                    // Verify it is a valid enum name (see: http://jsperf.com/hasownproperty-vs-in-vs-other/)
                    return _enum[v];
                } else if (typeof v === 'number' && _all.indexOf(v) !== -1) {
                    // Verify it is a valid enum value
                    return v;
                }

                throw new Error('Invalid enum value');
            }

            var _all = getValues(enumObj),
                _enum = mdsol.clone(enumObj),
                _value = initValue !== undefined ? enumValue(initValue) : null,
                _public = {
                    value: function(value) {
                        if (arguments.length) {
                            _value = enumValue(value);
                        }

                        return _value;
                    },

                    test: function(value) {
                        return _value === enumValue(value);
                    },

                    toString: function() {
                        var p;

                        for (p in _enum) {
                            // Not using hasOwnProperty since _enum is guaranteed to be a
                            // simple object literal by getValues() when instantiated
                            if (_enum[p] === _value) {
                                return p;
                            }
                        }

                        return null;
                    },

                    valueOf: function() {
                        return _enum;
                    }
                };

            return mdsol.Class(this, _public).valueOf();
        }

        return Enum;
    }());
});