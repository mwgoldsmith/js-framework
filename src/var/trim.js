// @DONE (2013-09-17 10:24)
define([
    './natives'
], function (natives) {
    return (function () {
        var trim = natives['[object String]'].trim;

        /*
        * Browser support for native implementation of `String.prototype.trim`:
        *
        * Chrome:             (all)
        * Firefox (Gecko):    3.5
        * Internet Explorer:  9
        * Opera:              10.5
        * Safari:             5
        *
        * Use native method if it exists and can support unicode; otherwise,
        * shim it.
        */
        return trim && !trim.call('\uFEFF\xA0') ?
            function (text) {
                return text === null ? '' : trim.call(text);
            } :
            function (text) {
                return text === null ? '' : (text + '')
                    .replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
            };
    } ());
});