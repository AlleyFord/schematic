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
    let newObj = {...obj};

    if (obj.hasOwnProperty('id')) {
      newObj.id = id;
    }

    return newObj;
  },

  header: text => {
    return {
      type: 'header',
      content: text,
    };
  },
};

module.exports = mutations;
