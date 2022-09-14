# Schematic
A way better approach for writing custom schema definitions within Shopify files.

## Working with Shopify schema sucks
Working with syntatically strict JSON in shopify themes sucks. You can't put schema into partials to be included, breaking all hopes of modularity or code reuse, which means intensely duplicated schemas and inconsistency in naming and labeling. Worse, if you have big schemas (like icon lists) that get updated regularly, you have to update definitions everywhere they exist, which is a giant mess.

## This helps a little bit
Schematic helps you write schema in JS, not JSON. You can build arrays or objects however you want with normal import/require. Use functions. Do whatever. This is a standalone `node` executable that will compile & swap schema definitions for sections whenever it's run. That means it edits the actual `.liquid` file for simplicity and compatibility with task runners, build managers, Shopify CLI theme serving, and whatever else.

## To use
By default, Schematic looks for schema definitions in `src/schema`. You can change this by passing arguments to the Schematic constructor:

```
const app = new Schematic({
  paths: {
    sections: './sections', // directory to look for sections
    schema: './src/schema', // directory with schema definitions
  },
  verbose: true, // show details in console if true, otherwise silent except on error
});
```

Then you're free to create schema definitions, either in full, partials, or whatever else.

```
// src/schema/exampleIcons.js

const common = require('./common.js');

module.exports = {
  name: 'Icons',
  presets: [
    {
      name: 'Icons',
    },
  ],
  settings: [
    common.iconWidth,
  ],
};
```

```
// src/schema/common.js

module.exports = {
  iconWidth: {
    type: "select",
    id: "icon_width",
    label: "Icon width",
    options: [
      {
        "value": "96px",
        "label": "96px",
      },
      {
        "value": "64px",
        "label": "64px",
      },
      {
        "value": "48px",
        "label": "48px",
      },
      {
        "value": "32px",
        "label": "32px",
      },
      {
        "value": "24px",
        "label": "24px",
      },
      {
        "value": "16px",
        "label": "16px",
      },
    ],
    "default": "32px",
  },
};
```

To tell Schematic what to build, you use a magic comment with the entry point for the schema definition.

```
// sections/icons.liquid, bottom of file

{%- comment -%} schematic 'exampleIcons' {%- endcomment -%}
```

This will find `./src/schema/exampleIcons.js`, build the JSON, and either draw in the schema tag with full definition, or replace the existing schema definition with the new one.

## Set this up as an executable
The most straight-forward way to use and incorporate into your flow is to make a quick `node` executable:

`touch schematic && chmod +x schematic`

```
// schematic

#!/usr/bin/env node --no-warnings
const Schematic = require('schematic');
const app = new Schematic();
app.run();
```

Then when you want to build, run the command `./schematic`.

## Other ways to use
The approach is simple and can be worked into whatever setup you have for dev. Because it writes back to the existing `.liquid` files, be wary of infinite loops when including this in an automatic build step.

## Thanks
David Warrington for initial inspiration: [liquid-schema-plugin](https://github.com/davidwarrington/liquid-schema-plugin)
