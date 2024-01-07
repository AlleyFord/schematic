# Schematic
A more sane approach for writing custom schema definitions within Shopify themes.

## Working with Shopify schema sucks
Working with syntatically strict JSON in Shopify themes sucks. You can't put schema into partials to be included, breaking all hopes of modularity or code reuse, which means intensely duplicated schemas and inconsistency in naming and labeling. Worse, if you have big schemas (like icon lists) that get updated regularly, you have to update definitions everywhere they exist, which is a giant mess.

## This helps a little bit
Schematic helps you write Shopify theme schema in JS, not JSON. You can build arrays or objects however you want with normal import/require. Use functions. Do whatever. This is a standalone `node` executable that will compile & swap schema definitions for sections whenever it's run. That means it edits the actual `.liquid` file for simplicity and compatibility with task runners, build managers, Shopify CLI theme serving, and whatever else.

## To use
*Locally:*
`npm i -D @alleyford/schematic`

*Globally:*
`npm i -g @alleyford/schematic`

*Running:*
`npx schematic`

By default, Schematic wants to be executed in the theme root and looks for schema definitions in `src/schema`. You can change this by passing arguments to the Schematic constructor, if invoking directly and not via `npx`:
```js
const app = new Schematic({
  paths: {
    config: './config', // directory for shopify configuration files
    sections: './sections', // directory for section files
    snippets: './snippets', // directory for snippet files
    locales: './locales', // directory for locale files
    schema: './src/schema', // directory with all of the schema definitions for schematic to consume
  },
  localization: {
    file: './snippets/p-app-localization.liquid', // file to scan to replace magic comment with localization strings
    expression: 'window.app.copy = %%json%%;', // the expression to write for localization strings
  },
  verbose: true, // show details in console if true, otherwise silent except on error
});
```

Then you're free to create schema definitions, either in full, partials, or whatever else. Here's some example Schematic schema JS for a Shopify section which renders a single icon and a heading.

First, some JS which exports objects we can reuse:
```js
// ./src/schema/global.js

module.exports = {
  iconWidth: {
    type: 'select',
    id: 'icon_width',
    label: 'Icon width',
    options: [
      {
        value: '96px',
        label: '96px',
      },
      {
        value: '64px',
        label: '64px',
      },
      {
        value: '48px',
        label: '48px',
      },
      {
        value: '32px',
        label: '32px',
      },
      {
        value: '24px',
        label: '24px',
      },
      {
        value: '16px',
        label: '16px',
      },
    ],
    default: '32px',
  },
};
```

Then, the JS which produces the full Shopify section JSON schema:
```js
// ./src/schema/iconAndHeading.js

const global = require('./global');

module.exports = {
  name: 'Icon and heading',
  tag: 'section',
  enabled_on: {
    templates: [
      'collection',
      'product',
    ],
  },
  presets: [{
    name: 'Icon and heading',
  }],
  settings: [
    {
      type: 'text',
      id: 'heading',
      label: 'Heading',
    },
    {
      type: 'select',
      id: 'icon',
      label: 'Icon',
      options: [
        {
          label: '',
          value: 'None',
        },
        {
          label: 'Heart',
          value: 'heart',
        },
        {
          label: 'Fire',
          value: 'fire',
        },
      ],
    },
    global.iconWidth,
  ],
};
```

To tie this to Shopify and tell Schematic what to build, you edit your section liquid files with a magic comment with the entry point for the schema definition.
```liquid
// ./sections/iconAndHeading.liquid, bottom of file

{%- comment -%} schematic iconAndHeading {%- endcomment -%}
```

This will find `./src/schema/iconAndHeading.js`, build the JSON, and either draw in the schema tag with full definition, or replace the existing schema definition with the new one.

If you've named your schema and section files the same (`./src/schema/iconAndHeading.js`, `./sections/iconAndHeading.liquid`), then you can simply use:
```liquid
{%- comment -%} schematic {%- endcomment -%}
```

And Schematic will intuit the path for the schema definition from the filename.

## Set this up as an executable
The most straight-forward way to use this by installing globally (or as a dev dependency) and running `npx schematic` within the Shopify theme directory. That assumes you have `./src/schema/` set up with your schema definitions.

If you need more customization, or your directory structure for schema definitions is different, you can create a node executable:

`touch schematic && chmod +x schematic`
```js
// ./schematic

#!/usr/bin/env node --no-warnings
const { Schematic } = require('@alleyford/schematic');

const app = new Schematic({
  paths: {
    sections: './sections', // directory to look for sections
    schema: './src/schema', // directory with schema definitions
  },
  verbose: true, // show details in console if true, otherwise silent except on error
});

app.run();
```

