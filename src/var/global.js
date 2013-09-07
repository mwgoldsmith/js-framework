define(function () {
    return (function () {
        // Access to global object without referencing window directly 
        // (strict mode compliant)
        return this || (1, eval)('this');
    } ());
});