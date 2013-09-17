// @DONE (2013-09-17 09:30)
define([
	'./toString'
], function (toString) {
    return (function () {
        var isArray = [].constructor.isArray;

        /*
        * Browser support for native implementation of `Array.isArray`:
        *
        * Chrome:             5
        * Firefox (Gecko):    4 (2.0)
        * Internet Explorer:  9
        * Opera:              10.5	
        * Safari:             5
        *
        * Use native method if it exists; otherwise, shim it.
        */
        return typeof isArray === 'function'
            ? isArray
            : function (obj) {
                return toString.call(obj) === '[object Array]';
            };
    } ());
});