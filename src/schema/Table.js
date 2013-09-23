define([
    '../core',
    './schema'
], function (mdsol) {
    mdsol.schema.Table = (function () {
        function Table() {
            if (!(this instanceof Table)) {
                return new Table();
            }

            return this;
        }

        return Table;
    } ());
});