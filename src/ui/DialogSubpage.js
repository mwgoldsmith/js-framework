define([
    '../core',
    './ui'
], function (mdsol) {
    mdsol.ui.DialogSubpage = (function () {
        function DialogSubpage() {
            if (!(this instanceof DialogSubpage)) {
                return new DialogSubpage();
            }

            return this;
        }

        return DialogSubpage;
    } ());
});