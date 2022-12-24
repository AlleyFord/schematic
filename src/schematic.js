const fs = require('fs-extra');
const path = require('path');
const { validate } = require('schema-utils');

const schema = require('./schema');


/*
  somebody make this better and tell shopify to standardize the practice.
  shopify json schema ENORMOUSLY SUCKS to work with without this kind of helper
*/


class Schematic {
  #opts = {
    paths: {
      sections: './sections',
      config: './config',
      schema: './src/schema',
    },
    verbose: true,
  };

  #refSchemaEx  = /{%\-?\s*comment\s*\-?%}\s*schematic\s*['"](.*)['"]\s*(.*)?{%\-?\s*endcomment\s*\-?%}/mi;
  #replaceSchemaEx = /({%\-?\s*schema\s*\-?%}[\s\S]*{%\-?\s*endschema\s*\-?%})/mig;


  constructor(opts = null) {
    if (opts) {
      validate(schema, opts);

      this.#opts = opts;
    }
  }


  out(v, error) {
    const isError = typeof error !== 'undefined' && error;

    if (this.#opts.verbose || isError) process.stdout.write(v + (isError ? "\n" : ''));
    if (isError) return false;
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


  async run() {
    await this.buildConfig();

    this.out(`schematic: scanning for schema in ${this.#opts.paths.sections}\n`);

    const files = await fs.readdir(this.#opts.paths.sections);

    return Promise.all(files.map(async file => {
      const floc = path.resolve(this.#opts.paths.sections, file);
      const fstat = await fs.stat(floc);

      if (fstat.isFile() && path.extname(file) === '.liquid') {
        let contents = false;

        try {
          contents = await fs.readFile(floc, 'utf-8');

          // no schematic tag to replace
          if (!this.#refSchemaEx.test(contents)) {
            return;
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

    const importFile = path.resolve(this.#opts.paths.schema, `${importFilename}.js`);
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


class SchematicObjects {
  common = {};
  mutations = {};

  constructor() {
    this.common = require('./schema/common.js');
    this.mutations = require('./schema/mutations.js');
  }
}


module.exports = {
  Schematic: Schematic,
  app: new SchematicObjects(),
};
