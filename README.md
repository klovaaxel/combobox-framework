# Combobox Framework

A adaptable framework to build accessible comboboxes.

Built as a web component, it can be used in any framework or vanilla HTML/CSS/JS.

## Features

-   🌟 Accessible! Built to follow the [WAI-ARIA combobox design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/). Built for keyboard navigation, screen readers, and other assistive technologies.
-   🎨 Easy to style! Bind your own elements to the framework slots, and style them however you want. Easy to integrate into any design system.

## Usage / Examples

### Sample HTML

```html
<combobox-framework>
    <input slot="input" />
    <ul slot="list">
        <!-- Items with a data-display will display data-display when selected-->
        <li data-value="1" data-display="Item 1">Item 1</li>

        <!-- Items with no data value will display inner text when selected-->
        <li data-value="2">Item 2</li>

        <!-- Items with a data value and no direct inner text will display data-value when selected-->
        <li data-value="3">
            <div>Item 3</div>
        </li>

        <!-- Items with a data value and a data display will display data-display when selected-->
        <li data-value="4" data-display="Item 4">
            <div>Item 4</div>
        </li>
    </ul>
</combobox-framework>
```

### Sample CSS

```css
ul {
    position: absolute;
    top: anchor(bottom);
    left: anchor(left);
    right: anchor(right);
    list-style: none;
    margin: 0;
    padding: 0;
    background-color: white;
    border: 1px solid black;
    border-radius: 0 0 0.2rem 0.2rem;
}

li {
    padding: 0.2rem;
    cursor: pointer;
}

li:hover {
    background-color: #eee;
}

input[aria-expanded="false"] + ul {
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
