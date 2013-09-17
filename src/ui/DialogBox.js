define([
    '../core'
], function (mdsol) {
    mdsol.ui.DialogBox = (function (undefined) {
        'use strict';

        function DialogBox() {
            if (!(this instanceof DialogBox)) {
                return new DialogBox();
            }
            
            return this;
        }

        return DialogBox;
    } ());
});