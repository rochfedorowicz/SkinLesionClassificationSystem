import { fetchBackEndResources } from '../helper_functions/BackEndResourceFetcher';
import AlertModal from './AlertModal';

import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';

/**
 * React component for user authorization.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.visible - Indicates whether the modal is visible.
 * @param {function} props.setUserEmail - Function to set the user's email.
 * @param {function} props.setUserPassword - Function to set the user's password.
 * @param {function} props.setAuthorizeUserVisible - Function to set the visibility of the authorization modal.
 * @returns {JSX.Element} The rendered React component.
 */
const AuthorizeUser = (props) => {
  /**
   * State variables for user input and error handling.
   */
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessageModal, setErrorMessageModal] = useState('');

  /**
   * Function to close the error modal.
   */
  const discardAlert = async () => {
    setShowErrorModal(false);
  };

  /**
   * Function to handle user login.
   *
   * @returns {Promise<void>} A Promise that resolves after the login attempt.
   */
  const loginUser = async () => {
    // Check if email and password are provided
    if (!email || !password) {
      setErrorMessageModal('Fill up all of the fileds!');
      setShowErrorModal(true);
      return;
    }

    // Construct the URL for the login API endpoint
    const url = `https://my-engineering-project.click/api/login`
    // Create a FormData object to send email and password in the request body
    var requestData = new FormData();
    requestData.append('email', email);
    requestData.append('password', password);
    
    // Make a network request to the login API endpoint
    fetchBackEndResources(url, requestData)
    // If successful, update user information and reset state
    .then(() => {
      props.setUserEmail(email);
      props.setUserPassword(password);
      setEmail("");
      setFirstName("");
      setPassword("");
      setRepeatedPassword("");
      props.setAuthorizeUserVisible(false);
    })
    // If an error occurs, handle it by displaying an error message
    .catch(error => {
      setErrorMessageModal(error.message);
      setShowErrorModal(true);
    });
  };

  /**
   * Function to handle user sign up.
   *
   * @returns {Promise<void>} A Promise that resolves after the sign-up attempt.
   */
  const signUpUser = async () => {
    // Check if any required field is empty
    if (!email || !firstName || !password || !repeatedPassword) {
      setErrorMessageModal('Fill up all of the fileds!');
      setShowErrorModal(true);
      return;
    }

    // Construct the URL for the sign-up API endpoint
    const url = `https://my-engineering-project.click/api/sign-up`
    // Create a FormData object to send data in the request body
    var requestData = new FormData();
    requestData.append('email', email);
    requestData.append('firstName', firstName);
    requestData.append('password', password);
    requestData.append('repeatedPassword', repeatedPassword);

    // Make a network request to the sign-up API endpoint
    fetchBackEndResources(url, requestData)
    // If successful, update user information and reset state
    .then(() => {
      props.setUserEmail(email);
      props.setUserPassword(password);
      setEmail("");
      setFirstName("");
      setPassword("");
      setRepeatedPassword("");
      props.setAuthorizeUserVisible(false);
    })
    // If an error occurs, handle it by displaying an error message
    .catch(error => {
      setErrorMessageModal(error.message);
      setShowErrorModal(true);
    });
  };

  /**
   * Rendered component JSX.
   */
  return (
    <Modal visible={props.visible} animationType="fade">
      <AlertModal
        message={errorMessageModal}
        visible={showErrorModal}
        onConfirm={discardAlert}
      />
      <View style={styles.container}>
        <View style={styles.buttonAndInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="grey"
            onChangeText={text => setEmail(text)}
            value={email}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="grey"
            onChangeText={text => setPassword(text)}
            value={password}
            secureTextEntry={true}
          />
          <TouchableOpacity style={styles.button} onPress={loginUser}>
            <Text style={styles.text}> Login </Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Repeat Password"
            placeholderTextColor="grey"
            onChangeText={text => setRepeatedPassword(text)}
            value={repeatedPassword}
            secureTextEntry={true}
          />
          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="grey"
            onChangeText={text => setFirstName(text)}
            value={firstName}
          />
          <TouchableOpacity style={styles.button} onPress={signUpUser}>
            <Text style={styles.text}> Sign up </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AuthorizeUser;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffb703',
    width: '100%'
  },
  // Container style for buttons
  buttonAndInputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  input: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: '#023047',
    width: '70%',
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 'bold',
    paddingLeft: 15,
    paddingRight: 15,
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