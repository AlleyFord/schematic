module.exports =
{
  /*
    common shopify selectors
  */
  articleSelector: {
    type: 'article',
    id: 'article',
    label: 'Article',
  },

  blogSelector: {
    type: 'blog',
    id: 'blog',
    label: 'Blog',
  },

  normalTemplates: [
    'article',
    'index',
    'page',
    'product',
    'blog',
    'collection',
    'list-collections',
    'gift_card',
  ],
  allTemplates: [
    '404',
    'article',
    'blog',
    'cart',
    'collection',
    'customers/account',
    'customers/activate_account',
    'customers/addresses',
    'customers/login',
    'customers/order',
    'customers/register',
    'customers/reset_password',
    'gift_card',
    'index',
    'list-collections',
    'page',
    'password',
    'product',
    'search',
  ],


  /*
    common elements
  */
  subheading: {
    type: 'text',
    id: 'subheading',
    label: 'Subheading',
  },

  heading: {
    type: 'text',
    id: 'heading',
    label: 'Heading',
  },

  copy: {
    type: 'richtext',
    id: 'copy',
    label: 'Copy',
  },

  image: {
    type: 'image_picker',
    id: 'image',
    label: 'Image',
  },

  backgroundImage: {
    type: 'image_picker',
    id: 'background_image',
    label: 'Background image',
  },


  /*
    themeing
  */
  orientation: {
    type: 'radio',
    id: 'orientation',
    label: 'Orientation',
    options: [
      {
        value: 'left',
        label: 'Left',
      },
      {
        value: 'right',
        label: 'Right',
      },
    ],
    default: 'right',
  },

  imageStyle: {
    type: 'select',
    id: 'image_style',
    label: 'Image style',
    options: [
      {
        value: 'cover',
        label: 'Cover',
      },
      {
        value: 'full',
        label: 'Full',
      },
    ],
    default: 'cover',
  },
};
