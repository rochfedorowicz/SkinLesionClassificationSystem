import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';

import { interpretPredictionData} from '../helper_functions/MiscellaneousFunctions';

/**
 * Component for displaying a history of investigated photos with their predictions.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {boolean} props.visible - Indicates whether the history modal is visible.
 * @param {Object[]} props.data - Array of photo data to be displayed in the history.
 * @param {Function} props.setHistoryVisible - Function to toggle the visibility of the history modal.
 * @returns {JSX.Element} - Rendered component.
 */
function History(props) {
  // State to manage the enlarged item
  const [isItemEnlarged, setIsItemEnlarged] = useState(false);
  const [itemEnlarged, setItemEnlarged] = useState(null);

  /**
   * Closes the history modal.
   *
   * @returns {Promise<void>} A Promise that resolves after closing the history modal.
   */
  const goBack = async () => {
    props.setHistoryVisible(false);
  };

  /**
   * Enlarges a history item to display detailed prediction information.
   *
   * @param {Object} item - The history item to be enlarged.
   */
  const enlargeItem = (item) => {
    setIsItemEnlarged(true);
    setItemEnlarged(item);
  };

  /**
   * Minimizes the enlarged history item.
   */
  const minimizeItem = () => {
    setIsItemEnlarged(false);
    setItemEnlarged(null);
  };

  /**
   * Rendered component JSX.
   */
  return (
    <Modal visible={props.visible} animationType="fade">
      {/* Enlarged item modal */}
      <Modal visible={isItemEnlarged} transparent={true} animationType="fade">
        <TouchableOpacity 
          style={styles.enlargedModal} 
          onPress={minimizeItem}
        >
          {isItemEnlarged &&
            <View style={styles.enlargedModalItem}>
              {/* Display enlarged item image */}
              <Image style={styles.enlargedModalItemImage} source={{uri: itemEnlarged.url}}/>
              <View style={styles.enlargedModalItemTexts}>
                {/* Display binary classification information */}
                <Text style={styles.text}> Binary classification:</Text>
                {Object.entries(itemEnlarged.predictedBinaryClasses)
                  .sort(([, valueA], [, valueB]) => valueB - valueA)
                  .map(([key, value]) => (
                  <Text key={key} style={styles.text}> {key}: {value.toFixed(2)} </Text>
                ))}
                {/* Display multiclass classification information */}
                <Text style={styles.text}>{"\n"}Multiclass classification:</Text>
                {Object.entries(itemEnlarged.predictedMulticlassClasses)
                  .sort(([, valueA], [, valueB]) => valueB - valueA)
                  .map(([key, value]) => (
                  <Text key={key} style={styles.text}> {key}: {value.toFixed(2)} </Text>
                ))}
              </View>
            </View>
          }
        </TouchableOpacity>
      </Modal>
      {/* Main content */}
      <View style={styles.container}>
        <View style={styles.background}>
          <Text style={styles.pageText}>Investigated photos</Text>
        </View>
        {/* FlatList to display history items */}
        <FlatList
          style={styles.flatList}
          data={props.data}
          keyExtractor={(_item, index) => `${index}`}
          numColumns={Platform.OS === 'web' ? 4 : 2}
          renderItem={({ item }) => {
            // Parse prediction data and set predicted classes
            const parsed_prediction = JSON.parse(item.prediction.replace(/'/g, '"'))
            item.predictedBinaryClasses = interpretPredictionData(parsed_prediction.binary);
            item.predictedMulticlassClasses = interpretPredictionData(parsed_prediction.multiclass);
            return (
              <TouchableOpacity 
                style={styles.historyItem} 
                onPress={() => enlargeItem(item)}
              >
                {/* Display image of the history item */}
                <Image source={{ uri: item.url }} style={styles.image} />
                {/* Display binary classification information */}
                {Object.values(item.predictedBinaryClasses).map((value, index) => (
                  <Text key={index} style={styles.text}> {Object.keys(item.predictedBinaryClasses)[index]}: {value.toFixed(2)} </Text>
                ))}
              </TouchableOpacity>
            );
          }}
        />
        <TouchableOpacity style={styles.button} onPress={goBack}>
          <Text style={styles.text}> Go back </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default History;

const styles = StyleSheet.create({
  // Background style for title
  background: {
    width: Platform.OS === 'web' ? '50%' : '85%',
    backgroundColor: '#fb8500',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10
  },
  // Container style for the modal
  container: {
    flex: 1,
    paddingTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#ffb703',
  },
  // FlatList style for the history items
  flatList: {
    paddingTop: 10,
    width: '100%',
  },
  // Style for each history item
  historyItem: {
    flexDirection: 'column',
    padding: 10,
    marginHorizontal: '2.5%',
    borderWidth: 3,
    borderColor: '#219ebc',
    justifyContent: 'center',
    alignItems: 'center',
    width: Platform.OS === 'web' ? '20%' : '45%',
    backgroundColor: '#8ecae6',
    borderRadius: 10,
    marginBottom: 20,
  },
  // Style for displayed images in history items
  image: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 10,
    borderColor: '#219ebc',
    borderWidth: 3
  },
  // Style for title text
  pageText: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  // Style for the "Go back" button
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: '#023047',
    width: '70%',
  },
  // Style for text within the component
  text: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  enlargedModalItemImage: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    margin: 10,
    aspectRatio: 1,
    borderWidth: 3,
    borderRadius: 10,  
    borderColor: '#219ebc'
  },
  enlargedModalItemTexts: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center'
  },
  enlargedModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  enlargedModalItem: {
    height: Platform.OS == 'web' ? '50%' : '70%',
    width: Platform.OS == 'web' ? '50%' : '80%',
    backgroundColor: '#fb8500',
    justifyContent: 'center',
    alignContent: 'center',
    flexDirection: Platform.OS == 'web' ? 'row' : 'column',
    borderColor: '#219ebc',
    borderWidth: 3,
    borderRadius: 10,
  }
});
