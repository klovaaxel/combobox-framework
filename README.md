# Combobox Framework

An adaptable framework to build accessible comboboxes.

Built as a web component, it can be used in any framework or vanilla HTML/CSS/JS.

[Installation](https://klovaaxel.github.io/combobox-framework/#installation) [Examples](https://klovaaxel.github.io/combobox-framework/#examples) [Styling](https://klovaaxel.github.io/combobox-framework/#styling) [GitHub](https://klovaaxel.github.io/combobox-framework/) [NPM](https://www.npmjs.com/package/combobox-framework) [WebComponents](https://www.webcomponents.org/element/combobox-framework)

## Features

-   🌟 Accessible! Built to follow the [WAI-ARIA combobox design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/). Built for keyboard navigation, screen readers, and other assistive technologies.
-   🎨 Easy to style! Bind your own elements to the framework slots, and style them however you want. Easy to integrate into any design system.

## Installation

### CDN

Link in the combobox-framework from a CDN

```html
<script type="module" src="https://unpkg.com/combobox-framework"></script>
```

### NPM

Install the combobox-framework from npm

```bash
npm install combobox-framework
```

Import the combobox-framework into your project

```js
import "combobox-framework";
```

## Usage / Examples

### Sample HTML

This is a simple example of how to use the combobox framework element. For more examples, see the [demo](https://klovaaxel.github.io/combobox-framework/)

```html
<combobox-framework>
    <input slot="input" />
    <ul slot="list">
        <li data-value="1">Item 1</li>
        <li data-value="2">Item 2</li>
        <li data-value="3">Item 3</li>
        <li data-value="4">Item 4</li>
    </ul>
</combobox-framework>
```

### Sample CSS

This is what is used to style the combobox in the [demo](https://klovaaxel.github.io/combobox-framework/). You can style it however you want.

```css
combobox-framework [slot="list"] {
    color: black;
    background-color: white;
    position: absolute;
    top: anchor(bottom);
    left: anchor(left);
    right: anchor(right);
    list-style: none;
    margin: 0;
    padding: 0;
    border: 1px solid black;
    border-radius: 0 0 0.2rem 0.2rem;
}

combobox-framework [slot="list"] > * {
    padding: 0.2rem;
    cursor: pointer;
}

combobox-framework [slot="list"] li:hover,
combobox-framework [slot="list"] tr:hover td {
    background-color: azure;
}

combobox-framework input[aria-expanded="false"] + [slot="list"],
combobox-framework input:not([aria-expanded]) + [slot="list"] {
    display: none;
}
```

## Development notes

### Setup

Install [Bun](https://bun.sh/), then run:

```bash
bun install
```

## Dev server

```bash
bun run dev
```

## Build

```bash
bun run build
```

## Resources

-   [Combobox Pattern - ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#top)
