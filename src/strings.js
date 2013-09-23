// @DONE (2013-09-23 18:25)
define([
    './core',
    './var/trim'
], function (mdsol, trim) {
    /*
    * Removes non alpha-numeric values from the specified string.
    */
    function alphaNumeric(value) {
        return isString(value) ? value.replace(/\W/gi, '') : null;
    }

    extend(mdsol, {
        alphaNumeric: alphaNumeric,

        trim: trim
    });
});