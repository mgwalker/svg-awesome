"use strict";
const fs = require("fs");
const glyphs = [ ];

module.exports = function() {
	return new Promise((resolve, reject) => {
		if(glyphs.length) {
			return resolve(glyphs);
		}

		fs.exists("node_modules/font-awesome/less/variables.less", exists => {
			if(exists) {
				const glyphRegex = /@fa-var-([^:]+):\s*"([^"]+)";/ig;
				fs.readFile("node_modules/font-awesome/less/variables.less", { encoding: "utf-8" }, (err, variables) => {
					if(err) {
						return reject(err);
					}

					let match;
					while((match = glyphRegex.exec(variables))) {
						glyphs.push({
							name: match[1],
							unicode: match[2]
						});
					}
					resolve(glyphs);
				});
			} else {
				reject(new Error("No font-awesome LESS file found"));
			}
		});
	});
};
