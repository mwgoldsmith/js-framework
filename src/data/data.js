define([
    '../core',
    '../core/Class'
], function (mdsol) {
    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        function dispose() {
            // TODO: Implement
        }
        
        // Expose public members
        mdsol.Class.namespace('mdsol.data', {
            dispose: dispose
        });
    } ());
});
