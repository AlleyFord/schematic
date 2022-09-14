in your shopify theme directory:

`mkdir -p src/schema`

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

```
// sections/icons.liquid, bottom of file

{%- comment -%} schematic 'exampleIcons' {%- endcomment -%}
```

`touch schematic && chmod +x schematic`

```
// schematic

#!/usr/bin/env node --no-warnings
const Schematic = require('schematic');
const app = new Schematic();
app.run();
```

`./schematic`
