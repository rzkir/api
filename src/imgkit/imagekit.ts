import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();

let _imagekit: InstanceType<typeof ImageKit> | null = null;

function getImagekit(): InstanceType<typeof ImageKit> {
  if (_imagekit) return _imagekit;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error("ImageKit env vars (IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT) harus di-set");
  }
  _imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
  return _imagekit;
}

export { getImagekit };