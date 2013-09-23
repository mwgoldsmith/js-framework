define([
    '../core',
    './data'
], function (mdsol) {
    mdsol.data.DataRow = (function () {
        function deleteProperties(target, preserveId) {
            /// <summary>
            ///     Deletes the own properties of the specified object.
            /// </summary>
            /// <param name="target" type="Object">
            ///     The object to delete the Own properties of.
            /// </param>
            /// <param name="preserveId" optional="true" type="Boolean">
            ///     If true, and an Own property with the name 'ID' is encountered, it will not be deleted.
            /// </param>
            /// <returns type="Object">@target</returns>
            var p;

            // Verify target is an object and not null (typeof null === 'object')
            if (!isObject(target)) {
                throw new TypeError();
            }

            for (p in target) {
                if (!target.hasOwnProperty(p) || isFunction(target[p]) || (!!preserveId && target[p] === 'id')) {
                    continue;
                }

                delete target[p];
            }

            return target;
        }

        // DEPRECATE in favor of using clone() ?
        function copyProperties(dst, org, functions) {
            /// <summary>
            ///     Copies the own properties of one object to another
            /// </summary>
            /// <param name="org" type="Object">
            ///     Source object.
            /// </param>
            /// <param name="dst" type="Object">
            ///     Destination object.
            /// </param>
            /// <param name="functions" optional="true" type="Boolean">
            ///     True if functions are to be included; otherwise, false
            /// </param>
            /// <returns type="Object">@target</returns>
            var p;

            // Verify parameters are objects and not null (typeof null === 'object')
            if (!isObject(org) || !isObject(dst)) {
                throw new TypeError('Invalid data type for org or dst.');
            }

            for (p in org) {
                // Ignore any inherited properties an optionally functions
                if (!org.hasOwnProperty(p) || (!functions && isFunction(org[p]))) {
                    continue;
                }

                dst[p] = org[p];
            }

            return dst;
        }

        function compareProperties(target, o) {
            /// <summary>
            ///     Copies the own properties of one object to another
            ///
            ///     NOTES:    1. Enumerable functions are excluded from the comparison.
            ///               2. In addion to comparing the properties values of both objects, if a 
            ///                  property exists on @target and not on @o, they are considered to be
            ///                  not the same.
            /// </summary>
            /// <param name="target" type="Object">
            ///      Object to check the properties of.
            /// </param>
            /// <param name="o" type="Object">
            ///     Object to compare to.
            /// </param>
            /// <returns type="Boolean">
            ///     True if the properties of @target are the same as @o; otherwise, false.
            /// </returns>
            var p, item;

            // Verify parameters are objects and not null (typeof null === 'object')
            if (!isObject(target) || !isObject(o)) {
                throw new TypeError();
            }

            for (p in target) {
                item = target[p];
                if (o.hasOwnProperty(p) && !isFunction(item) && o[p] !== item) {
                    return false;
                }
            }

            return true;
        }

        function DataRow() {
            if (!(this instanceof DataRow)) {
                return new DataRow();
            }

            return this;
        }

        return DataRow;
    } ());
});