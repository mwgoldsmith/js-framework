/* @DONE: 2013-09-23 07:26 */
define([
    '../core',
    '../var/slice',
    './Class'
], function (mdsol, slice) {
    mdsol.BitFlags = (function () {
        var _flagValue = function (flag) {
                /* @flag = name | value */
                var value, f;

                if (isString(flag)) {
                    // Verify the flag name exists
                    f = this._flags[flag];
                    value = f !== undefined ? f : null;
                } else if (isNumeric(flag)) {
                    // Verify value is a possible valid combination of flags
                    value = ((flag & this._entropy) === flag) ? flag : null;
                } else {
                    // Invalid data type
                    value = null;
                }

                if (value === null) {
                    throw new Error('Invalid bit flag value');
                }

                return value;
            },
            _test = function (any, flags) {
                /* @flags = [nameA[, nameB[, ...]]] | [valueA[, valueB[, ...]]] */
                var f, i, match = !any;

                for (i = flags.length; i--; ) {
                    f = this._flagValue(flags[i]);

                    // Test if the flag is set
                    if (!match || !any) {
                        if ((f & this._value) === f) {
                            if (any) {
                                match = true;
                            }
                        } else if (!any) {
                            match = false;
                        }
                    }
                }

                return match;
            },
            _bitFlags = function (flags) {
                /* @flags = [nameA[, nameB[, ...]]] | [valueA[, valueB[, ...]]] */
                var i, value = 0;

                // Combine flag(s) to set
                for (i = flags.length; i--; ) {
                    value = value | this._flagValue(flags[i]);
                }

                return value;
            },
            _value = function () {
                if (arguments.length) {
                    this._value = this._bitFlags(slice.call(arguments));
                }

                return this._value;
            };

        function equals() {
            return this._value === this._bitFlags(slice.call(arguments));
        }

        function test() {
            return this._test(false, slice.call(arguments));
        }

        function testAny() {
            return this._test(true, slice.call(arguments));
        }

        function toString() {
            var names = [],
                f = this._flags,
                p;

            // Create array of flag names which are currently set
            for (p in f) {
                if (f.hasOwnProperty(p) && this._test(true, p)) {
                    names.push(p);
                }
            }

            return names.toString();
        }

        function valueOf() {
            return this._flags;
        }

        function BitFlags(flagsObject, initValue) {
            if (!(this instanceof BitFlags)) {
                return new BitFlags(flagsObject, initValue);
            }

            function getMaxValue(flags) {
                var f, all = 0;

                // Get combined value of all flags
                for (f in flags) {
                    if (flags.hasOwnProperty(f) && !isNumeric(flags[f])) {
                        all = 0;
                        break;
                    }

                    all = all | flags[f];
                }

                if (!all) {
                    throw new Error('Invalid bit flag object');
                }

                return all;
            }

            // Value must be set after extend()
            // _bitFlags() is dependand on this._flags already existing
            return extend(this, {
                _entropy: getMaxValue(flagsObject),
                
                _flags: clone(flagsObject)
            }).value(initValue !== undefined ? toArray(initValue) : 0);
        }

        return mdsol.Class(BitFlags, {
            _flagValue: _flagValue,

            _test: _test,

            _bitFlags: _bitFlags,

            equals: equals,

            test: test,

            testAny: testAny,

            toString: toString,

            value: _value,

            valueOf: valueOf
        }).valueOf();
    } ());
});