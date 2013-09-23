define([
    '../core',
    './schema'
], function (mdsol) {
    mdsol.schema.Field = (function () {
        function Field() {
            if (!(this instanceof Field)) {
                return new Field();
            }

            return this;
        }

        return Field;
    } ());
});