const fs = require('fs-extra');
const path = require('path');



class Schematic {
  #opts = {
    paths: {
      config: './config',
      sections: './sections',
      snippets: './snippets',
      schema: './src/schema',
    },
    verbose: true,
  };

  #refSchemaEx = /{%\-?\s*comment\s*\-?%}\s*schematic\s*['"]?([^'"\s{]+)?['"]?\s*(.*)?{%\-?\s*endcomment\s*\-?%}/mi;
  #replaceSchemaEx = /({%\-?\s*schema\s*\-?%}[\s\S]*{%\-?\s*endschema\s*\-?%})/mig;

  //loader = require.resolve('./webpackLoader.js');

  constructor(opts = null) {
    if (opts) {
      this.#opts = opts;
    }
  }


  out(v, error) {
    const isError = typeof error !== 'undefined' && error;

    if (this.#opts.verbose || isError) process.stdout.write(v + (isError ? "\n" : ''));
    if (isError) return false;
  }

  async preCheck() {
    let statCheck = true;
    let fails = [];

    for (const [name, fpath] of Object.entries(this.#opts.paths)) {
      try {
        await fs.stat(path.resolve(fpath));
      }
      catch(e) {
        fails.push(`${name}:${fpath}`);
      }
    }

    if (fails.length) {
      console.log('could not find required directories from this path. run in the shopify theme root? (' + fails.join(', ') + ')');
      process.exit();
    }
  }

  async buildConfig() {
    this.out(`schematic: checking for ${this.#opts.paths.schema}/settings_schema.js...`);

    const settingsSchema = path.resolve(this.#opts.paths.schema, `settings_schema.js`);

    if (fs.existsSync(settingsSchema)) {
      this.out(`uses schematic. generating schema...`);

      const schema = this.compileSchema(settingsSchema);

      if (schema) {
        try {
          const parsed = JSON.stringify(schema, null, 2);

          await fs.writeFile(path.resolve(this.#opts.paths.config, 'settings_schema.json'), parsed);
        }
        catch(err) {
          return this.out(`error writing to file: ${err}`, true);
        }

        this.out(`ok\n`);
      }
    }
    else {
      this.out(`nothing to do\n`);
    }
  }


  commands() {
    return (process.argv || []).slice(2);
  }
  exit(v) {
    console.log(v);
    process.exit();
  }

  async scaffold(filename) {
    filename = filename.replace(/(\.js|\.liquid|[^a-z0-9\-\_])/g, '');

    const files = {
      section: `${this.#opts.paths.sections}/${filename}.liquid`,
      snippet: `${this.#opts.paths.snippets}/${filename}.liquid`,
      schema: `${this.#opts.paths.schema}/${filename}.js`,
    };

    for (const [type, file] of Object.entries(files)) {
      const floc = path.resolve(file);
      let content = '';

      if (fs.existsSync(floc)) {
        this.out(`schematic: scaffold: file exists: ${floc}`, true);
        continue;
      }

      this.out(`schematic: scaffold: creating ${type}: ${floc}\n`);

      if (type === 'section') content = `{%- comment -%} schematic writeCode {%- endcomment -%}\n`;
      if (type === 'schema') content = `const { app } = require('@alleyford/schematic');\n\n\nmodule.exports = {\n  name: "",\n  settings: [],\n  blocks: [],\n};\n`;

      await fs.writeFile(floc, content);
    }
  }


  async run(files) {
    await this.preCheck();
    await this.buildConfig();

    this.out(`schematic: scanning for schema in ${this.#opts.paths.sections}\n`);

    if (typeof files === 'undefined' || !files) {
      files = await fs.readdir(this.#opts.paths.sections, 'utf8');
    }

    return Promise.all(files.map(async file => {
      const floc = path.resolve(this.#opts.paths.sections, file);
      const fstat = await fs.stat(floc);

      if (fstat.isFile() && path.extname(file) === '.liquid') {
        let contents = false;

        try {
          contents = await fs.readFile(floc, 'utf8');

          // no schematic tag to replace
          if (!this.#refSchemaEx.test(contents)) {
            return this.out(`${floc}: no schematic code\n`);
          }
          if (!contents) {
            return this.out(`${floc}: no file contents\n`);
          }
        }
        catch(err) {
          this.out(`${floc}: ${err}`, true);
        }

        try {
          const newContents = await this.buildSchema(floc, contents);

          if (newContents) {
            await fs.writeFile(floc, newContents);
          }
          else {
            this.out(`${floc}: new contents failed\n`);
          }
        }
        catch(err) {
          this.out(`${floc}: ${err}`, true);
        }
      }
    }))
    .catch(err => {
      this.out(`${err}`, true);
    });
  }

  compileSchema(file) {
    let schema;

    try {
      schema = require(file);
    }
    catch(err) {
      return this.out([
        err, `schema not loadable: ${file}`,
      ].join('\n'), true);
    }

    if (typeof schema !== 'object') {
      return this.out([
        schema, `schema not javascript object`,
      ].join('\n'), true);
    }

    // transforms for old schema to new shopify schema
    if (typeof schema.templates !== 'undefined') {
      schema['enabled_on'] = {templates: schema.templates};
      delete schema.templates;
    }

    return schema;
  }


  async buildSchema(floc, contents) {
    if (typeof contents === 'undefined') {
      contents = await fs.readFile(floc, 'utf-8');
    }

    const fname = path.basename(floc, '.liquid');

    this.out(`${floc}: uses schematic. generating schema...`);

    let match, importFilename, opts;

    try {
      [match, importFilename, opts] = contents.match(this.#refSchemaEx);
    }
    catch(err) {
      return this.out([
        floc, err, 'matched failed',
      ].join('\n'), true);
    }

    const filename = floc.match(/[^\\/]+?(?=\.\w+$)/)[0];

    // if no filename, let's try to derive it from the path
    if (!importFilename) {
      importFilename = filename;
    }

    let importFile = path.resolve(this.#opts.paths.schema, `${importFilename}.js`);

    // doesn't exist, likely schematic options instead
    if (!fs.existsSync(importFile)) {
      opts = importFilename;
      importFilename = filename;
      importFile = path.resolve(this.#opts.paths.schema, `${importFilename}.js`);
    }

    const schema = this.compileSchema(importFile);

    const newSchema = [
      '{%- schema -%}',
        JSON.stringify(schema, null, 2),
      '{%- endschema -%}',
    ].join('\n');

    let newContents;

    if (this.#replaceSchemaEx.test(contents)) {
      this.out(`replacing existing schema...`);
      newContents = contents.replace(this.#replaceSchemaEx, newSchema);
    }
    else {
      this.out(`setting new schema...`);
      newContents = [
        contents,
        newSchema,
      ].join('\n');
    }

    if (opts) {
      opts = opts.split(' ');

      for (let opt of opts) {
        opt = opt.trim();

        if (opt === 'writeCode') {
          this.out(`writing switchboard code...`);

          newContents = this.writeCode(newContents, importFilename, schema);
        }
      }
    }

    this.out(`ok.\n`);

    return newContents;
  }


  writeCode(contents, importFilename, schema) {
    let lines = [], rendered = '';

    if (schema.settings) {
      for (const obj of schema.settings) {
        if (obj.id) {
          lines.push(`${obj.id}: section.settings.${obj.id}`);
        }
      }
    }

    if (schema.blocks) {
      lines.push(`blocks: section.blocks`);
    }

    for (const line of lines) {
      rendered += `    ${line}\n`;
    }

    const code = `{%-

  render '${importFilename}'
${rendered}
-%}
{%- comment -%} schematic`;

    return contents.replace(/^([.\s\S]*){%\-?\s*comment\s*\-?%}\s*schematic/mgi, code);
  }
};


class SchematicHelpers {
  constructor() {
    let loader = [
      require('./helpers/common.js'),
      require('./helpers/methods.js'),
    ];

    for (const props of loader) {
      for (const [key, def] of Object.entries(props)) {
        this[key] = def;
      }
    }
  }
}


module.exports = {
  Schematic: Schematic,
  SchematicHelpers: SchematicHelpers,
};
