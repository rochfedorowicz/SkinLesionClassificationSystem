/**
 * Interpret the raw prediction data and format it into a human-readable object.
 *
 * @param {number[]} data - Raw prediction data array.
 * @returns {Object} - Formatted object with interpreted prediction data.
 */
export const interpretPredictionData = (data) => {
  var interpetedJsonData = {};
  if (data.length == 2) {
      interpetedJsonData.Benign = data[0];
      interpetedJsonData.Malignant = data[1];
  } else if (data.length == 8) {
      interpetedJsonData["Actinic Keratosis"] = data[0];
      interpetedJsonData["Basal Cell Carcinoma"] = data[1];
      interpetedJsonData["Benign Keratosis-like Lesions"] = data[2];
      interpetedJsonData["Dermatofibroma"] = data[3];
      interpetedJsonData["Melanoma"] = data[4];
      interpetedJsonData["Melanocytic Nevus"] = data[5];
      interpetedJsonData["Squamous Cell Carcinoma"] = data[6];
      interpetedJsonData["Vascular Lesions"] = data[7];
  }
  return interpetedJsonData;
};

/**
 * Find and return the key with the maximum numerical value in the given object.
 *
 * @param {Object} data - Object with numerical values.
 * @returns {string|null} - Key with the maximum value or null if the object is empty.
 */
export const getKeyWithBiggestValue = (data) => {
  let maxKey = null;
  let maxValue = -Infinity;

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      if (typeof value === 'number' && value > maxValue) {
        maxValue = value;
        maxKey = key;
      }
    }
  }

  return maxKey;
};