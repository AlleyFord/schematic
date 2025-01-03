const methods =
{
  prefixOptions: (prefix, options) => {
    let newOpts = [];
    let obj = options;
    let flag = false;

    if (options.hasOwnProperty('options')) {
      obj = options.options;
      flag = true;
    }

    for (const opt of obj) {
      newOpts.push({
        value: `${prefix}${opt.value}`,
        label: opt.label,
      });
    }

    return flag ? {...options, ...{options: newOpts}} : newOpts;
  },
  suffixOptions: (suffix, options) => {
    let newOpts = [];
    let obj = options;
    let flag = false;

    if (options.hasOwnProperty('options')) {
      obj = options.options;
      flag = true;
    }

    for (const opt of obj) {
      newOpts.push({
        value: `${opt.value}${suffix}`,
        label: opt.label,
      });
    }

    return flag ? {...options, ...{options: newOpts}} : newOpts;
  },

  enumerateId: (obj, index) => {
    if (Array.isArray(obj)) {
      return obj.map((item, i) => {
        return methods.enumerateId(item, index);
      });
    }

    return methods.changeId(obj, `${obj.id}_${index}`);
  },

  prefixIds: (prefix, obj) => methods.prefixId(prefix, obj),
  prefixId: (prefix, obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => {
        return methods.prefixId(prefix, item);
      });
    }

    return methods.changeId(obj, `${prefix}${obj.id}`);
  },

  changeId: (obj, id) => methods.changeProperty(obj, 'id', id),
  changeLabel: (obj, label) => methods.changeProperty(obj, 'label', label),
  changeDefault: (obj, def) => methods.changeProperty(obj, 'default', def),
  changeLimit: (obj, limit) => methods.changeProperty(obj, 'limit', limit),

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

  removeType: (arr = [], type) => {
    return methods.arrayRemoveNotMatching(arr, 'type', type);
  },
  removeTypes: (arr = [], types = []) => {
    return methods.arrayRemoveNotMatching(arr, 'type', types);
  },
  removeId: (arr = [], id) => {
    return methods.arrayRemoveNotMatching(arr, 'id', id);
  },
  removeIds: (arr = [], ids = []) => {
    return methods.arrayRemoveNotMatching(arr, 'id', ids);
  },

  arrayRemoveNotMatching: (arr = [], key, values) => {
    if (Array.isArray(values)) {
      for (const value of values) {
        arr = methods.arrayRemoveNotMatching(arr, key, value);
      }

      return arr;
    }
    else {
      return arr.filter(obj => {
        return obj[key] !== values;
      });
    }
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

  makeRange: (props) => { // deprecated
    let range = {
      type: 'range',
      id: 'range',
      label: 'Range',
    };

    return {...range, ...props};
  },

  option: (value, label, group) => {
    let obj = {
      value: value,
      label: label,
    };

    if(typeof group !== 'undefined') obj.group = group;

    return obj;
  },

  header: (content, info) => methods.sidebar('header', content, info),
  paragraph: content => methods.sidebar('paragraph', content),
  sidebar: (type, content, info) => {
    let obj = {
      type: type,
      content: content,
    };

    if (typeof info !== 'undefined') obj.info = info;

    return obj;
  },

  section: (name, props = {}) => {
    const tag = props.tag || 'section';
    const presets = props.presets || [
      { name }
    ]

    let obj = {
      name,
      tag,
      ...methods.make(props),
      presets
    };
    
    return obj;
  },

  _: (k) => methods.translate(k),
  translate: (k) => {
    return `t:${k}`;
  },


  // factory thing for components
  // app.make('articleSelector', {id: 'test', default: 'test'})
  // app.make(app.common.input, {...})
  // app.make(app.urlPicker, {...})
  input: function(type, props) {
    return methods.make(type, props);
  },
  make: function(type, props = {}) {
    if (type === 'undefined') return null;
    let common = {};

    // json was passed directly. just apply the properties
    if (typeof type === 'object') {
      common = {...type};
    }

    // more basic type was passed
    else {
      // prefer molecule
      if (this.common[type]) common = this.common[type];

      // fallback atom
      else if (this.types[type]) common = {
        type: this.types[type],
        id: this.types[type],
        label: this.types[type].charAt(0).toUpperCase() + this.types[type].slice(1),
      };

      // full blown organism? i don't know
      else if (this[type]) common = {...this[type]};
    }

    return {...common, ...props};
  },
};

module.exports = methods;
