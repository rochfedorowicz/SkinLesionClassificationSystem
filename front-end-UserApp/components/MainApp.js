import LoadingScreen from './LoadingScreen';
import TakePhoto from './TakePhoto';
import History from './History';
import AuthorizeUser from './AuthorizeUser';
import { fetchBackEndResources } from '../helper_functions/BackEndResourceFetcher';
import { interpretPredictionData, getKeyWithBiggestValue } from '../helper_functions/MiscellaneousFunctions';
import { transformNativeUriIntoBase64, transformWebUriIntoBase64 } from '../helper_functions/TransformHelper';

import React, { useState } from 'react';
import { StatusBar, Platform, Text, View, TouchableOpacity, Image as ImageReactNative, StyleSheet} from 'react-native';

/**
 * Main application component.
 * @returns {JSX.Element} - Rendered component.
 */
function App() {
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [takingPhotoVisible, setTakingPhotoVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [authorizeUserVisible, setAuthorizeUserVisible] = useState(true);
  const [imageUri, setImageUri] = useState(null);
  const [loadingText, setLoadingText] = useState("");
  const [prediction, setPrediction] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [predictedClass, setPredictedClass] = useState("");
  const [fetchedData, setFetchedData] = useState({});

  /**
   * Show the history modal.
   *
   * @returns {Promise<void>} A Promise that resolves after loading history.
   */
  const showHistory = async () => {
    // Set a delay of 500 milliseconds before showing the history modal, needed for iOS
    setTimeout(() => {setHistoryVisible(true);}, 500);

    // Set loading text and show loading screen
    setLoadingText("Loading history...");
    setLoadingVisible(true);

    // Construct the URL for the history API endpoint
    const url = `https://my-engineering-project.click/api/history`;

    // Create a FormData object to send email and password in the request body
    var data = new FormData();
    data.append('email', userEmail);
    data.append('password', userPassword);

    // Make a network request to the history API endpoint
    await fetchBackEndResources(url, data)
    // If successful, update the component state with fetched history data
    .then(data => {
      setFetchedData(Object.values(data.images));
      setLoadingVisible(false);
    })
    // If an error occurs during the network request, log the error message
    .catch(error => {
      console.log(error.message);
    });
  };

  /**
   * Show the take photo modal and reset predicted class.
   */
  const showTakePhoto = async () => {
    setTakingPhotoVisible(true);
    setPredictedClass("");
    setPrediction(false);
  };

  /**
   * Handle the prediction process.
   *
   * @returns {Promise<void>} A Promise that resolves after the prediction process.
   */
  const handlePredict = async () => {
    if (imageUri) {
      // Set loading text and show loading screen
      setLoadingText("Predicting...");
      setLoadingVisible(true);

      // Construct the URL for the predict API endpoint
      const url = `https://my-engineering-project.click/api/predict`;

      // Create a FormData object to send email, password, and image data in the request body
      var data = new FormData();
      data.append('email', userEmail);
      data.append('password', userPassword);

      // Convert the image URI to base64 string based on the platform
      const base64String = Platform.OS == 'web' ? await transformWebUriIntoBase64(imageUri) : await transformNativeUriIntoBase64(imageUri);
      data.append('base64', base64String);

      // Make a network request to the predict API endpoint
      await fetchBackEndResources(url, data)
       // If successful, set prediction state and update predicted class
      .then(data => {
        setPrediction(true);
        setPredictedClass(getKeyWithBiggestValue(interpretPredictionData(data.prediction.binary)));
        setLoadingVisible(false);
      })
      // If an error occurs during the network request, log the error message
      .catch(error => {
        console.log(error.message);
      });
    }
  };

  /**
   * Log out the user.
   */
  const logOut = async () => {
    setUserEmail("");
    setUserPassword("");
    setAuthorizeUserVisible(true);
  };

  /**
   * Rendered component JSX.
   */
  return (
    <View style={styles.container}>
      <StatusBar
        translucent={false}
      />
      {loadingVisible && 
        <LoadingScreen
          loadingText={loadingText}
        />
      }
      <AuthorizeUser
        visible={authorizeUserVisible}
        setAuthorizeUserVisible={setAuthorizeUserVisible}
        setUserEmail={setUserEmail}
        setUserPassword={setUserPassword}
      />
      <TakePhoto
        visible={takingPhotoVisible}
        setImageUri={setImageUri}
        setTakingPhotoVisible={setTakingPhotoVisible}
      />
      <History
        visible={historyVisible}
        data={fetchedData}
        setHistoryVisible={setHistoryVisible}
      />
      {/* Main content */}
      <View style={styles.background}>
        <Text style={styles.pageText}>Chosen photo</Text>
        <View style={styles.backgroundForPhoto}>
          <ImageReactNative 
            source={ imageUri ? 
              { uri: imageUri } : 
              Platform.OS == 'web' ?
                require('./images/image-background-web.png') :
                require('./images/image-background-native.png') }
            style={styles.previewImage} 
          />
        </View>
        {imageUri && prediction && 
          <Text style={styles.text}>Prediction: {predictedClass} </Text>
        } 
      </View>
      {/* Button container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={showTakePhoto}>
          <Text style={styles.text}>Choose photo</Text>
        </TouchableOpacity>
        {imageUri && 
          <TouchableOpacity style={styles.button} onPress={handlePredict}>
            <Text style={styles.text}>Predict</Text>
          </TouchableOpacity>
        }
        <TouchableOpacity style={styles.button} onPress={showHistory}>
          <Text style={styles.text}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={logOut}>
          <Text style={styles.text}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffb703',
  },
  background: {
    width: Platform.OS === 'web' ? '40%' : '85%',
    backgroundColor: '#fb8500',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  backgroundForPhoto: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#219ebc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: Platform.OS === 'android' ? 10 : 15,
    borderRadius: 25,
    backgroundColor: '#023047',
    width: '70%',
  },
  text: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  pageText: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '95%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8ecae6',
  },
});