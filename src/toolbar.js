define([
    './core',
    './session',
    './core/Class'
], function (mdsol) {
    /*
    * Use IIFE to prevent cluttering of globals
    *
    * NOTE: This module requires jQuery, however it should not be listed as an AMD module 
    *       dependency. Only build-time dependencies should be listed above.
    */
    (function () {
        function addMenu() {

        }

        function removeMenu() {

        }

        function getMenu() {

        }

        function dispose() {
            return mdsol;
        }

        mdsol.session.subscribe('afterLogout', onLogout);
        
        function onLogout() {
            // Reset all of the menus
        }
        
        // Expose public members
        mdsol.Class.namespace('mdsol.toolbar', {
            addMenu: addMenu,

            removeMenu: removeMenu,

            getMenu: getMenu,

            dispose: dispose
        });
    } ());
});
