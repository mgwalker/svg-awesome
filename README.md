# svg-awesome

All the Font Awesome icons without the font.  All credit to [Font Awesome](https://fortawesome.github.io/Font-Awesome/) for the great artwork.

## Usage

Install it into your project with bower or npm.

```
bower install svg-awesome
npm install svg-awesome
```

Then add it to your HTML somewhere:

```html
<link rel="stylesheet" href="node_modules/svg-awesome/css/svg-awesome-bw.svg">
```

Now you can use it more or less like Font Awesome!

```html
<i class="fa fa-users"></i> Users
```

## How It's Different

## Big Caveats

There are two CSS files included.  In one, the icons are all black.  If you use this CSS file, you can only have black or white icons.  To get a white icon, add `.fa-white` to your class:

```html
<i class="fa fa-users fa-white"></a> Users
```

With the second file, all the icons are red.  There are still shortcuts to make them black or white (`.fa-black` and `.fa-white`), but if you don't supply either of these, the icons will be red.  You can change the color of the icon by applying a CSS filter.  For example, if you wanted your icon to be blue, you might do something like this:

```css
-webkit-filter: hue-rotate(220deg);
-moz-filter: hue-rotate(220deg);
-ms-filter: hue-rotate(220deg);
filter: hue-rotate(220deg);
```

Unlike Font Awesome, which is in fact awesome, this doesn't use a web font. [Why not?](http://blog.cloudfour.com/seriously-dont-use-icon-fonts/) Instead, it uses SVGs as background images.  An SVG in an image or background image effectively lives outside the DOM, so you can't directly set the `stroke` or `fill` properties with your CSS.  That's where the filters come in.
