define([
    '../core',
    '../schema'
], function (mdsol) {
    mdsol.schema.Field = (function () {
        'use strict';

        function Field() {
            if (!(this instanceof Field)) {
                return new Field();
            }

            return this;
        }

        return Field;
    } ());
});