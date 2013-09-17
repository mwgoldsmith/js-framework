define([
    '../core',
    '../ui'
], function (mdsol) {
    mdsol.ui.DropdownMenu = (function () {
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