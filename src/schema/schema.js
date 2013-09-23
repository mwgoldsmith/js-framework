// @DONE (2013-09-17 11:11)
define([
    '../core',
    '../core/Class'
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

        mdsol.Class.namespace('mdsol.schema', {
            clear: clear,

            dispose: dispose
        });
    } ());
}); 
