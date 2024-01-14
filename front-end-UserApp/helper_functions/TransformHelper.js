/**
 * Transforms a web image URI into a base64 string after resizing it to 320x320 pixels.
 *
 * @param {string} uri - The URI of the web image.
 * @returns {Promise<string>} A Promise that resolves to the resized and base64-encoded image.
 */

export const transformWebUriIntoBase64 = async (uri) => {
  return new Promise((resolve, reject) => {
    // Create a new image element
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    // Set up event handlers for image loading and error
    img.onload = () => {

      // Create a canvas and draw the image on it with a fixed size of 320x320 pixels
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;

      const canvas2dContext = canvas.getContext('2d');
      canvas2dContext.drawImage(img, 0, 0, 320, 320);

      // Convert the canvas content to a base64-encoded string
      const resizedBase64 = canvas.toDataURL('image/jpeg');
      resolve(resizedBase64);
    };

    img.onerror = (error) => {
      // Reject the promise with an error if the image fails to load
      reject(error);
    };

    // Set the image source to the provided URI
    img.src = uri;
  });
};

import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Transforms a native (Expo) image URI into a base64 string after resizing it to 320x320 pixels.
 *
 * @async
 * @param {string} uri - The URI of the native image.
 * @returns {Promise<string>} A Promise that resolves to the resized and base64-encoded image.
 */
export const transformNativeUriIntoBase64= async (uri) => {

  // Resize the image using Expo's ImageManipulator
  const resizedImage = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 320, height: 320 } }], {
    compress: 1,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  // Read the resized image as a base64-encoded string using Expo's FileSystem
  const resizedBase64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return resizedBase64;
};