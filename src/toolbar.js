/*global namespace,extend*/
// @DONE (2013-09-17 11:10)
define([
    './core'
], function (mdsol) {
    namespace('mdsol.toolbar');

    /*
    * Use IIFE to prevent cluttering of globals
    *
    * NOTE: This module requires jQuery, however it should not be listed as an AMD module 
    *       dependency. Only build-time dependencies should be listed above.
    */
    (function () {
        function dispose() {
            return mdsol;
        }

        // Expose public members
        extend(mdsol.toolbar, {
            dispose: dispose
        });
    } ());
});
