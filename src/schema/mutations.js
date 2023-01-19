const mutations =
{
  enumerateId: (obj, index) => {
    if (Array.isArray(obj)) {
      return obj.map((item, i) => {
        return mutations.enumerateId(item, index);
      });
    }

    return mutations.changeId(obj, `${obj.id}_${index}`);
  },


  changeId: (obj, id) => {
    return mutations.changeProperty(obj, 'id', id);
  },
  changeLabel: (obj, label) => {
    return mutations.changeProperty(obj, 'label', label);
  },
  changeDefault: (obj, def) => {
    return mutations.changeProperty(obj, 'default', def);
  },
  changeLimit: (obj, limit) => {
    return mutations.changeProperty(obj, 'limit', limit);
  },


  changeProperties: (obj, props = {}) => {
    if (Array.isArray(obj)) {
      return obj.map((item, i) => {
        return mutations.changeProperties(item, props);
      });
    }

    return {...obj, ...props};
  },
  changeProperty: (obj, key, value) => {
    let newObj = {...obj};

    newObj[key] = value;

    return newObj;
  },


  removeProperties: (obj, keys) => {
    keys.forEach(key => {
      obj = mutations.removeProperty(obj, key);
    });

    return obj;
  },
  removeProperty: (obj, key) => {
    let newObj = {...obj};

    delete newObj[key];

    return newObj;
  },


  makeRange: (props) => {
    let range = {
      type: 'range',
      id: 'range',
      label: 'Range',
    };

    return {...range, ...props};
  },


  header: content => {
    return mutations.sidebar('header', content);
  },
  paragraph: content => {
    return mutations.sidebar('paragraph', content);
  },

  sidebar: (type, content) => {
    return {
      type: type,
      content: content,
    };
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
};

module.exports = mutations;
