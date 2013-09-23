define([
    '../core',
    './ui'
], function (mdsol) {
    mdsol.ui.Dropdown = (function () {
        function Dropdown() {
            if (!(this instanceof Dropdown)) {
                return new Dropdown();
            }

            return this;
        }

        return Dropdown;
    } ());
});