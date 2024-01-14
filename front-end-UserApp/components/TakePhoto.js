import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

/**
 * Component for taking photos using the device's camera or selecting from the gallery.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.visible - Indicates if the component is visible.
 * @param {function} props.setImageUri - Function to set the image URI.
 * @param {function} props.setTakingPhotoVisible - Function to set the visibility of the photo-taking component.
 * @returns {JSX.Element} - JSX element representing the TakePhoto component.
 */
function TakePhoto(props) {
  // State for camera permission status
  const [cameraPermission, setCameraPermission] = useState(null);
  // Reference to the camera component
  const cameraRef = useRef(null);

  // Request camera permission on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  /**
   * Open the image picker to select a photo from the gallery.
   */
  const openImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        alert('Permission to access the camera roll is required!');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync();
      if (!pickerResult.canceled) {
        props.setImageUri(pickerResult.assets[0].uri);
        props.setTakingPhotoVisible(false);
      }
    } catch (error) {
      console.log("[IMAGE PICKER ERROR] info:", error);
    }
  };

  /**
   * Capture a photo using the device's camera.
   */
  const takeRealPhoto = async () => {
    if (cameraPermission) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        props.setImageUri(photo.uri);
        props.setTakingPhotoVisible(false);
      } catch (error) {
        console.log("[TAKE PHOTO ERROR] info:", error);
      }
    }
  };

  return (
    <Modal visible={props.visible} animationType="fade">
      <View style={styles.container}>
        {/* Background for camera preview */}
        <View style={styles.cameraBackground}>
          <Text style={styles.pageText}>Photo preview</Text>
          {/* Camera component */}
          <Camera
            type={Camera.Constants.Type.back}
            ref={cameraRef}
            style={styles.camera}
          />
        </View>
        {/* Buttons for selecting/taking photo */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={openImagePicker}>
            <Text style={styles.text}>Select photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takeRealPhoto}>
            <Text style={styles.text}>Take photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default TakePhoto;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffb703',
    width: '100%'
  },
  // Camera preview style
  camera: {
    width: '95%',
    aspectRatio: 1,
    borderWidth: 3,
    borderColor: '#8ecae6',
    marginBottom: 5
  },
  // Background style for camera preview
  cameraBackground: {
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
  // Container style for buttons
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  // Button style
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: '#023047',
    width: '70%',
  },
  // Text style for buttons and page title
  text: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  // Style for page title
  pageText: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
});