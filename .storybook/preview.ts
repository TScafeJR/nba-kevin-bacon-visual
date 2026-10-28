import type { Preview } from '@storybook/react-vite';
import '../src/style/App.css';

const preview: Preview = {
    parameters: {
        // an accessibility violation fails the story's test, not just a panel in the sidebar
        a11y: { test: 'error' }
    }
};

export default preview;
