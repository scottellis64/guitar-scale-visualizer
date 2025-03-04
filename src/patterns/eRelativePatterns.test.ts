import { getERelativeShapesInScale } from './eRelativePatterns';
import { Note, ScaleType } from 'types/index';

describe('getERelativePatterns', () => {
  it('should return correct patterns for A major scale', () => {
    const patterns = getERelativeShapesInScale('D' as Note, 'major' as ScaleType);
    
    // A major scale: A B C# D E F# G#
    expect(patterns).toHaveLength(8); // Should include A, Bm, C#m, D, E patterns
  });
}); 