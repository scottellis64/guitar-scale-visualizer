import { render, screen } from '@testing-library/react';
import { Fretboard } from './Fretboard';

describe('Fretboard', () => {
  it('renders with default props', () => {
    render(<Fretboard rootNote="A" type="major" frets={15} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('displays correct notes for A major scale', () => {
    render(<Fretboard rootNote="A" type="major" frets={15} />);
    const expectedNotes = ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'];
    expectedNotes.forEach(note => {
      expect(screen.getAllByText(note).length).toBeGreaterThan(0);
    });
  });

  it('displays correct notes for A minor scale', () => {
    render(<Fretboard rootNote="A" type="minor" frets={15} />);
    const expectedNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    expectedNotes.forEach(note => {
      expect(screen.getAllByText(note).length).toBeGreaterThan(0);
    });
  });
}); 