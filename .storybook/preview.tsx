import React from 'react';
import type { Preview } from "@storybook/react";
import { ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { defaultTheme } from '../src/themes';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <ThemeProvider theme={defaultTheme}>
          <Story />
        </ThemeProvider>
      </Provider>
    ),
  ],
};

export default preview; 