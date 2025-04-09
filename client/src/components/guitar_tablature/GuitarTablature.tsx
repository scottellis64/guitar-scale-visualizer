import React, { useCallback } from 'react';
import { Box, Paper, Typography, IconButton, styled } from '@mui/material';
import { Tablature, NotePosition, TablatureSectionType } from 'types';
import { GuitarTheme } from 'themes';

interface GuitarTablatureProps {
  title?: string;
  tablature: Tablature;
  editing?: boolean;
}

interface TabLineProps {
  showLeftBorder?: boolean;
  showRightBorder?: boolean;
  width?: number;
}

const TabLine = styled(Box)<TabLineProps>(({ theme, showLeftBorder, showRightBorder, width }) => ({
  display: 'flex',
  alignItems: 'center',
  height: width ? `${width}px` : (theme as GuitarTheme).tablature.columnContentWidth,
  borderBottom: (theme as GuitarTheme).tablature.lineBorder,
  borderLeft: showLeftBorder ? (theme as GuitarTheme).tablature.lineBorder : 0,
  borderRight: showRightBorder ? (theme as GuitarTheme).tablature.lineBorder : 0,
}));

const FretContent = styled(Box)(({}) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row'
}));

const TabColumn = styled(Box)(({ theme }) => ({
  width: (theme as GuitarTheme).tablature.columnWidth,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

const TabColumnSectionContent = styled(Box)(({ theme }) => ({
  position: 'relative', 
  width: '100%', 
  height: (theme as GuitarTheme).tablature.columnContentWidth
}));

// Children elements are absolutely positioned to 0 and fill the parent.
// This is used to overlay the fret number and tablature button on the tablature line.
const VerticalChildOverlayContainer = styled(Box)(({}) => ({
  position: 'absolute', 
  top: 0, 
  height: '100%', 
  width: '100%' 
}));

interface TablatureButtonProps {
  editing?: boolean;
}

const TablatureButton = styled(IconButton, {
  shouldForwardProp: prop => prop !== 'isERelativePattern'
})<TablatureButtonProps>(({ theme, editing }) => ({
  transform: 'translateY(50%)',
  width: (theme as GuitarTheme).tablature.columnContentWidth,
  height: (theme as GuitarTheme).tablature.columnContentHeight,
  backgroundColor: editing ? (theme as GuitarTheme).tablature.tabButtonBackground : 'transparent',
  border: editing ? (theme as GuitarTheme).tablature.tabButtonBorder : 'none',
  '&:hover': editing ? {
    backgroundColor: (theme as GuitarTheme).tablature.tabButtonHover,
  } : {},
  zIndex: 3,
  padding: 0,
  fontSize: (theme as GuitarTheme).tablature.fontSize,
  fontWeight: (theme as GuitarTheme).tablature.fontWeight,
  color: (theme as GuitarTheme).tablature.color,
  margin: 'auto'
}));

interface TabSectionProps {
  section: TablatureSectionType;
  first?: boolean;
  last?: boolean;
  editing?: boolean;
}

const TablatureSection: React.FC<TabSectionProps> = ({
  section,
  first,
  last,
  editing
}) => {
  const { fret, notes } = section;

  const getTabNote = useCallback((stringIndex: number): NotePosition | undefined => {
    return notes.find((note: NotePosition) => note.string === stringIndex);
  }, [notes]);

  return (
    <TabColumn>
      {Array(6).fill(0).map((_i, i) => {
        const note = getTabNote(i);
        const showLeftBorder = first && !! i;
        const showRightBorder = last && !! i;

        return (
          <TabColumnSectionContent>
            <VerticalChildOverlayContainer>
              <TabLine 
                key={`tabline-${fret}-${i}`} 
                showLeftBorder={showLeftBorder}
                showRightBorder={showRightBorder} 
              />
            </VerticalChildOverlayContainer>
            { note && (
              <VerticalChildOverlayContainer>
                <FretContent>
                  <TablatureButton editing={editing}>{fret}</TablatureButton>
                </FretContent>
              </VerticalChildOverlayContainer>
              )
            }
          </TabColumnSectionContent>
        )
      })}
    </TabColumn>
  );
};

export const GuitarTablature: React.FC<GuitarTablatureProps> = ({
  title = 'Guitar Tablature',
  tablature,
  editing = false,
}) => {
  return (
    <Paper elevation={2} sx={{ p: 2, maxWidth: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'row'
      }}>
        {(tablature && tablature.columns) && tablature.columns.map((tabColumn, i) => (
          <TablatureSection 
            key={`tabsection-${tabColumn.fret}-${i}`} 
            section={tabColumn} 
            first={i === 0}
            last={i === tablature.columns.length - 1}
            editing={editing}
          />
        ))}
      </Box>
    </Paper>
  );
}; 