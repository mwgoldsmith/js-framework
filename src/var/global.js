// @DONE (2013-09-17 09:27)
define(function () {
    return (function () {
        /*
        * Provides access to global object without referencing window directly.
        * Will work in strict mode.
        */
        return this || (1, eval)('this');
    } ());
});