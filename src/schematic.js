const fs = require('fs-extra');
const path = require('path');



class Schematic {
  #opts = {
    paths: {
      config: './config',
      sections: './sections',
      snippets: './snippets',
      locales: './locales',
      schema: './src/schema',
    },
    localization: {
      file: './snippets/p-app-localization.liquid',
      expression: 'window.app.copy = %%json%%;', // final semicolon is important
    },
    verbose: true,
  };

  #refSchemaEx = /{%\-?\s*comment\s*\-?%}\s*schematic\s*['"]?([^'"\s{]+)?['"]?\s*(.*)?{%\-?\s*endcomment\s*\-?%}/mi;
  #localizationEx = /{%\-?\s*comment\s*\-?%}\s*schematicLocalization\s*{%\-?\s*endcomment\s*\-?%}/mi;
  #replaceSchemaEx = /({%\-?\s*schema\s*\-?%}[\s\S]*{%\-?\s*endschema\s*\-?%})/mig;

  #preCheckOk = false;

  //loader = require.resolve('./webpackLoader.js');

  constructor(opts = null) {
    if (opts) {
      this.#opts = opts;
    }
  }

  envDefaults() {
    if ([true, 'true', 1, '1'].includes(process.env.SCHEMATIC_VERBOSE)) this.#opts.verbose = true;
    else this.#opts.verbose = false;

    if (process.env.SCHEMATIC_PATH_CONFIG) this.#opts.paths.config = String(process.env.SCHEMATIC_PATH_CONFIG).trim();
    if (process.env.SCHEMATIC_PATH_SECTIONS) this.#opts.paths.sections = String(process.env.SCHEMATIC_PATH_SECTIONS).trim();
    if (process.env.SCHEMATIC_PATH_SNIPPETS) this.#opts.paths.snippets = String(process.env.SCHEMATIC_PATH_SNIPPETS).trim();
    if (process.env.SCHEMATIC_PATH_SCHEMA) this.#opts.paths.schema = String(process.env.SCHEMATIC_PATH_SCHEMA).trim();
  }

  out(v, error) {
    const isError = typeof error !== 'undefined' && error;

    if (this.#opts.verbose || isError) process.stdout.write(v + (isError ? "\n" : ''));
    if (isError) return false;
  }

  async preCheck() {
    if (this.#preCheckOk) return;

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

    this.#preCheckOk = true;
  }

  async writeLocalization() {
    this.out(`schematic: attempting to write localization in ${this.#opts.localization.file}...`);

    const localizationFile = path.resolve(this.#opts.localization.file);

    if (!fs.existsSync(localizationFile)) {
      this.out(`nothing to do\n`);
      return;
    }

    let contents = false, comment = '';

    try {
      contents = await fs.readFile(localizationFile, 'utf8');

      // no schematic tag to replace
      if (!this.#localizationEx.test(contents)) {
        return this.out(`${localizationFile}: no schematic code\n`);
      }
      else {
        // capture the comment to rewrite and preserve author's stylistic preferences
        comment = contents.match(this.#localizationEx)[0];
      }

      if (!contents) {
        return this.out(`${localizationFile}: no file contents\n`);
      }
    }
    catch(err) {
      return this.out(`${localizationFile}: ${err}`, true);
    }

    let defaultLocale;

    fs.readdirSync(this.#opts.paths.locales).every(file => {
      if (/default\.json$/.test(file)) {
        const localePath = path.resolve(this.#opts.paths.locales, file);

        try {
          defaultLocale = JSON.parse(fs.readFileSync(localePath, 'utf8'));
        }
        catch(err) {
          return this.out(`error reading & parsing default locale ${localePath}: ${err}`, true);
        }
      }

      return true;
    });

    const reducePaths = (obj = {}, prev = '') => {
      return Object.entries(obj).reduce((path, [k, v]) => {
        const fpath = prev ? `${prev}.${k}` : k;
        return (v && typeof v === 'object' && !Array.isArray(v))
          ? path.concat(reducePaths(v, fpath))
          : path.concat(fpath);
      }, []);
    };

    let localeExpr = '';

    reducePaths(defaultLocale).forEach((k, i, a) => {
      const delim = i === a.length - 1 ? '' : ',';
      localeExpr += `  "${k}": {{ '${k}' | t | json }}${delim}\n`;
    });

    localeExpr = this.#opts.localization.expression.replace('%%json%%', `{\n${localeExpr}}`);

    const replaceLocalizationExprEx = this.#opts.localization.expression.replaceAll('.', '\\.').replaceAll(' ', '\\ ').replace('%%json%%', '{.*?}');
    const replaceLocalizationCommentEx = '{%\\-?\\s*comment\\s*\\-?%}\\s*schematicLocalization\\s*{%\\-?\\s*endcomment\\s*\\-?%}\\s*?';
    const replaceLocalizationEx = new RegExp(replaceLocalizationCommentEx + replaceLocalizationExprEx, 'mis');

    try {
      let newContents;

      if (replaceLocalizationEx.test(contents)) {
        newContents = contents.replace(replaceLocalizationEx, comment + `\n` + localeExpr);
      }
      else {
        newContents = contents.replace(new RegExp(replaceLocalizationCommentEx, 'mis'), comment + `\n` + localeExpr);
      }

      await fs.writeFile(localizationFile, newContents);
    }
    catch(err) {
      return this.out(`couldn't write localization: ${err}`, true);
    }

    return this.out(`ok\n`);
  }

  async buildLocales() {
    const localePath = `${this.#opts.paths.schema}/locales`;
    this.out(`schematic: checking for locale definitions in ${localePath}...`);

    if (!fs.existsSync(localePath)) {
      this.out(`nothing to do\n`);
      return;
    }

    this.out(`exists. generating locales...`);

    fs.readdirSync(localePath).forEach(sourceFile => {
      const localeFilename = sourceFile.replace('.js', '.json');
      const sourceLocalePath = path.resolve(localePath, sourceFile);
      const targetLocalePath = path.resolve(this.#opts.paths.locales, localeFilename);

      const schema = this.compileSchema(sourceLocalePath);

      if (schema) {
        try {
          const parsed = JSON.stringify(schema, null, 2);
          fs.writeFileSync(targetLocalePath, parsed);
        }
        catch(err) {
          return this.out(`error writing to file: ${err}`, true);
        }

        this.out(`ok\n`);
      }
    });

    return this.writeLocalization();
  }

  async buildConfig() {
    this.out(`schematic: checking for ${this.#opts.paths.schema}/settings_schema.js...`);

    const settingsSchema = path.resolve(this.#opts.paths.schema, `settings_schema.js`);

    if (!fs.existsSync(settingsSchema)) {
      this.out(`nothing to do\n`);
      return;
    }

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
      if (type === 'snippet') content = `{%- liquid\n\n\n\n-%}\n<div class="${filename}">\n</div>\n`;
      if (type === 'schema') content = `const { app } = require('@alleyford/schematic');\n\n\nmodule.exports = {\n  ...app.section('Boilerplate'),\n  enabled_on: {\n    templates: app.wildcard,\n    groups: app.wildcard,\n  },\n  settings: [],\n  blocks: [\n    {type: '@app'},\n  ],\n};\n`;

      await fs.writeFile(floc, content);
    }
  }


  async resolvePath(file, defaultDir) {
    let floc = false;
    let fstat = false;

    const defaultPath = defaultDir ?? this.#opts.paths.sections;

    // full path or relative correct from execution path
    try {
      floc = path.resolve(file);
      fstat = await fs.stat(floc);

      // if the schema file, resolve back to the liquid file
      if (floc.includes(this.#opts.paths.schema.replace('./', '/'))) {
        let [, filename] = file.match(/.*\/(.+)$/);

        floc = path.resolve(defaultPath, filename.replace(/\.[mc]?js$/, '.liquid'));
        fstat = await fs.stat(floc);
      }
    }

    // from a simple filename or in a glob from relative path
    catch(e) {
      floc = path.resolve(defaultPath, file);
      fstat = await fs.stat(floc);
    }

    return {
      floc: floc,
      fstat: fstat,
    };
  }


  async runSection(file) {
    await this.preCheck();

    const { floc, fstat } = await this.resolvePath(file, this.#opts.paths.sections);

    if (fstat.isFile()) {
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
  }

  async run(files) {
    await this.preCheck();
    await this.buildConfig();
    await this.buildLocales();

    this.out(`schematic: scanning for schema in ${this.#opts.paths.sections}\n`);

    if (typeof files === 'undefined' || !files) {
      files = await fs.readdir(this.#opts.paths.sections, 'utf8');
    }

    return Promise.all(files.map(async file => {
      await this.runSection(file);
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

    if (schema === false) {
      return this.out(`error compiling schema. abandoning`);
    }

    const newSchema = [
      '{% schema %}',
        JSON.stringify(schema, null, 2),
      '{% endschema %}',
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
