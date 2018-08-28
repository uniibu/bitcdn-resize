const sharp = require('sharp');
const path = require('path');
module.exports = async (image, w, h) => {
  const imageFileext = path.extname(image);
  const imageFilename = path.basename(image, imageFileext);
  const imageFiledir = path.dirname(image);
  console.log(imageFiledir, imageFileext, imageFilename);
  let midExt = w !== null ? `w${w}` : '';
  midExt += h !== null ? `h${h}` : '';
  const outFilename = `${imageFilename}.${midExt}${imageFileext}`;
  const outFile = path.resolve(imageFiledir, outFilename);
  const s = sharp(image).resize(w, h).ignoreAspectRatio();
  await s.toFile(outFile);
  return `/gallery/${outFilename}`;
};