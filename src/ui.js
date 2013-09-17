/*global namespace*/
// @DONE (2013-09-17 12:22)
define([
    './core'
], function (mdsol) {
    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        function dispose() {
            return mdsol;
        }

        namespace('mdsol.ui', {
            dispose: dispose
        });
    } ());
}); 
