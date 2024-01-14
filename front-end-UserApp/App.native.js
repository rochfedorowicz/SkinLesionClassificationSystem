import React from 'react';
import MainApp from './components/MainApp';

/**
 * Root component of the React Native application.
 *
 * @returns {JSX.Element} - The rendered root component.
 */
export default function App() {
  return (
    // Render the MainApp component while passing necessary functions as props
    <MainApp/>
  );
}