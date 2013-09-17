define([
    '../core'
], function (mdsol) {
    mdsol.ui.Dropdown = (function (undefined) {
        'use strict';

        function Dropdown() {
            if (!(this instanceof Dropdown)) {
                return new Dropdown();
            }

            return this;
        }

        return Dropdown;
    } ());
});