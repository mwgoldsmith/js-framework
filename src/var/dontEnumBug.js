define([], function () {
    /*
    * Some versions of JScript fail to enumerate over properties, names of which 
    * correspond to non-enumerable properties in the prototype chain. IE6 doesn't
    * enumerate `toString` and `valueOf` (among other built-in `Object.prototype`)
    * properties.
    */
    return !({ toString: null }).propertyIsEnumerable('toString');
});
