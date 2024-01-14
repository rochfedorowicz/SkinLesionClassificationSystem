/**
 * Asynchronously fetches resources from the back-end server using a POST request.
 *
 * @param {string} url - The URL of the back-end API endpoint.
 * @param {FormData} requestData - The FormData object containing data to be sent in the request body.
 * @throws {Error} If the request to the back-end fails or the response indicates an error.
 * @returns {Promise<Object>} A Promise that resolves to the data received from the back-end.
 */
export const fetchBackEndResources = async (url, requestData) => {
  // Make a POST request to the specified back-end API endpoint
  const response = await fetch(url, {
    method: 'POST',
    body: requestData,
  });
  if (!response.ok) {
    throw new Error('Failed to communicate with back-end server. Please try again later!');
  }
  
  // Parse the response JSON data
  const data = await response.json();
  // If 'result' is 'fail', throw an error with the specified reason
  if (data.result == 'fail') {
    throw new Error(data.reason);
  }
  // If 'result' is 'success', return the response data
  else if (data.result == 'success') {
    return data;
  }
  // Catch and re-throw any unexpected errors that may occur during the process
  else {
    throw new Error('Unexpected error occured.');
  }
};