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

  pageSelector: {
    type: 'page',
    id: 'page',
    label: 'Page',
  },

  menuSelector: {
    type: 'link_list',
    id: 'menu',
    label: 'Menu',
  },

  collectionSelector: {
    type: 'collection',
    id: 'collection',
    label: 'Collection',
  },

  collectionsSelector: {
    type: 'collection_list',
    id: 'collections',
    label: 'Collections',
    limit: 8,
  },

  productSelector: {
    type: 'product',
    id: 'product',
    label: 'Product',
  },

  productsSelector: {
    type: 'product_list',
    id: 'products',
    label: 'Products',
    limit: 8,
  },

  colorSelector: {
    type: 'color',
    id: 'color',
    label: 'Color',
  },

  urlSelector: {
    type: 'url',
    id: 'url',
    label: 'URL',
  },

  colorBackgroundSelector: {
    type: 'color_background',
    id: 'background_color',
    label: 'Background color',
  },

  fontSelector: {
    type: 'font_picker',
    id: 'font',
    label: 'Font',
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

  number: {
    type: 'number',
    id: 'num',
    label: 'Number',
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

  html: {
    type: 'html',
    id: 'html',
    label: 'Raw HTML',
  },

  liquid: {
    type: 'liquid',
    id: 'liquid',
    label: 'Raw Liquid',
  },

  videoLink: {
    type: 'video_url',
    id: 'video_url',
    label: 'Video URL',
    accept: [
      'vimeo',
      'youtube',
    ],
  },

  /*
    theming
  */
  font: {
    type: 'select',
    id: 'font',
    label: 'Font',
    options: [
      {
        value: '',
        label: 'Default',
      },
      {
        value: 'sans',
        label: 'Sans serif',
      },
      {
        value: 'serif',
        label: 'Serif',
      },
      {
        value: 'script',
        label: 'Script',
      },
    ],
    default: '',
  },

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
