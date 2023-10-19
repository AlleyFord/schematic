const methods =
{
  prefixOptions: (prefix, options) => {
    let newOpts = [];

    for (const opt of options) {
      newOpts.push({
        value: `${prefix}${opt.value}`,
        label: opt.label,
      });
    }

    return newOpts;
  },
  suffixOptions: (suffix, options) => {
    let newOpts = [];

    for (const opt of options) {
      newOpts.push({
        value: `${opt.value}${suffix}`,
        label: opt.label,
      });
    }

    return newOpts;
  },

  enumerateId: (obj, index) => {
    if (Array.isArray(obj)) {
      return obj.map((item, i) => {
        return methods.enumerateId(item, index);
      });
    }

    return methods.changeId(obj, `${obj.id}_${index}`);
  },

  changeId: (obj, id) => {
    return methods.changeProperty(obj, 'id', id);
  },
  changeLabel: (obj, label) => {
    return methods.changeProperty(obj, 'label', label);
  },
  changeDefault: (obj, def) => {
    return methods.changeProperty(obj, 'default', def);
  },
  changeLimit: (obj, limit) => {
    return methods.changeProperty(obj, 'limit', limit);
  },

  changeProperty: (obj, key, value) => {
    let newObj = {...obj};
    newObj[key] = value;

    return newObj;
  },
  changeProperties: (obj, props = {}) => {
    if (Array.isArray(obj)) {
      return obj.map((item, i) => {
        return methods.changeProperties(item, props);
      });
    }

    return {...obj, ...props};
  },

  removeProperty: (obj, key) => {
    let newObj = {...obj};
    delete newObj[key];

    return newObj;
  },
  removeProperties: (obj, keys) => {
    keys.forEach(key => {
      obj = methods.removeProperty(obj, key);
    });

    return obj;
  },

  makeRange: (props) => {
    let range = {
      type: 'range',
      id: 'range',
      label: 'Range',
    };

    return {...range, ...props};
  },

  header: (content, info) => {
    return methods.sidebar('header', content, info);
  },
  paragraph: content => {
    return methods.sidebar('paragraph', content);
  },

  sidebar: (type, content, info) => {
    let obj = {
      type: type,
      content: content,
    };

    if (typeof info !== 'undefined') obj.info = info;

    return obj;
  },

  section: (name, tag = 'section') => {
    return {
      name: name,
      tag: tag,
      presets: [
        {
          name: name,
        },
      ],
    };
  },


  // factory thing for components
  // app.make('articleSelector', {id: 'test', default: 'test'})
  input: function(type, props) {
    return methods.make(type, props);
  },
  make: function(type, props = {}) {
    if (type === 'undefined') return null;

    let common = {};

    // molecule
    if (this.common[type]) common = this.common[type];

    // atom
    else if (this.types[type]) common = {
      type: this.types[type],
      id: this.types[type],
      label: this.types[type].charAt(0).toUpperCase() + this.types[type].slice(1),
    };

    // full blown organism? i don't know
    else if (this[type]) common = {...this[type]};

    return {...common, ...props};
  },
};

module.exports = methods;
