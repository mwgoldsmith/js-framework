/*global isString,extend*/
// @DONE (2013-09-16 22:51)
define([
    './core',
    './var/trim'
], function (mdsol, trim) {
    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        /*
        * Removes non alpha-numeric values from the specified string.
        */
        function alphaNumeric(value) {
            return isString(value) ? value.replace(/\W/gi, '') : null;
        }

        extend(mdsol, {
            alphaNumeric: alphaNumeric,

            trim: trim
        });
    }());
});