define([
    '../core'
], function (mdsol) {
    mdsol.ui.DropdownMenu = (function (undefined) {
        'use strict';

        function DropdownMenu() {
            if (!(this instanceof DropdownMenu)) {
                return new DropdownMenu();
            }

            return this;
        }

        return DropdownMenu;
    } ());
});