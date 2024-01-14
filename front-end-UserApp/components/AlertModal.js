import { Text, View, TouchableOpacity, Modal, StyleSheet} from 'react-native';

/**
 * React component for displaying an alert modal.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.visible - Indicates whether the modal is visible.
 * @param {string} props.message - The message to be displayed in the modal.
 * @param {function} props.onConfirm - Callback function to be executed when the user confirms the alert.
 * @returns {JSX.Element} The rendered React component.
 */
const AlertModal = (props) => {
  /**
   * Rendered component JSX.
   */
    return (
        <Modal visible={props.visible} transparent={true} animationType="fade">
            <View style={styles.container}>
                <View style={styles.box}>
                    <Text style={styles.message}> {props.message} </Text>
                    <TouchableOpacity style={styles.button} onPress={props.onConfirm}>
                        <Text style = {styles.text} > Ok </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
  };

  export default AlertModal;

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(43, 43, 43, 0.9)',
        width: '100%'
      },
      box: {
        backgroundColor: '#f04e2a',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        borderRadius: 10,
        marginVertical: 10,
        paddingVertical: 15,
      },
      message: {
        fontSize: 22,
        color: 'black',
        fontWeight: 'bold',
      },
      button: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#023047',
        width: '70%',
      },
      text: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
      },
  });