# Schematic
A way better approach for writing custom schema definitions within Shopify files.

## Working with Shopify schema sucks
Working with syntatically strict JSON in shopify themes sucks. You can't put schema into partials to be included, breaking all hopes of modularity or code reuse, which means intensely duplicated schemas and inconsistency in naming and labeling. Worse, if you have big schemas (like icon lists) that get updated regularly, you have to update definitions everywhere they exist, which is a giant mess.

## This helps a little bit
Schematic helps you write schema in JS, not JSON. You can build arrays or objects however you want with normal import/require. Use functions. Do whatever. This is a standalone `node` executable that will compile & swap schema definitions for sections whenever it's run. That means it edits the actual `.liquid` file for simplicity and compatibility with task runners, build managers, Shopify CLI theme serving, and whatever else.

## To use
`npm i -D @alleyford/schematic`

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
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
    },
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
const { Schematic } = require('@alleyford/schematic');
const app = new Schematic(); // pass opts to this
app.run();
```

Then when you want to build, run the command `./schematic`.

## Built-in components and functions
Since it also sucks creating a bunch of schema from scratch for every project, Schematic comes with some nice generic definitions to use out of the box. Our example schema definition can then become:

```
// src/schema/exampleIcons.js

const { app } = require('@alleyford/schematic');
const common = require('./common.js');

module.exports = {
  name: 'Icons',
  presets: [
    {
      name: 'Icons',
    },
  ],
  settings: [
    app.common.heading,
    common.iconWidth,
  ],
};
```

Sometimes you have a specific code reason to change the ID for a definition, but otherwise keep the definition the same. Schematic supports some 'mutations' to adjust definitions on the fly:

```
// src/schema/exampleIcons.js

const { app } = require('@alleyford/schematic');
const common = require('./common.js');

module.exports = {
  name: 'Icons',
  presets: [
    {
      name: 'Icons',
    },
  ],
  settings: [
    app.mutations.changeId(app.common.heading, 'heading_left'),
    common.iconWidth,
    app.mutations.changeId(app.common.heading, 'heading_right'),
  ],
};
```

Or to make drawing panel schema a little easier:
```
// src/schema/exampleIcons.js

const { app } = require('@alleyford/schematic');
const common = require('./common.js');

module.exports = {
  name: 'Icons',
  presets: [
    {
      name: 'Icons',
    },
  ],
  settings: [
    app.mutations.header('Left icon'),
    app.mutations.changeId(app.common.heading, 'heading_left'),
    app.mutations.changeId(common.iconWidth, 'icon_left'),

    app.mutations.header('Right icon'),
    app.mutations.changeId(app.common.heading, 'heading_right'),
    app.mutations.changeId(common.iconWidth, 'icon_right'),
  ],
};
```

## Bundling common patterns
Sections sometimes have fields that always go together, like a `heading`, `subheading`, and `copy`. Instead of defining every one repeatedly, you can use the spread (`...`) operator when pulling them from a definition.

```
// src/components/cta.js

module.exports = [
  {
    type: 'text',
    id: 'cta_copy',
    label: 'Button copy',
  },
  {
    type: 'url',
    id: 'cta_link',
    label: 'Button destination',
  },
  {
    type: 'select',
    id: 'cta_style',
    label: 'Button style',
    options: [
      {
        value: 'button',
        label: 'Button',
      },
      {
        value: 'link',
        label: 'Link',
      },
      {
        value: 'hidden',
        label: 'None',
      },
    ],
    default: 'link',
  },
];
```

This (`...cta`) will draw in all three definitions:

```
// src/schema/exampleIcons.js

const { app } = require('@alleyford/schematic');
const common = require('./common.js');
const cta = require('./components/cta.js');

module.exports = {
  name: 'Icons',
  presets: [
    {
      name: 'Icons',
    },
  ],
  settings: [
    app.mutations.header('Left icon'),
    app.mutations.changeId(app.common.heading, 'heading_left'),
    app.mutations.changeId(common.iconWidth, 'icon_left'),

    app.mutations.header('Right icon'),
    app.mutations.changeId(app.common.heading, 'heading_right'),
    app.mutations.changeId(common.iconWidth, 'icon_right'),

    ...cta,
  ],
};
```

## Other ways to use
The approach is simple and can be worked into whatever setup you have for dev. Because it writes back to the existing `.liquid` files, be wary of infinite loops when including this in an automatic build step.

## Thanks
David Warrington for initial inspiration: [liquid-schema-plugin](https://github.com/davidwarrington/liquid-schema-plugin)
