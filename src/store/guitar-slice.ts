import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Note, ScaleType, ArpeggioType, DisplayType, CagedPattern, ERelativePattern } from 'types';

interface FretboardInstance {
  id: string;
  rootNote: Note;
  displayType: DisplayType;
  scaleType: ScaleType;
  arpeggioType: ArpeggioType;
  useNashville: boolean;
  cagedPattern: CagedPattern;
  eRelativePattern: ERelativePattern;
}

interface GuitarState {
  instances: Record<string, FretboardInstance>;
  isDarkMode: boolean;
}

const initialState: GuitarState = {
  instances: {
    'default': {
      id: 'default',
      rootNote: 'C',
      displayType: 'scale',
      scaleType: 'major',
      arpeggioType: 'major',
      useNashville: false,
      cagedPattern: null,
      eRelativePattern: null,
    }
  },
  isDarkMode: false,
};

const guitarSlice = createSlice({
  name: 'guitar',
  initialState,
  reducers: {
    setRootNote: (state, action: PayloadAction<{ id: string; note: Note }>) => {
      state.instances[action.payload.id].rootNote = action.payload.note;
    },
    setScaleType: (state, action: PayloadAction<{ id: string; type: ScaleType }>) => {
      state.instances[action.payload.id].scaleType = action.payload.type;
    },
    setDisplayType: (state, action: PayloadAction<{ id: string; type: DisplayType }>) => {
      state.instances[action.payload.id].displayType = action.payload.type;
    },
    setArpeggioType: (state, action: PayloadAction<{ id: string; type: ArpeggioType }>) => {
      state.instances[action.payload.id].arpeggioType = action.payload.type;
    },
    setUseNashville: (state, action: PayloadAction<{ id: string; useNashville: boolean }>) => {
      state.instances[action.payload.id].useNashville = action.payload.useNashville;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setCagedPattern: (state, action: PayloadAction<{ id: string; pattern: CagedPattern }>) => {
      state.instances[action.payload.id].cagedPattern = action.payload.pattern;
    },
    setERelativePattern: (state, action: PayloadAction<{ id: string; pattern: ERelativePattern }>) => {
      state.instances[action.payload.id].eRelativePattern = action.payload.pattern;
    },
    addInstance: (state, action: PayloadAction<string>) => {
      state.instances[action.payload] = {
        id: action.payload,
        rootNote: 'C',
        displayType: 'scale',
        scaleType: 'major',
        arpeggioType: 'major',
        useNashville: false,
        cagedPattern: null,
        eRelativePattern: null,
      };
    },
    removeInstance: (state, action: PayloadAction<string>) => {
      delete state.instances[action.payload];
    },
    updateInstancesOrder: (state, action: PayloadAction<Record<string, FretboardInstance>>) => {
      state.instances = action.payload;
    },
  },
});

export const {
  setRootNote,
  setScaleType,
  setDisplayType,
  setArpeggioType,
  setUseNashville,
  setIsDarkMode,
  setCagedPattern,
  setERelativePattern,
  addInstance,
  removeInstance,
  updateInstancesOrder,
} = guitarSlice.actions;

export default guitarSlice.reducer;  