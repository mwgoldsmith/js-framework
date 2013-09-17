define([
    '../core'
], function (mdsol) {
    mdsol.ui.DropdownSelect = (function (undefined) {
        'use strict';

        function DropdownSelect() {
            if (!(this instanceof DropdownSelect)) {
                return new DropdownSelect();
            }

            return this;
        }

        return DropdownSelect;
    } ());
});