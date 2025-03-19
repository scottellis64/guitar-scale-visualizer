import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Note, ScaleType, ArpeggioType, DisplayType, CagedPattern, ERelativePattern } from 'types';

interface FretboardInstance {
  id: string;
  rootNote: Note;
  displayType: DisplayType;
  scaleType: ScaleType;
  arpeggioType: ArpeggioType;
  useNashville: boolean;
  showTriads: boolean;
  isArpeggio: boolean;
  cagedPattern: CagedPattern;
  eRelativePattern: ERelativePattern;
  frets: number;
  fretWidth: number;
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
      useNashville: true,
      showTriads: false,
      isArpeggio: false,
      cagedPattern: null,
      eRelativePattern: null,
      frets: 16,
      fretWidth: 2,
    }
  },
  isDarkMode: false,
};

const createDefaultInstance = (id: string): FretboardInstance => ({
  id,
  rootNote: 'C',
  displayType: 'scale',
  scaleType: 'major',
  arpeggioType: 'major',
  useNashville: true,
  showTriads: false,
  isArpeggio: false,
  cagedPattern: null,
  eRelativePattern: null,
  frets: 16,
  fretWidth: 2,
});

const ensureInstance = (state: GuitarState, id: string) => {
  if (!state.instances[id]) {
    state.instances[id] = createDefaultInstance(id);
  }
};

const guitarSlice = createSlice({
  name: 'guitar',
  initialState,
  reducers: {
    setRootNote: (state, action: PayloadAction<{ id: string; note: Note }>) => {
      ensureInstance(state, action.payload.id);
      state.instances[action.payload.id].rootNote = action.payload.note;
    },
    setScaleType: (state, action: PayloadAction<{ id: string; type: ScaleType }>) => {
      ensureInstance(state, action.payload.id);
      state.instances[action.payload.id].scaleType = action.payload.type;
    },
    setDisplayType: (state, action: PayloadAction<{ id: string; type: DisplayType }>) => {
      ensureInstance(state, action.payload.id);
      state.instances[action.payload.id].displayType = action.payload.type;
    },
    setArpeggioType: (state, action: PayloadAction<{ id: string; type: ArpeggioType }>) => {
      ensureInstance(state, action.payload.id);
      state.instances[action.payload.id].arpeggioType = action.payload.type;
    },
    setUseNashville: (state, action: PayloadAction<{ id: string; useNashville: boolean }>) => {
      ensureInstance(state, action.payload.id);
      state.instances[action.payload.id].useNashville = action.payload.useNashville;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setCagedPattern: (state, action: PayloadAction<{ id: string; pattern: CagedPattern }>) => {
      ensureInstance(state, action.payload.id);
      state.instances[action.payload.id].cagedPattern = action.payload.pattern;
    },
    setERelativePattern: (state, action: PayloadAction<{ id: string; pattern: ERelativePattern }>) => {
      ensureInstance(state, action.payload.id);
      state.instances[action.payload.id].eRelativePattern = action.payload.pattern;
    },
    addInstance: (state, action: PayloadAction<string>) => {
      if (!state.instances[action.payload]) {
        state.instances[action.payload] = createDefaultInstance(action.payload);
      }
    },
    removeInstance: (state, action: PayloadAction<string>) => {
      delete state.instances[action.payload];
    },
    updateInstancesOrder: (state, action: PayloadAction<Record<string, FretboardInstance>>) => {
      state.instances = action.payload;
    },
    setFrets: (state, action: PayloadAction<{ id: string; frets: number }>) => {
      ensureInstance(state, action.payload.id);
      state.instances[action.payload.id].frets = action.payload.frets;
    },
    setFretWidth: (state, action: PayloadAction<{ id: string; fretWidth: number }>) => {
      ensureInstance(state, action.payload.id);
      state.instances[action.payload.id].fretWidth = action.payload.fretWidth;
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
  setFrets,
  setFretWidth,
} = guitarSlice.actions;

export default guitarSlice.reducer;  