'use strict';
/**
 * vendor.js - this will include all the modules from the dependencies
 * since we lost the awesome bower to do the job for us. We have to
 * go back to the early 2000 years to do stuff like this manually.
 */

/**
    problem with using npm
    even we look into the dependencies section of the package.json
    there is still no easy way to grab them and regenerate a new vendor.js
    let alone all the naming are complete fcuk to say the least.
    need more research on this with rollup.js
 **/

// jquery will be handle by bower if any
// import $ from 'jquery';

import riot from 'riot';
import route from 'riot-route';

<%
// optionals
optionals.forEach( function(opt)
{
%>import <%= opt.name %> from '<%= opt.value %>';
<%
});
%>

// the CSS framework library will be handle by bower

// -- EOF --
