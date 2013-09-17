define([
    '../core'
], function (mdsol) {
    mdsol.ui.DialogSubpage = (function () {
        'use strict';

        function DialogSubpage() {
            if (!(this instanceof DialogSubpage)) {
                return new DialogSubpage();
            }

            return this;
        }

        return DialogSubpage;
    } ());
});