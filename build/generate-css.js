"use strict";
const fs = require("fs");
const baseCSS = fs.readFileSync("build/base.css");

module.exports = function(glyphs) {
	return new Promise(resolve => {
		const promises = [ ];

		let css = baseCSS;
		for(let glyph of glyphs) {
			promises.push(new Promise(resolve => {
				fs.exists(`svgs/${glyph.name}.svg`, exists => {
					if(!exists) {
						return resolve();
					}

					fs.readFile(`svgs/${glyph.name}.svg`, { encoding: "utf-8" }, (err, svg) => {
						if(err) {
							return resolve();
						}

						css += `\n.fa.fa-${glyph.name}{background-image:url('data:image/svg+xml;utf8,${svg.replace(`<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`, "")}');}`;
						resolve();
					});
				});
			}));
		}

		Promise.all(promises).then(() => {
			fs.writeFile("css/svg-awesome-color.css", css, err => {
				if(err) {
					reject(err);
				} else {
					// Write another version of the CSS, with no color
					fs.writeFile("css/svg-awesome-bw.css", css.replace(/ stroke="red" fill="red"/g, ""), err => {
						if(err) {
							reject(err);
						} else {
							resolve();
						}
					});
				}
			});
		});
	});
}
