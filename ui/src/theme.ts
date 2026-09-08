import {
  createTheme,
  Button,
  Switch,
  Text,
  Paper,
  Card,
  ActionIcon,
  Tabs,
  Anchor,
  TextInput,
  NumberInput,
  Select,
  Textarea,
} from '@mantine/core';

// ---------------------------------------------------------------------------
// Structural colors (backgrounds/text/borders) live as CSS custom properties
// in index.css — `:root` for light mode, `[data-mantine-color-scheme='dark']`
// for dark mode. Every component override below references those variables,
// so it automatically follows whichever scheme is active instead of being
// locked to one look. Mantine sets the `data-mantine-color-scheme` attribute
// on <html> itself whenever `useMantineColorScheme().toggleColorScheme()` (or
// setColorScheme) is called, so no extra plumbing is needed for this to react.
//
// Accent colors (teal/red/amber/blue/green) come straight from
// expense-tracker-colors.md and are the SAME in both schemes — those stay as
// a normal Mantine color palette.
// ---------------------------------------------------------------------------

const theme = createTheme({
  primaryColor: 'teal',
  primaryShade: 6,

  colors: {
    teal: [
      '#E1F5EE',
      '#CDEEE1',
      '#9FE1CB',
      '#7DD4B7',
      '#5DCAA5',
      '#3BB98D',
      '#1D9E75',
      '#167A5B',
      '#0F5C44',
      '#085041',
    ],
    red: [
      '#FCEBEB',
      '#F7D2D2',
      '#F0AFAE',
      '#EA8C8B',
      '#E56968',
      '#E45D5C',
      '#E24B4A',
      '#C93F3E',
      '#A83433',
      '#791F1F',
    ],
    amber: [
      '#FAEEDA',
      '#F5DDB5',
      '#F0CC90',
      '#ECBC6E',
      '#F1B542',
      '#F0A62E',
      '#EF9F27',
      '#D68A1D',
      '#B27314',
      '#633806',
    ],
    blue: [
      '#E6F1FB',
      '#CDE3F7',
      '#9BC7EF',
      '#85B7EB',
      '#6BA6E6',
      '#5199E1',
      '#378ADD',
      '#2C71B4',
      '#22588C',
      '#0C447C',
    ],
    green: [
      '#EAF3DE',
      '#D4E7BD',
      '#BEDB9C',
      '#A8CE7B',
      '#93C25A',
      '#7DB63A',
      '#639A2A',
      '#4C7E1D',
      '#376212',
      '#27500A',
    ],
    // Only used by un-styled Mantine defaults (Modal, Menu, Tooltip, etc.)
    // when colorScheme is 'dark'. The components we style explicitly below
    // use the CSS variables instead, so they respond to the toggle; this
    // array stays dark-only since it's never consulted in light mode.
    dark: [
      '#F2F1EC',
      '#D8D6CF',
      '#9A9890',
      '#4A4944',
      '#3A3934',
      '#2A2A27',
      '#1E1E1C',
      '#141413',
      '#0C0C0B',
      '#000000',
    ],
  },

  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',

  defaultRadius: 'md',

  white: '#ffffff',
  black: '#1a1a18',

  other: {
    mainBackground: 'var(--app-page-background)',
    sideBarBackground: 'var(--app-surface-primary)',
    textColor: 'var(--app-text-primary)',
    textSecondary: 'var(--app-text-secondary)',
    borderColor: 'var(--app-border)',
  },

  components: {
    Button: Button.extend({
      defaultProps: {
        color: 'teal',
        radius: 'md',
      },
      styles: () => {
        return { root: { fontWeight: 600 } };
      },
    }),

    Switch: Switch.extend({
      defaultProps: {
        size: 'lg',
        color: 'teal',
        styles: {
          trackLabel: { fontSize: 12 },
        },
      },
    }),

    Text: Text.extend({
      defaultProps: {
        color: 'var(--app-text-primary)',
      },
    }),

    Paper: Paper.extend({
      defaultProps: {
        p: 'md',
        radius: 'md',
        withBorder: true,
        shadow: 'sm',
      },
      styles: () => {
        return {
          root: {
            backgroundColor: 'var(--app-surface-primary)',
            borderColor: 'var(--app-border)',
          },
        };
      },
    }),

    Card: Card.extend({
      defaultProps: {
        p: 'lg',
        radius: 'md',
        withBorder: true,
        shadow: 'sm',
      },
      styles: () => {
        return {
          root: {
            backgroundColor: 'var(--app-surface-primary)',
            borderColor: 'var(--app-border)',
          },
        };
      },
    }),

    ActionIcon: ActionIcon.extend({
      defaultProps: {
        color: 'teal',
        variant: 'subtle',
      },
    }),

    Tabs: Tabs.extend({
      defaultProps: {
        color: 'teal',
      },
    }),

    Anchor: Anchor.extend({
      defaultProps: {
        color: 'teal',
      },
    }),

    TextInput: TextInput.extend({
      styles: () => {
        return {
          input: {
            backgroundColor: 'var(--app-surface-secondary)',
            borderColor: 'var(--app-border)',
            color: 'var(--app-text-primary)',
          },
        };
      },
    }),
    NumberInput: NumberInput.extend({
      styles: () => {
        return {
          input: {
            backgroundColor: 'var(--app-surface-secondary)',
            borderColor: 'var(--app-border)',
            color: 'var(--app-text-primary)',
          },
        };
      },
    }),
    Select: Select.extend({
      styles: () => {
        return {
          input: {
            backgroundColor: 'var(--app-surface-secondary)',
            borderColor: 'var(--app-border)',
            color: 'var(--app-text-primary)',
          },
        };
      },
    }),
    Textarea: Textarea.extend({
      styles: () => {
        return {
          input: {
            backgroundColor: 'var(--app-surface-secondary)',
            borderColor: 'var(--app-border)',
            color: 'var(--app-text-primary)',
          },
        };
      },
    }),
  },
});

export default theme;
