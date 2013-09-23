define([
    '../core',
    './ui'
], function (mdsol) {
    mdsol.ui.DialogPage = (function () {
        function DialogPage() {
            if (!(this instanceof DialogPage)) {
                return new DialogPage();
            }

            return this;
        }

        return DialogPage;
    } ());
});