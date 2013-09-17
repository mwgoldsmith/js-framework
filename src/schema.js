/*global namespace,extend*/
// @DONE (2013-09-17 11:11)
define([
    './core'
], function (mdsol) {
    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        function clear() {
            return mdsol;
        }
        
        function dispose() {
            return mdsol;
        }

        namespace('mdsol.schema', {
            clear: clear,

            dispose: dispose
        });
    } ());
}); 
