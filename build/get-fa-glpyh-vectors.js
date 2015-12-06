"use strict";

const fs = require("fs");

function getSVG(range, path) {
	const width = range.x.max - range.x.min;
	const height = range.y.max - range.y.min;
	return `<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg xmlns="http://www.w3.org/2000/svg" viewBox="${range.x.min} ${range.y.min} ${width} ${height}" width="${width}" height="${height}"><path transform="scale(1,-1) translate(0, ${-height - (2 * range.y.min)})" stroke="red" fill="red" ${path} /></svg>`;
}

function updateRange(range, x, y) {
	if(x > range.x.max) {
		range.x.max = x;
	}
	if(x < range.x.min) {
		range.x.min = x;
	}
	if(y > range.y.max) {
		range.y.max = y;
	}
	if(y < range.y.min) {
		range.y.min = y;
	}
}

function getArgRegexString(numArgs) {
	let argsRegex = " *";
	for(let i = 0; i < numArgs; i++) {
		if(i > 0) {
			if(i % 2 === 0) {
				argsRegex += ",?";
			}
			argsRegex += " +";
		}
		argsRegex += "(-?[0-9.]+)";
	}
	return argsRegex;
}

function getArguments(str, numArgs) {
	if(Number.isNaN(Number(numArgs))) {
		numArgs = 0;
	}

	const args = [ ];
	const match = (new RegExp(getArgRegexString(numArgs))).exec(str);
	if(match) {
		for(let i = 0; i < numArgs; i++) {
			args.push(Number(match[i + 1]));
		}
	}
	return args;
}

function stripCommandWithArguments(str, numArgs) {
	if(Number.isNaN(Number(numArgs))) {
		numArgs = 1;
	}

	return str.replace(new RegExp(`^[A-Za-z]${getArgRegexString(numArgs)}`), "").trim();
}

module.exports = function(glyphs) {
	return new Promise((resolve, reject) => {
		fs.exists("node_modules/font-awesome/fonts/fontawesome-webfont.svg", exists => {
			if(!exists) {
				return reject(new Error("No font-awesome SVG font found"));
			}

			fs.readFile("node_modules/font-awesome/fonts/fontawesome-webfont.svg", { encoding: "utf-8" }, (err, font) => {
				if(err) {
					return reject(new Error(err));
				}

				const writePromises = [ ];

				for(let glyph of glyphs) {
					const regex = new RegExp("<glyph unicode=\"&#x" + glyph.unicode.replace("\\", "") + ";\" ([^>]*)?/>", "g");
					const match = regex.exec(font);
					let correctedPath = "";

					if(match) {
						let range = {
							x: { min: +Infinity, max: -Infinity },
							y: { min: +Infinity, max: -Infinity }
						};

						let position = { x: 0, y: 0 };
						let path = /d="([^"]*)"/.exec(match)[1].trim();

						while(path) {
							let lastLength = path.length;
							let command = path[0];
							let args = [ ];

							if(command.toLowerCase() !== "z") {
								switch(command) {
									case "M":
									case "L":
									case "T":
										args = getArguments(path, 2);
										position.x = args[0];
										position.y = args[1];
										path = stripCommandWithArguments(path, 2);
										break;

									case "m":
									case "l":
									case "t":
										args = getArguments(path, 2);
										position.x += args[0];
										position.y += args[1];
										path = stripCommandWithArguments(path, 2);
										break;

									case "V":
										args = getArguments(path, 1);
										position.y = args[0];
										path = stripCommandWithArguments(path, 1);
										break;

									case "v":
										args = getArguments(path, 1);
										position.y += args[0];
										path = stripCommandWithArguments(path, 1);
										break;

									case "H":
										args = getArguments(path, 1);
										position.x = args[0];
										path = stripCommandWithArguments(path, 1);
										break;

									case "h":
										args = getArguments(path, 1);
										position.x += args[0];
										path = stripCommandWithArguments(path, 1);
										break;

									case "C":
										args = getArguments(path, 6);
										updateRange(range, args[0], args[1]);
										updateRange(range, args[2], args[3]);
										position.x = args[4];
										position.y = args[5];
										path = stripCommandWithArguments(path, 6);
										break;

									case "c":
										args = getArguments(path, 6);
										updateRange(range, position.x + args[0], position.y + args[1]);
										updateRange(range, position.x + args[2], position.y + args[3]);
										position.x += args[4];
										position.y += args[5];
										path = stripCommandWithArguments(path, 6);
										break;

									case "S":
									case "Q":
										args = getArguments(path, 4);
										updateRange(range, args[0], args[1]);
										position.x = args[2];
										position.y = args[3];
										path = stripCommandWithArguments(path, 4);
										break;

									case "s":
									case "q":
										args = getArguments(path, 4);
										updateRange(range, position.x + args[0], position.y + args[1]);
										position.x += args[2];
										position.y += args[3];
										path = stripCommandWithArguments(path, 4);
										break;

									default:
										console.log(`UNKNOWN COMMAND: ${command}`);
										break;
								}

								updateRange(range, position.x, position.y);
								//console.log(`${command} | ${args}`);
							}
							else {
								path = stripCommandWithArguments(path, 0);
							}

							correctedPath += `${command}`;
							for(let i = 0; i < args.length; i++) {
								if(i > 0) {
									correctedPath += " ";
								}
								correctedPath += `${args[i]}`;
							}

							if(lastLength == path.length) {
								console.log("Didn't remove anything else from the path...");
								console.log(path);
								break;
							}
						}

						let width = range.x.max - range.x.min;
						let height = range.y.max - range.y.min;

						if(height > width) {
							const deltaX = (height - width) / 2.0;
							range.x.max += deltaX;
							range.x.min -= deltaX;
						} else {
							const deltaY = (width - height) / 2.0;
							range.y.max += deltaY;
							range.y.min -= deltaY;
						}

						writePromises.push(new Promise(resolve => {
							fs.writeFile(`svgs/${glyph.name}.svg`, getSVG(range, `d="${correctedPath}"`), (err) => {
								resolve();
							});
						}));
					}
				}

				Promise.all(writePromises).then(() => resolve(glyphs));
			});
		});
	});
};
