const fs = require('fs-extra');
const path = require('path');
const { validate } = require('schema-utils');

const schema = require('./schema');



class Schematic {
  opts = {
    paths: {
      sections: './sections',
      schema: './src/schema',
    },
    verbose: true,
  };

  constructor(opts = null) {
    if (opts) {
      validate(schema, opts);

      this.opts = opts;
    }
  }


  out(v) {
    if (this.opts.verbose) process.stdout.write(v);
  }


  async run() {
    this.out(`schematic: scanning for schema in ${this.opts.paths.sections}\n`);

    const files = await fs.readdir(this.opts.paths.sections);

    return Promise.all(
      files.map(async file => {
        const floc = path.resolve(this.opts.paths.sections, file);
        const fstat = await fs.stat(floc);

        if (fstat.isFile() && path.extname(file) === '.liquid') {
          try {
            const contents = await this.buildSchema(floc);

            await fs.writeFile(floc, contents);
          }
          catch(err) {
            throw `/${floc}: ${err}`;
          }
        }
      })
    );
  }


  async buildSchema(floc) {
    const fname = path.basename(floc, '.liquid');
    const contents = await fs.readFile(floc, 'utf-8');

    const refSchemaEx  = /{%\-?\s*comment\s*\-?%}\s*schematic\s*['"](?<file>.*)['"]\s*{%\-?\s*endcomment\s*\-?%}/mi;
    const replaceSchemaEx = /({%\-?\s*schema\s*\-?%}[\s\S]*?{%\-?\s*endschema\s*\-?%})/mi;

    // no schema to replace
    if (!refSchemaEx.test(contents)) {
      return contents;
    }

    this.out(`  ${floc}: uses schematic. generating schema...`);

    let [match, importPath, , guts] = contents.match(refSchemaEx);

    importPath = path.resolve(this.opts.paths.schema, importPath + '.js');

    let importSchema;

    try {
      importSchema = require(importPath);
    }
    catch(err) {
      throw [
        match, '^',
        `    schema to import not found or unreadable: ${importPath}`,
        `    in ${floc}`,
      ].join('\n');
    }

    try {
      guts = JSON.parse(guts);
    }
    catch(err) {
      guts = null;
    }

    let schema = importSchema;

    if (typeof schema !== 'object') {
      throw [
        schema, '^',
        `    schema expected to be of type "object"`,
        `    in ${require.resolve(importPath)}`,
      ].join('\n');
    }

    const newSchema = [
      '{%- schema -%}',
        JSON.stringify(schema, null, 2),
      '{%- endschema -%}',
    ].join('\n');
    let newContents = contents;

    if (replaceSchemaEx.test(newContents)) {
      newContents = newContents.replace(replaceSchemaEx, newSchema);
    }
    else {
      newContents = [
        newContents,
        newSchema,
      ].join('\n');
    }

    this.out(`ok\n`);

    return newContents;
  }


};


module.exports = Schematic;
