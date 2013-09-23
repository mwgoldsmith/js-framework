define([
    '../core',
    './schema'
], function (mdsol) {
    mdsol.schema.TitleBar = (function () {
        function TitleBar() {
            if (!(this instanceof TitleBar)) {
                return new TitleBar();
            }

            return this;
        }

        return TitleBar;
    } ());
});