/*global namespace,extend*/
// @DONE (2013-09-17 11:11)
define([
    './core',
    './schema/Field',
    './schema/Table',
    './schema/Link'
], function (mdsol) {
    namespace('mdsol.schema');
    
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

        extend(mdsol.schema, {
            clear: clear,

            dispose: dispose
        });
    } ());
}); 
