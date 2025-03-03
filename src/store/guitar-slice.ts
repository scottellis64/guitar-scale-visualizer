import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Note, ScaleType, ArpeggioType, DisplayType, CagedPattern, ERelativePattern } from 'types';

interface GuitarState {
  rootNote: Note;
  displayType: DisplayType;
  scaleType: ScaleType;
  arpeggioType: ArpeggioType;
  useNashville: boolean;
  isDarkMode: boolean;
  cagedPattern: CagedPattern | null;
  eRelativePattern: ERelativePattern | null;
}

const initialState: GuitarState = {
  rootNote: 'A',
  displayType: 'scale',
  scaleType: 'major',
  arpeggioType: 'major',
  useNashville: false,
  isDarkMode: false,
  cagedPattern: null,
  eRelativePattern: null
};

export const guitarSlice = createSlice({
  name: 'guitar',
  initialState,
  reducers: {
    setRootNote: (state, action: PayloadAction<Note>) => {
      state.rootNote = action.payload;
    },
    setDisplayType: (state, action: PayloadAction<DisplayType>) => {
      state.displayType = action.payload;
    },
    setScaleType: (state, action: PayloadAction<ScaleType>) => {
      state.scaleType = action.payload;
    },
    setArpeggioType: (state, action: PayloadAction<ArpeggioType>) => {
      state.arpeggioType = action.payload;
    },
    setUseNashville: (state, action: PayloadAction<boolean>) => {
      state.useNashville = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setCagedPattern: (state, action: PayloadAction<CagedPattern | null>) => {
      state.cagedPattern = action.payload;
    },
    setERelativePattern: (state, action: PayloadAction<ERelativePattern | null>) => {
      state.eRelativePattern = action.payload;
    }
  },
});

export const { 
  setRootNote, 
  setDisplayType, 
  setScaleType, 
  setArpeggioType, 
  setUseNashville,
  setIsDarkMode,
  setCagedPattern,
  setERelativePattern
} = guitarSlice.actions;

export default guitarSlice.reducer;  