Then when you want to build, run the command `./schematic`.

### Using the built-in executable
The best way to run this is `npx schematic`. If you need to apply options, like verbosity or paths, you can set them in your environment:

| Variable | Example value |
| --- | --- |
| SCHEMATIC_VERBOSE | `0` or `1` |
| SCHEMATIC_PATH_CONFIG | Path to to the Shopify `config/` directory |
| SCHEMATIC_PATH_SECTIONS | Path to to the Shopify `sections/` directory |
| SCHEMATIC_PATH_SNIPPETS | Path to to the Shopify `snippets/` directory |
| SCHEMATIC_PATH_SCHEMA | Path to to the directory with our schema definitions |

An example command to run Schematic without verbose output and a `schema` directory out of the Shopify theme root: `SCHEMATIC_VERBOSE=0 SCHEMATIC_PATH_SCHEMA=../src/schema npx schematic`

## Built-in components and functions
Since it also sucks creating a bunch of schema from scratch for every project, Schematic comes with some nice generic definitions and helper methods to use out of the box. The `app` variable derived from the package will contain everything you can use. We'll tie this together at the end to show it in use.

### Sidebar methods
| Method | Arguments | Description | Example |
| --- | --- | --- | --- |
| header | content, [info] | Returns [sidebar header](https://shopify.dev/docs/themes/architecture/settings/sidebar-settings#header) object | `app.header('Icon', "Icons help convey meaning in a visual and quick way.")` |
| paragraph | content | Returns [sidebar paragraph](https://shopify.dev/docs/themes/architecture/settings/sidebar-settings#paragraph) object | `app.paragraph("This adds some helpful copy to the sidebar.")` |

### Quality of life methods & objects
| Method or property | Arguments | Description | Example |
| --- | --- | --- | --- |
| section | name, [props] | Returns starter object for section schema (name, preset name, and optionally tag) | `...app.section('Icon and heading', { class: 'section', tag: 'div' })` |
| option | id, label | Returns option object | `app.option('text-left', 'Left align')` |
| types | | Returns object of camelCase input types | `app.types.bgColor; // returns "color_background"` |
| templates | | Returns object of camelCase template names | `app.templates.activateAccount; // returns "customers/activate_account"` |
| common | | Returns object of common, pre-build generic inputs | `app.common.colorBackgroundSelector` |
| normalTemplates | | Returns an array of normal templates (article, index, page, product, blog, collection, collection list, gift card) | `app.normalTemplates` |
| allTemplates | | Returns an array of all Shopify templates | `app.allTemplates` |
| font | | Sidebar input object for selecting font style (sans, serif, script) | `app.font` |
| textAlign | | Sidebar input object for selecting text alignment (left, center, right, justify, start, end) | `app.textAlign` |
| orientation | | Sidebar input object for selecting orientation (left, right) | `app.orientation` |
| imageStyle | | Sidebar input object for selecting image style (cover, full) | `app.imageStyle` |
| defaults | | Contains objects for often repeated blank values | `options: [app.defaults.blank, ...]` |

### Input methods
| Method | Arguments | Description | Example |
| --- | --- | --- | --- |
| make | type, [props] | Factory to return [input settings](https://shopify.dev/docs/themes/architecture/settings/input-settings) objects | `app.make('richtext', {id: 'copy', label: "Copy"})` |
| input | type, [props] | Alias of `make` | `app.input('blog', {label: "Select the blog for related reading"})` |
| prefixOptions | prefix, options | Returns array with option values prefixed | `app.prefixOptions('fill-', ['red', 'green', 'blue'])` |
| suffixOptions | suffix, options | Returns array with option values suffixed | `app.suffixOptions('-500', ['red', 'green', 'blue'])` |
| enumerateId | (obj\|[obj, ..]), index | Returns object(s) with the id suffixed with enumeration | `app.enumerateId(app.imageSelector, 1)` `app.enumerateId(app.imageSelector, 2)` |
| changeId | obj, id | Returns object with the id property changed | `app.changeId(app.imageSelector, 'backgroundImage')` |
| changeLabel | obj, label | Returns object with the label property changed | `app.changeLabel(app.imageSelector, 'Background image')` |
| changeDefault | obj, default | Returns object with the default property changed | `app.changeDefault(app.number, 42)` |
| changeLimit | obj, limit | Returns object with the limit property changed | `app.changeLimit(app.collectionsSelector, 3)` |
| changeProperty | obj, key, value | Returns object with the property changed | `app.changeProperty(app.number, 'id', 'articleLimit')` |
| changeProperties | (obj\|[obj, ..]), props | Returns object(s) with the properties changed | `app.changeProperties(app.number, {id: 'articleLimit', default: 3})` |
| removeProperty | obj, key | Returns object with the property deleted | `app.removeProperty(app.productSelector, 'limit')` |
| removeProperties | obj, keys | Returns object with the properties deleted | `app.removeProperties(app.productSelector, ['limit', 'default'])` |

### Default input objects
| Property | Aliases |
| --- | --- |
| articleSelector | articlePicker, `app.make('article')` |
| blogSelector | blogPicker, `app.make('blog')` |
| pageSelector | pagePicker, `app.make('page')` |
| menuSelector | menuPicker, `app.make('menu')`, `app.make('linkList')` |
| collectionSelector | collectionPicker, `app.make('collection')` |
| collectionsSelector | collectionsPicker, collectionList, `app.make('collections')` |
| productSelector | productPicker, `app.make('product')` |
| productsSelector | productsPicker, productList, `app.make('products')` |
| colorSelector | colorPicker, `app.make('color')` |
| colorBackgroundSelector | colorBackgroundPicker, backgroundColorSelector, backgroundColorPicker, bgColorSelector, bgColorPicker, `app.make('bgColor')` |
| urlSelector | urlPicker, `app.make('url')` |
| backgroundImageSelector | backgroundImagePicker, backgroundImage, bgImage, `app.make('bgImage')` |
| fontSelector | fontPicker, `app.make('font')` |
| imageSelector | imagePicker, `app.make('image')` |
| subheading | `app.make('subheading')` |
| heading | `app.make('heading')` |
| text | `app.make('text')` |
| copy | `app.make('copy')` |
| html | `app.make('html')` |
| liquid | `app.make('liquid')` |
| videoLink | `app.make('videoLink')` |
| checkbox | `app.make('checkbox')` |
| number | `app.make('number')` |
| range | `app.make('range', {...})` |
| select | dropdown, `app.make('select')` |
| text | input, `app.make('text')` |
| textarea | `app.make('textarea')` |

Using these helpers, we can significantly reduce the amount of JS we have to write:
```js
// ./src/schema/iconAndHeading.js

const { app } = require('@alleyford/schematic');
const global = require('./global');

module.exports = {
  ...app.section('Icon and heading'),
  settings: [
    app.heading,
    app.make('select', {
      id: 'icon',
      label: 'Icon',
      options: [
        app.defaults.none,
        app.option('heart', 'Heart icon'),
        app.option('fire', 'Fire icon'),
      ],
    }),
    global.iconWidth,
  ],
};
```

Sometimes you have a specific code reason to change the ID or another property for a definition, but otherwise keep the definition the same. Schematic supports some helper methods to adjust definitions on the fly:
```js
  //...

  settings: [
    app.changeId(app.heading, 'heading_left'),
    app.changeId(app.heading, 'heading_right'),
    app.changeProperties(app.heading, {
      id: 'heading_center',
      label: 'Center heading',
      default: 'Welcome to Zombocom',
    }),
  ],

  //...
```

Or to make drawing panel schema a little easier:
```js
  //...

  settings: [
    app.paragraph("Icons and headings really make the world go 'round."),

    app.header('Left icon'),
    app.changeId(app.heading, 'heading_left'),
    app.changeId(common.iconWidth, 'icon_left'),

    app.header('Right icon'),
    app.changeId(app.heading, 'heading_right'),
    app.changeId(common.iconWidth, 'icon_right'),

    app.header('Center heading', "A center heading helps focus attention. Loudly."),
    app.changeProperties(app.heading, {
      id: 'heading_center',
      label: 'Center heading',
      default: 'Welcome to Zombocom',
    }),
  ],

  //...
};
```

## Bundling common patterns
Sections sometimes have fields that always go together, like a `heading`, `subheading`, and `copy`. Or a reusable CTA. Instead of defining every one repeatedly, you can use the spread (`...`) operator when pulling them from a definition.
```js
// ./src/schema/components/cta.js

module.exports = [ // default export of an array of objects
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

Include the file in your schema, and (`...cta`) will draw in all three definitions:
```js
// ./src/schema/iconAndHeading.js

const { app } = require('@alleyford/schematic');
const global = require('./global');
const cta = require('./components/cta');

module.exports = {
  ...app.section('Icon and heading'),
  settings: [
    app.header('Left icon'),
    app.changeId(app.heading, 'heading_left'),
    app.changeId(common.iconWidth, 'icon_left'),

    app.header('Right icon'),
    app.changeId(app.heading, 'heading_right'),
    app.changeId(common.iconWidth, 'icon_right'),

    ...cta,
  ],
};
```

If you have other section schema definitions which could use the same CTA pattern, you can just include the same file and its definition using the spread operator. If you ever update the original defintion, running Schematic will update all instances where it's being used.

## Auto-write boilerplate switchboard code
I think it's a helpful design pattern to keep most logic out of sections and offload it to snippets. Since you're auto-generating schema, it may make sense in some cases to also auto-generate the switchboard code to render section schema to its identically-named snippet.

You do this by passing an argument to the magic comment, like so:
```liquid
// ./sections/iconAndHeading.liquid, bottom of file

{%- comment -%} schematic iconAndHeading writeCode {%- endcomment -%}
```

Or if your files are named the same across schema, sections, and snippets:
```liquid
{%- comment -%} schematic writeCode {%- endcomment -%}
```

Running Schematic then produces the compiled schema, plus a line to render the snippet with all that schema automatically mapped:
```liquid
{%-

    render 'iconAndHeading'
        heading_left: section.settings.heading_left
        icon_left: section.settings.icon_left
        heading_right: section.settings.heading_right
        icon_right: section.settings.icon_right
        cta_copy: section.settings.cta_copy
        cta_link: section.settings.cta_link
        cta_style: section.settings.cta_style

-%}
```

**Note:** When building custom Shopify themes, it's strongly recommended to use the section/snippet separation pattern, and to use `writeCode` where possible to handle connecting variables to snippets as schema changes over time. Using `writeCode` will wipe out any other code in the file.

## Scaffolding pattern
Reiterating the above, you can use Schematic to create placeholder files for this pattern to scaffold things out when building custom sections:
`npx schematic scaffold iconAndHeading`

This will create three files:
```
./sections/iconAndHeader.liquid
./snippets/iconAndHeader.liquid
./src/schema/iconAndHeader.js
```

The section file will contain the magic comment to make Schematic work, the snippet will be blank, and the schema file will contain code to include the Schematic helper methods and types.

## Other ways to use
The approach is simple and can be worked into whatever setup you have for dev. Because it writes back to the existing `.liquid` files, be wary of infinite loops when including this in an automatic build step.

### Running on a single section file
Schematic supports [running](https://github.com/AlleyFord/schematic/issues/4) on a single section file instead of scanning the entire contents of the project. To invoke, run `npx schematic section (path/to/file)`. This can also be invoked in code through `Schematic.runSection(filePath)`.

Schematic has planned support for running on individual configuration and localization files.


## Using Schematic for settings_schema.json
Schematic will automatically write `config/settings_schema.json` for you if it detects the presence of a `settings_schema.js` file in your `schema` directory.

The file should export an array of objects that match what would be manually defined in `settings_schema.json`:

```js
// ./src/schema/settings_schema.js

const { app } = require('@alleyford/schematic');

module.exports = [
  {
    name: 'theme_info',
    theme_name: 'Magic fungus',
    //...
  },
  {
    name: 'Globals',
    settings: {
      app.header('Free shipping threshold'),
      app.make(app.types.range, {
        id: 'free_shipping_threshold',
        label: 'Amount to trigger free shipping',
        min: 0,
        max: 500,
        step: 10,
        unit: '$',
        default: 150,
      }),
      //...
    },
  },
  //...
];
```

## Using Schematic for localization features
Schematic will automatically write locale JSON for you if it detects the presence of `locales/[lang].js` in your `schema` directory.

The files should export an object that matches what would be manually defined in a locale file:

```js
// ./src/schema/locales/en.js

module.exports = {
  cart: {
    error: "Something went wrong -- please try again.",
    quantityError: "You may only add {{ quantity }} of this item to your cart.",
    //...
  },
  //...
};
```

Schematic will also try to find a magic comment and replace it with localized strings. This works as follows:
1. Schematic looks at the `localization.file` and scans for a liquid comment with `schematicLocalization`
2. It then writes JSON into the `localization.expression` string so client side code can consume it

Before running Schematic:
```liquid
// ./snippets/p-app-localization.liquid

{%- comment -%} schematicLocalization {%- endcomment -%}
```

After:
```liquid
// ./snippets/p-app-localization.liquid

{%- comment -%} schematicLocalization {%- endcomment -%}
window.app.copy = {
  "cart.error": {{ 'cart.error' | t | json }},
  "cart.quantityError": {{ 'cart.quantityError' | t | json }},
  // ...
};
```

In the above example, `window.app.copy` is coming from the Schematic configuration option for `localization.expression`. The `%%json%%` value in that expression is needed and will be replaced with the localization strings.


## Thanks
- David Warrington for initial inspiration: [liquid-schema-plugin](https://github.com/davidwarrington/liquid-schema-plugin)
- [Jacob Kossman](https://github.com/jacobkossman) for contributions & feature dev
