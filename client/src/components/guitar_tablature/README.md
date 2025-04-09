# Guitar Tablature Component

A component that displays guitar tablature based on the current state of a fretboard instance.

## Features

- Displays tablature for scales and arpeggios
- Shows note names, fret numbers, and scale degrees
- Highlights root notes
- Customizable display options
- Multiple instances can be displayed simultaneously

## Usage

```tsx
import { GuitarTablature } from 'components';

// Basic usage
<GuitarTablature id="your-instance-id" />

// With custom options
<GuitarTablature 
  id="your-instance-id"
  title="C Major Scale"
  showFretNumbers={true}
  showNoteNames={true}
  showScaleDegrees={true}
  maxFrets={12}
/>

// Multiple instances
<div>
  <GuitarTablature id="scale-instance" title="C Major Scale" />
  <GuitarTablature id="arpeggio-instance" title="A Minor Arpeggio" />
</div>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string | (required) | The ID of the fretboard instance to display |
| title | string | 'Guitar Tablature' | The title displayed above the tablature |
| showFretNumbers | boolean | true | Whether to show fret numbers |
| showNoteNames | boolean | true | Whether to show note names |
| showScaleDegrees | boolean | false | Whether to show scale degrees |
| maxFrets | number | 12 | The maximum number of frets to display |

## Notes

- The component reads from the Redux store, so it must be used within a Redux Provider
- The fretboard instance must exist in the store with the specified ID
- The component automatically updates when the fretboard instance state changes 