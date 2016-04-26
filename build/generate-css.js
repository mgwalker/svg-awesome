"use strict";
const fs = require("fs");

module.exports = function(glyphs) {
	return new Promise((resolve, reject) => {
		const promises = [ ];

		let css = `.fa{display:inline-block;width:1em;height:1em;background-size:contain;}\n.fa-lg{width:1.33333em;height:1.33333em;}\n.fa-2x{width:2em;height:2em;}\n.fa-3x{width:3em;height:3em;}\n.fa-4x{width:4em;height:4em;}\n.fa-5x{width:5em;height:5em;}\n.fa.fa-white{-webkit-filter:brightness(0) invert();-moz-filter:brightness(0) invert();-ms-filter:brightness(0) invert();filter:brightness(0) invert();}\n.fa.fa-black{-webkit-filter:brightness(0);-moz-filter:brightness(0);-ms-filter:brightness(0);filter:brightness(0);}`
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

						css += `\n.fa.fa-${glyph.name} {background-image:url('data:image/svg+xml;utf8,${svg.replace(`<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`, "")}');}`;
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
