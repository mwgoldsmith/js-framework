// @DONE (2013-09-17 09:43)
(function($, undefined) {
    /*
    * Some versions of JScript fail to enumerate over properties, names of which 
    * correspond to non-enumerable properties in the prototype chain. IE6 doesn't
    * enumerate `toString` and `valueOf` (among other built-in `Object.prototype`)
    * properties.
    */
    var DONT_ENUM_BUG = !({ toString: null }).propertyIsEnumerable('toString');
