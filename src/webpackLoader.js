/*
  webpack is such a convoluted fucking piece of shit. do later
*/


function loader(content, map, meta) {
  console.log(`\n\nI HAVE RUN\n\n`);
  const callback = this.async();
  callback(null, content, map, meta);
  return;
}



module.exports = {
  default: function loader(){},
  pitch: loader,
};
