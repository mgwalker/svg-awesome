"use strict";

require("./get-fa-glyphs")()
	.then(glyphs => require("./get-fa-glpyh-vectors")(glyphs))
	.then(glyphs => require("./generate-css.js")(glyphs))
	.catch(err => console.log(err));
