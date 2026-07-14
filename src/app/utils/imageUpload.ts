const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const MAX_DATA_URL_LENGTH = 850_000;
const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';
const RESIZE_ATTEMPTS = [
  { maxDimension: 1600, quality: 0.84 },
  { maxDimension: 1200, quality: 0.8 },
  { maxDimension: 900, quality: 0.76 },
  { maxDimension: 700, quality: 0.72 },
];

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Select a valid image file.'));
    };
    image.src = objectUrl;
  });
}

export { IMAGE_ACCEPT };

export async function imageFileToDataUrl(file: File) {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    throw new Error('Upload a PNG, JPG, WEBP, or GIF image.');
  }

  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('Upload an image smaller than 8 MB.');
  }

  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Image uploads are not available in this browser.');
  }

  let lastDataUrl = '';

  for (const attempt of RESIZE_ATTEMPTS) {
    const scale = Math.min(1, attempt.maxDimension / image.naturalWidth, attempt.maxDimension / image.naturalHeight);
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    lastDataUrl = canvas.toDataURL('image/jpeg', attempt.quality);
    if (lastDataUrl.length <= MAX_DATA_URL_LENGTH) {
      return lastDataUrl;
    }
  }

  if (lastDataUrl.length <= MAX_DATA_URL_LENGTH) {
    return lastDataUrl;
  }

  throw new Error('Upload a smaller image or crop it before saving.');
}
