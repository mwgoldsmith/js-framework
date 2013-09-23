// @DONE (2013-09-17 12:22)
define([
    '../core',
    '../core/Class'
], function (mdsol) {
    /*
    * Use IIFE to prevent cluttering of globals
    */
    (function () {
        function dispose() {
            return mdsol;
        }

        function center($element, parent) {
            var $p = parent ? $element.parent() : $(window);

            $element.css({
                'position': 'absolute',
                'top': (Math.max(((parent.height() - $element.outerHeight()) / 2) + $p.scrollTop(), 0) + 'px'),
                'left': (Math.max(((parent.width() - $element.outerWidth()) / 2) + $p.scrollLeft(), 0) + 'px')
            });

            return $element;
        }
        
        mdsol.Class.namespace('mdsol.ui', {
            center: center,
            
            dispose: dispose
        });
    } ());
}); 
