/* @DONE: 2013-09-23 07:26 */
define([
    '../core',
    './Class'
], function (mdsol) {
    mdsol.Enum = (function () {
        var _enumValue = function(v) {
                if (v === null) {
                    return null;
                } else if (isNumeric(v) && this._enum[v] !== undefined) {
                    // Verify it is a valid enum name (see: http://jsperf.com/hasownproperty-vs-in-vs-other/)
                    return _enum[v];
                } else if (isNumeric(v) && this._all.indexOf(v) !== -1) {
                    // Verify it is a valid enum value
                    return v;
                }

                throw new Error('Invalid enum value');
            },
            _value = function(value) {
                if (arguments.length) {
                    this._value = this._enumValue(value);
                }

                return this._value;
            };

        function test(value) {
            return this._value === this._enumValue(value);
        }

        function toString() {
            var e = this._enum, p;

            for (p in e) {
                if (e.hasOwnProperty(p) && e[p] === _value) {
                    return p;
                }
            }

            return null;
        }

        function valueOf() {
            return this._enum;
        }
        
        function Enum(enumObj, initValue) {
            if (!(this instanceof Enum)) {
                return new Enum(enumObj, initValue);
            }

            function getValues(o) {
                var values = [], p;

                for (p in o) {
                    if (o.hasOwnProperty(p) && !isNumeric(o[p])) {
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

            // Value must be set after extend()
            // _enumValue() is dependand on this._enum already existing
            return extend(this, {
                _all: getValues(enumObj),

                _enum: clone(enumObj),
                
                _value: null
            }).value(initValue !== undefined ? initValue : null);
        }

        return mdsol.Class(Enum, {
            _enumValue: _enumValue,
            
            test: test,
            
            toString: toString,
            
            value: _value, 
            
            valueOf: valueOf
        }).valueOf();
    }());
});