    // Can't do this because several apps including ASP.NET trace
    // the stack via arguments.caller.callee and Firefox dies if
    // you try to trace through 'use strict' call chains. (#13335)
    // Support: Firefox 18+
    //'use strict';
    // Expose mdsol, even in AMD and CommonJS for browser emulators
    return (window.mdsol = mdsol);

}));
