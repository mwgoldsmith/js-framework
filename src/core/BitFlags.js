define([
    '../core',
    './Class'
], function(mdsol) {
    mdsol.BitFlags = (function(undefined) {
        "use strict";

        function BitFlags(flagsObject, initValue) {
            if (!(this instanceof BitFlags)) {
                return new BitFlags(flagsObject, initValue);
            }

            function getMaxValue(flags) {
                var f, all = 0;

                // Get combined value of all flags
                for (f in flags) {
                    if (typeof flags[f] !== 'number') {
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

            /* @flag = name | value */
            function flagValue(flag) {
                var value;

                if (typeof flag === 'string') {
                    // Verify the flag name exists
                    flag = _flags[flag];
                    value = flag !== undefined ? flag : null;
                } else if (typeof flag === 'number') {
                    // Verify value is a possible valid combination of flags
                    value = ((flag & _entropy) === flag) ? flag : null;
                } else {
                    // Invalid data type
                    value = null;
                }

                if (value === null) {
                    throw new Error('Invalid bit flag value');
                }

                return value;
            }

            /* @flags = [nameA[, nameB[, ...]]] | [valueA[, valueB[, ...]]] */
            function test(any, flags) {
                var f, i, match = !any;

                for (i = flags.length; i--;) {
                    f = flagValue(flags[i]);

                    // Test if the flag is set
                    if (!match || !any) {
                        if ((f & _value) === f) {
                            if (any) {
                                match = true;
                            }
                        } else if (!any) {
                            match = false;
                        }
                    }
                }

                return match;
            }

            /* @flags = [nameA[, nameB[, ...]]] | [valueA[, valueB[, ...]]] */
            function bitFlags(flags) {
                var i, value = 0;

                // Combine flag(s) to set
                for (i = flags.length; i--;) {
                    value = value | flagValue(flags[i]);
                }

                return value;
            }

            var _makeArray = mdsol.makeArray,
                _flags = mdsol.clone(flagsObject),
                _entropy = getMaxValue(_flags),
                _value = initValue !== undefined ? bitFlags(mdsol.toArray(initValue)) : 0,
                _public = {
                    value: function() {
                        if (arguments.length) {
                            _value = bitFlags(_makeArray(arguments));
                        }

                        return _value;
                    },

                    equals: function() {
                        return _value === bitFlags(_makeArray(arguments));
                    },

                    test: function() {
                        return test(false, _makeArray(arguments));
                    },

                    testAny: function() {
                        return test(true, _makeArray(arguments));
                    },

                    toString: function() {
                        var names = [],
                            p;

                        // Create array of flag names which are currently set
                        for (p in _flags) {
                            // Not using hasOwnProperty since _flags is guaranteed to be a
                            // simple object literal by getMaxValue() when instantiated
                            if (test(true, p)) {
                                names.push(p);
                            }
                        }

                        return names.toString();
                    },

                    valueOf: function() {
                        return _flags;
                    }
                };

            return mdsol.Class(this, _public).valueOf();
        }

        return BitFlags;
    }());
});