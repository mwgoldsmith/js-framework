define([
    '../core',
    './ui'
], function (mdsol) {
    mdsol.ui.DropdownSelect = (function () {
        function DropdownSelect() {
            if (!(this instanceof DropdownSelect)) {
                return new DropdownSelect();
            }

            return this;
        }

        return DropdownSelect;
    } ());
});