/*global namespace,extend*/
// @DONE (2013-09-17 11:11)
define([
    './core'
], function (mdsol) {
    namespace('mdsol.session');

    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        function dispose() {
            return mdsol;
        }

        // Expose public members
        extend(mdsol.session, {
            dispose: dispose
        });
    } ());
});
