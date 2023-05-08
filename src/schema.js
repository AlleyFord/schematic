module.exports = {
  type: 'object',
  required: ['paths'],
  properties: {
    paths: {
      description: 'Directories with the schema files and sections',
      type: 'object',
      required: ['sections', 'schema'],
      properties: {
        sections: {
          description: 'Directory of Shopify section files',
          type: 'string',
        },
        schema: {
          description: 'Directory of schema definition files',
          type: 'string',
        },
      },
    },
    verbose: {
      description: 'Echos out what it is doing',
      type: 'boolean',
    },
  },
  additionalProperties: false,
};
