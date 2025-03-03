import { Note, ERelativeShape, ERelativePatternMapped, ScaleType, SCALES, ERelativePattern } from 'types';

export const E_RELATIVE_SHAPES: Record<string, ERelativeShape> = {
  E: {
    root: 1,
    name: '1E',
    pattern: [
      { string: 6, fret: 0 }, 
      { string: 6, fret: 2 }, 
      { string: 6, fret: 4 }, 

      { string: 5, fret: 0 }, 
      { string: 5, fret: 2 }, 
      { string: 5, fret: 4 },  

      { string: 4, fret: 1 }, 
      { string: 4, fret: 2 }, 
      { string: 4, fret: 4 },  

      { string: 3, fret: 1 }, 
      { string: 3, fret: 2 }, 

      { string: 2, fret: 0 }, 
      { string: 2, fret: 2 }, 
      { string: 2, fret: 4 },

      { string: 1, fret: 0 }, 
      { string: 1, fret: 2 }, 
      { string: 1, fret: 4 },        
    ]
  },
  D: {
    root: 2,
    name: '2D',
    pattern: [
        { string: 6, fret: 0 }, 
        { string: 6, fret: 2 }, 
        { string: 6, fret: 3 }, 
  
        { string: 5, fret: 0 }, 
        { string: 5, fret: 2 }, 
        { string: 5, fret: 4 },  
  
        { string: 4, fret: 0 }, 
        { string: 4, fret: 2 }, 
        { string: 4, fret: 4 },  
  
        { string: 3, fret: 0 }, 
        { string: 3, fret: 2 }, 
  
        { string: 2, fret: 0 }, 
        { string: 2, fret: 2 }, 
        { string: 2, fret: 3 },
  
        { string: 1, fret: 0 }, 
        { string: 1, fret: 2 }, 
        { string: 1, fret: 3 },        
    ]
  },
  C: {
    root: 3,
    name: '3C',
    pattern: [
        { string: 6, fret: 0 }, 
        { string: 6, fret: 1 }, 
        { string: 6, fret: 3 }, 
  
        { string: 5, fret: 0 }, 
        { string: 5, fret: 2 }, 
        { string: 5, fret: 3 },  
  
        { string: 4, fret: 0 }, 
        { string: 4, fret: 2 }, 
        { string: 4, fret: 3 },  
  
        { string: 3, fret: 0 }, 
        { string: 3, fret: 2 }, 
  
        { string: 2, fret: 0 }, 
        { string: 2, fret: 1 }, 
        { string: 2, fret: 3 },
  
        { string: 1, fret: 0 }, 
        { string: 1, fret: 1 }, 
        { string: 1, fret: 3 },        
    ]
  },
  B: {
    root: 4,
    name: '4B',
    pattern: [
        { string: 6, fret: 0 }, 
        { string: 6, fret: 2 }, 
        { string: 6, fret: 4 }, 
  
        { string: 5, fret: 1 }, 
        { string: 5, fret: 2 }, 
        { string: 5, fret: 4 },  
  
        { string: 4, fret: 1 }, 
        { string: 4, fret: 2 }, 
        { string: 4, fret: 4 },  
  
        { string: 3, fret: 1 }, 
        { string: 3, fret: 3 }, 
  
        { string: 2, fret: 0 }, 
        { string: 2, fret: 2 }, 
        { string: 2, fret: 4 },
  
        { string: 1, fret: 0 }, 
        { string: 1, fret: 2 }, 
        { string: 1, fret: 4 },           
    ]
  },
  A: {
    root: 5,
    name: '5A',
    pattern: [
        { string: 6, fret: 0 }, 
        { string: 6, fret: 2 }, 
        { string: 6, fret: 4 }, 
  
        { string: 5, fret: 0 }, 
        { string: 5, fret: 2 }, 
        { string: 5, fret: 4 },  
  
        { string: 4, fret: 0 }, 
        { string: 4, fret: 2 }, 
        { string: 4, fret: 4 },  
  
        { string: 3, fret: 1 }, 
        { string: 3, fret: 2 }, 
  
        { string: 2, fret: 0 }, 
        { string: 2, fret: 2 }, 
        { string: 2, fret: 3 },
  
        { string: 1, fret: 0 }, 
        { string: 1, fret: 2 }, 
        { string: 1, fret: 4 },         
    ]
  },
  G: {
    root: 6,
    name: '6G',
    pattern: [
        { string: 6, fret: 0 }, 
        { string: 6, fret: 2 }, 
        { string: 6, fret: 3 }, 
  
        { string: 5, fret: 0 }, 
        { string: 5, fret: 2 }, 
        { string: 5, fret: 3 },  
  
        { string: 4, fret: 0 }, 
        { string: 4, fret: 2 }, 
        { string: 4, fret: 4 },  
  
        { string: 3, fret: 0 }, 
        { string: 3, fret: 2 }, 
  
        { string: 2, fret: 0 }, 
        { string: 2, fret: 1 }, 
        { string: 2, fret: 3 },
  
        { string: 1, fret: 0 }, 
        { string: 1, fret: 2 }, 
        { string: 1, fret: 3 },         
    ]
  },
  F: { 
    root: 7,
    name: '7F',
    pattern: [
        { string: 6, fret: 0 }, 
        { string: 6, fret: 1 }, 
        { string: 6, fret: 3 }, 
  
        { string: 5, fret: 0 }, 
        { string: 5, fret: 1 }, 
        { string: 5, fret: 3 },  
  
        { string: 4, fret: 0 }, 
        { string: 4, fret: 2 }, 
        { string: 4, fret: 3 },  
  
        { string: 3, fret: 0 }, 
        { string: 3, fret: 2 }, 
        { string: 3, fret: 3 }, 
  
        { string: 2, fret: 1 }, 
        { string: 2, fret: 3 },
  
        { string: 1, fret: 0 }, 
        { string: 1, fret: 1 }, 
        { string: 1, fret: 3 }, 
    ]
  }
}

