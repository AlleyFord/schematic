// theme editor input types
const types = {
  // basic
  checkbox: 'checkbox',
  number: 'number',
  radio: 'radio',
  range: 'range',
  select: 'select',
  dropdown: 'select',
  text: 'text',
  textarea: 'textarea',
  input: 'text',

  // specialized
  article: 'article',
  blog: 'blog',
  collection: 'collection',
  collections: 'collection_list',
  collectionList: 'collection_list',
  color: 'color',
  bgColor: 'color_background',
  backgroundColor: 'color_background',
  colorBackground: 'color_background',
  colorScheme: 'color_scheme',
  colorSchemeGroup: 'color_schema_group',
  font: 'font_picker',
  html: 'html',
  image: 'image_picker',
  inlineRichtext: 'inline_richtext',
  menu: 'link_list',
  linkList: 'link_list',
  liquid: 'liquid',
  page: 'page',
  product: 'product',
  products: 'product_list',
  productList: 'product_list',
  richtext: 'richtext',
  url: 'url',
  video: 'video',
  videoUrl: 'video_url',
};

// shopify page template types
const templates = {
  '404': '404',
  notFound: '404',
  article: 'article',
  blog: 'blog',
  cart: 'cart',
  collection: 'collection',
  account: 'customers/account',
  activateAccount: 'customers/activate_account',
  addresses: 'customers/addresses',
  login: 'customers/login',
  order: 'customers/order',
  register: 'customers/register',
  resetPassword: 'customers/reset_password',
  giftCard: 'gift_card',
  index: 'index',
  collections: 'list-collections',
  page: 'page',
  password: 'password',
  product: 'product',
  search: 'search',
};

// common shopify input components
const common = {
  articleSelector: {
    type: types.article,
    id: 'article',
    label: 'Article',
  },

  blogSelector: {
    type: types.blog,
    id: 'blog',
    label: 'Blog',
  },

  pageSelector: {
    type: types.page,
    id: 'page',
    label: 'Page',
  },

  menuSelector: {
    type: types.menu,
    id: 'menu',
    label: 'Menu',
  },

  collectionSelector: {
    type: types.collection,
    id: 'collection',
    label: 'Collection',
  },

  collectionsSelector: {
    type: types.collections,
    id: 'collections',
    label: 'Collections',
    limit: 8,
  },

  productSelector: {
    type: types.product,
    id: 'product',
    label: 'Product',
  },

  productsSelector: {
    type: types.products,
    id: 'products',
    label: 'Products',
    limit: 8,
  },

  colorSelector: {
    type: types.color,
    id: 'color',
    label: 'Color',
  },

  urlSelector: {
    type: types.url,
    id: 'url',
    label: 'URL',
  },

  colorBackgroundSelector: {
    type: types.bgColor,
    id: 'background_color',
    label: 'Background color',
  },

  fontSelector: {
    type: types.font,
    id: 'font',
    label: 'Font',
  },

  imageSelector: {
    type: types.image,
    id: 'image',
    label: 'Image',
  },

  backgroundImageSelector: {
    type: types.image,
    id: 'background_image',
    label: 'Background image',
  },
};

// quick handy default value thing
const defaults = {
  blank: {
    value: '',
    label: 'Default',
  },
  none: {
    value: '',
    label: 'None',
  },
};


module.exports =
{
  types: types,
  templates: templates,
  common: common,
  defaults: defaults,

  /*
    common shopify inputs
  */
  articleSelector: common.articleSelector,
  articlePicker: common.articleselector,

  blogSelector: common.blogSelector,
  blogPicker: common.blogSelector,

  pageSelector: common.pageSelector,
  pagePicker: common.pageSelector,

  menuSelector: common.menuSelector,
  menuPicker: common.menuSelector,

  collectionSelector: common.collectionSelector,
  collectionPicker: common.collectionSelector,

  collectionsSelector: common.collectionsSelector,
  collectionsPicker: common.collectionsSelector,
  collectionList: common.collectionsSelector,

  productSelector: common.productSelector,
  productPicker: common.productSelector,

  productsSelector: common.productsSelector,
  productsPicker: common.productsSelector,
  productList: common.productsSelector,

  colorSelector: common.colorSelector,
  colorPicker: common.colorSelector,

  urlSelector: common.urlSelector,
  urlPicker: common.urlSelector,

  colorBackgroundSelector: common.colorBackgroundSelector,
  colorBackgroundPicker: common.colorBackgroundSelector,
  backgroundColorSelector: common.colorBackgroundSelector,
  backgroundColorPicker: common.colorBackgroundSelector,
  bgColorSelector: common.colorBackgroundSelector,
  bgColorPicker: common.colorBackgroundSelector,

  backgroundImageSelector: common.backgroundImageSelector,
  backgroundImagePicker: common.backgroundImageSelector,
  backgroundImage: common.backgroundImageSelector,
  bgImage: common.backgroundImageSelector,

  fontSelector: common.fontSelector,
  fontPicker: common.fontSelector,

  imageSelector: common.imageSelector,
  imagePicker: common.imageSelector,

  normalTemplates: [
    templates.article,
    templates.index,
    templates.page,
    templates.product,
    templates.blog,
    templates.collection,
    templates.collections,
    templates.giftCard,
  ],
  allTemplates: [
    templates.notFound,
    templates.article,
    templates.blog,
    templates.cart,
    templates.collection,
    templates.account,
    templates.activateAccount,
    templates.addresses,
    templates.login,
    templates.order,
    templates.register,
    templates.resetPassword,
    templates.giftCard,
    templates.index,
    templates.collections,
    templates.page,
    templates.password,
    templates.product,
    templates.search,
  ],


  /*
    common elements
  */
  text: {
    type: types.text,
    id: 'text',
    label: 'Text',
  },

  subheading: {
    type: types.text,
    id: 'subheading',
    label: 'Subheading',
  },

  heading: {
    type: types.text,
    id: 'heading',
    label: 'Heading',
  },

  number: {
    type: types.number,
    id: 'num',
    label: 'Number',
  },

  copy: {
    type: types.richtext,
    id: 'copy',
    label: 'Copy',
  },

  html: {
    type: types.html,
    id: 'html',
    label: 'Raw HTML',
  },

  liquid: {
    type: types.liquid,
    id: 'liquid',
    label: 'Raw Liquid',
  },

  videoLink: {
    type: types.videoUrl,
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
    type: types.select,
    id: 'font',
    label: 'Font',
    options: [
      defaults.none,
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
    type: types.radio,
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
    type: types.select,
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
