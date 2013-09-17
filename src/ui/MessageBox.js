define([
    '../core'
], function (mdsol) {
    mdsol.ui.MessageBox = (function (undefined) {
        'use strict';

        function MessageBox() {
            if (!(this instanceof MessageBox)) {
                return new MessageBox();
            }

            return this;
        }

        return MessageBox;
    } ());
});