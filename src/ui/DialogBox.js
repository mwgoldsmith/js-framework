define([
    '../core',
    './ui'
], function (mdsol) {
    mdsol.ui.DialogBox = (function () {
        function DialogBox() {
            if (!(this instanceof DialogBox)) {
                return new DialogBox();
            }
            
            return this;
        }

        return DialogBox;
    } ());
});