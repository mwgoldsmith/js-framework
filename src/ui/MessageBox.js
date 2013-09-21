define([
    '../core',
    '../ui'
], function (mdsol) {
    mdsol.ui.MessageBox = (function () {
        'use strict';

        var _buttonEnum = {
            OK: 1
        };

        function MessageBox() {
            if (!(this instanceof MessageBox)) {
                return new MessageBox();
            }

            return this;
        }

        MessageBox.buttonEnum = _buttonEnum;

        return MessageBox;
    } ());
});