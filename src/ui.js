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

        function center($element, parent) {
            parent = parent ? $element.parent() : $(window);

            $element.css({
                "position": "absolute",
                "top": (Math.max(((parent.height() - $element.outerHeight()) / 2) + parent.scrollTop(), 0) + "px"),
                "left": (Math.max(((parent.width() - $element.outerWidth()) / 2) + parent.scrollLeft(), 0) + "px")
            });

            return $element;
        }
        
        namespace('mdsol.ui', {
            center: center,
            
            dispose: dispose
        });
    } ());
}); 
