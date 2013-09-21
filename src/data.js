/*global isEmpty,isFunction,namespace,extend*/
define([
    './core'
], function (mdsol) {
    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        function dispose() {

        }
        
        // Expose public members
        namespace('mdsol.data', {
            dispose: dispose
        });
    } ());
});
