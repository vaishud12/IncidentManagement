// theme.js
import { createTheme } from '@mui/material/styles';

// Function to create a theme
const getTheme = (mode) => {
  return createTheme({
    palette: {
      mode, // Sets the theme mode to either 'light' or 'dark'
      primary: {
        main: '#1976d2', // Custom primary color
      },
      secondary: {
        main: '#dc004e', // Custom secondary color
      },
    },
  });
};

export default getTheme; // Make sure you're exporting the function as default
