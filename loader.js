const { Schematic, SchematicHelpers } = require('./src/schematic.js');

module.exports = {
  Schematic: Schematic,
  app: new SchematicHelpers(),
};
