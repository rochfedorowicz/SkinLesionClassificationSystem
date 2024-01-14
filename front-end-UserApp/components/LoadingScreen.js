import React, { useEffect, useRef } from 'react';
import { Text, View, Animated, Easing, StyleSheet, Modal, Platform } from 'react-native';

/**
 * Component to display a loading screen with a rotating gear animation.
 *
 * @param {Object} props - Component props.
 * @param {string} props.loadingText - Text to display as loading message.
 * @returns {JSX.Element} - JSX element representing the LoadingScreen component.
 */
function LoadingScreen(props) {
  // Create a new Animated.Value to control the rotation of the gear animation
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === 'web') {
      startLoadingAnimationWeb();
    } else {
      startLoadingAnimationMobile();
    }
  }, []);

  /**
   * Start the loading animation for mobile devices.
   */
  const startLoadingAnimationMobile = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  /**
   * Start the loading animation for web.
   */
  const startLoadingAnimationWeb = () => {
    const animate = () => {
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        spinValue.setValue(0);
        animate();
      });
    };

    animate();
  };

  // Define an interpolation for the spin animation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  /**
   * Rendered component JSX.
   */
  return (
    <Modal visible={true} animationType="fade">
      <View style={styles.container}>
        {/* Loading message */}
        <Text style={styles.loadingText}> {props.loadingText} </Text>
        {/* Rotating gear animation */}
        <Animated.Image
          style={[styles.loaderImage, { transform: [{ rotate: spin }] }]}
          source={require('./images/loading-gear.png')}
        />
      </View>
    </Modal>
  );
}

export default LoadingScreen;

const styles = StyleSheet.create({
  // Container style for the modal
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffb703',
  },
  // Image properties
  loaderImage: {
    width: 100,
    height: 100,
  },
  // Loading message style
  loadingText: {
    paddingBottom: 50,
    fontSize: 28,
    color: '#023047',
    fontWeight: 'bold',
  }
});