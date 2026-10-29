import type { Preview } from '@storybook/react'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f8fafc' },
        { name: 'dark', value: '#090d16' },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals['backgrounds']?.value === '#090d16'
      if (typeof document !== 'undefined') {
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      return Story()
    },
  ],
}

export default preview
