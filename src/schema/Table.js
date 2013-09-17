define([
    '../core',
    '../schema'
], function (mdsol) {
    mdsol.schema.Table = (function () {
        'use strict';

        function Table() {
            if (!(this instanceof Table)) {
                return new Table();
            }

            return this;
        }

        return Table;
    } ());
});