export const getERelativeShapeForRoot = (root: number): ERelativeShape => {
  return E_RELATIVE_SHAPES[
    Object.keys(E_RELATIVE_SHAPES)
      .find(key => E_RELATIVE_SHAPES[key].root === root) as keyof typeof E_RELATIVE_SHAPES];
}

export const sortPatternNumbersByRoot = (eRoot: number): number[] => {
  const patternNumbers = Array.from({ length: 8 - eRoot }, (_, index) => eRoot + index);
  if (eRoot > 1) {
    patternNumbers.push(...Array.from({ length: eRoot - 1 }, (_, index) => 1 + index));
  }

  return patternNumbers;
}

export const getIntervalStepsForPatternShape = (eRoot: number, scaleType: ScaleType): number[] => {
  const intervalSteps = SCALES[scaleType].intervalSteps;

  const sortedIntervalSteps = 
      Array.from({ length: 8 - eRoot }, (_, index) => eRoot + index)
      .map((epos) => intervalSteps[epos - 1]);

  if (eRoot > 1) {
    sortedIntervalSteps.push(...Array.from({ length: eRoot - 1 }, (_, index) => intervalSteps[index]));
  }

  return sortedIntervalSteps;
}

export const getSelectedERelativeShape = (rootOfScale: Note, scaleType: ScaleType, eRelativePattern: ERelativePattern): ERelativePatternMapped[] => {
  const patterns: ERelativePatternMapped[] = getERelativeShapesInScale(rootOfScale, scaleType);
  return patterns.filter(pattern => pattern.name === eRelativePattern) as ERelativePatternMapped[];
}

export const getERelativeShapesInScale = (rootOfScale: Note, scaleType: ScaleType): ERelativePatternMapped[] => {
  const rootShape = E_RELATIVE_SHAPES[rootOfScale];

  const patternNumbers = sortPatternNumbersByRoot(rootShape.root);

  const intervalSteps = getIntervalStepsForPatternShape(rootShape.root, scaleType);

  let fretShift: number = 0;
  const patterns: ERelativePatternMapped[] = patternNumbers.map((epos, intervalIndex) => {
    const patternShape: ERelativeShape = getERelativeShapeForRoot(epos);

    const newPattern: ERelativePatternMapped = {
      name: patternShape.name,
      epos,
      closed: fretShift > 0,
      fretPositions: patternShape.pattern.map((position) => {
        return {
          string: position.string,
          fret: position.fret + fretShift
        }
      })
    };

    fretShift += intervalSteps[intervalIndex];

    return newPattern;
  });

  const closedRoot: ERelativePatternMapped = {
      name: rootShape.name,
      epos: rootShape.root,
      closed: true,
      fretPositions: rootShape.pattern.map((fret) => {
        return {
          string: fret.string,
          fret: fret.fret + 12
        }
      })
    };

  return [closedRoot, ...patterns];
}
