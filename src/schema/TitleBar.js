define([
    '../core',
    '../schema'
], function (mdsol) {
    mdsol.schema.TitleBar = (function () {
        'use strict';

        function TitleBar() {
            if (!(this instanceof TitleBar)) {
                return new TitleBar();
            }

            return this;
        }

        return TitleBar;
    } ());
});