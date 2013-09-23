/*global dontEnumBug*/
// @DONE (2013-09-17 10:20)
define([
    './natives',
    './dontEnumBug',
    './hasOwnProperty'
], function (natives, dontEnumBug, hasOwnProperty) {
    return (function () {
        var keys = natives['[object Object]'].constructor.keys,
            dontEnum = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ];
        
        /*
        * Browser support for native implementation of `Object.keys`:
        *
        * Chrome:             5
        * Firefox (Gecko):    4 (2.0)
        * Internet Explorer:  9
        * Opera:              12
        * Safari:             5
        *
        * Use native method if it exists; otherwise, shim it.
        */
        return typeof keys === 'function'
            ? keys
            : function (obj) {
                var p, i, len, result = [];

                if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
                    throw new TypeError('keys called on non-object');
                }

                for (p in obj) {
                    if (hasOwnProperty.call(obj, p)) {
                        result.push(p);
                    }
                }

                if (dontEnumBug) {
                    for (i = 0, len = dontEnum.lngth; i < len; i++) {
                        if (hasOwnProperty.call(obj, dontEnum[i])) {
                            result.push(dontEnum[i]);
                        }
                    }
                }

                return result;
            };
    } ());
});
