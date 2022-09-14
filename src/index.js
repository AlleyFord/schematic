const fs = require('fs-extra');
const path = require('path');
const { validate } = require('schema-utils');

const schema = require('./schema');


/*
  somebody make this better and tell shopify to standardize the practice.
  shopify json schema ENORMOUSLY SUCKS to work with without this kind of helper
*/


class Schematic {
  opts = {
    paths: {
      sections: './sections',
      schema: './src/schema',
    },
    verbose: true,
  };

  refSchemaEx  = /{%\-?\s*comment\s*\-?%}\s*schematic\s*['"](.*)['"]\s*{%\-?\s*endcomment\s*\-?%}/mi;
  replaceSchemaEx = /({%\-?\s*schema\s*\-?%}[\s\S]*{%\-?\s*endschema\s*\-?%})/mig


  constructor(opts = null) {
    if (opts) {
      validate(schema, opts);

      this.opts = opts;
    }
  }


  out(v, error) {
    const isError = typeof error !== 'undefined' && error;

    if (this.opts.verbose || isError) process.stdout.write(v + (isError ? "\n" : ''));
    if (isError) return false;
  }


  async run() {
    this.out(`schematic: scanning for schema in ${this.opts.paths.sections}\n`);

    const files = await fs.readdir(this.opts.paths.sections);

    return Promise.all(files.map(async file => {
      const floc = path.resolve(this.opts.paths.sections, file);
      const fstat = await fs.stat(floc);

      if (fstat.isFile() && path.extname(file) === '.liquid') {
        let contents = false;

        try {
          contents = await fs.readFile(floc, 'utf-8');

          // no schematic tag to replace
          if (!this.refSchemaEx.test(contents)) {
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
          const newContents = this.buildSchema(floc, contents);

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


  buildSchema(floc, contents) {
    const fname = path.basename(floc, '.liquid');

    this.out(`${floc}: uses schematic. generating schema...`);

    let match, importFile;

    try {
      [match, importFile] = contents.match(this.refSchemaEx);
    }
    catch(err) {
      return this.out([
        floc, err, 'matched failed',
      ].join('\n'), true);
    }

    importFile = path.resolve(this.opts.paths.schema, `${importFile}.js`);

    let schema;

    try {
      schema = require(importFile);
    }
    catch(err) {
      return this.out([
        floc, err, match, `schema not loadable: ${importFile}`,
      ].join('\n'), true);
    }

    if (typeof schema !== 'object') {
      return this.out([
        floc, schema, `schema not javascript object`,
      ].join('\n'), true);
    }

    const newSchema = [
      '{%- schema -%}',
        JSON.stringify(schema, null, 2),
      '{%- endschema -%}',
    ].join('\n');

    let newContents;

    if (this.replaceSchemaEx.test(contents)) {
      this.out(`replacing existing schema...`);
      newContents = contents.replace(this.replaceSchemaEx, newSchema);
    }
    else {
      this.out(`setting new schema...`);
      newContents = [
        contents,
        newSchema,
      ].join('\n');
    }

    this.out(`ok\n`);

    return newContents;
  }


};


module.exports = Schematic;
