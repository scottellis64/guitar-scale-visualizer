import { useEffect } from 'react';
import { Box, Container, IconButton } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'store';
import { FretboardManual, GuitarScaleVisualizerHeader } from 'components';
import { addInstance, removeInstance, updateInstancesOrder } from 'store/guitar-slice';
import DeleteIcon from '@mui/icons-material/Delete';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export function FretboardInstance() {
  const dispatch = useDispatch();
  const instances = useSelector((state: RootState) => state.guitar.instances);

  useEffect(() => {
    // Add initial instances if none exist
    if (Object.keys(instances).length === 0) {
      dispatch(addInstance('instance-1'));
      dispatch(addInstance('instance-2'));
      dispatch(addInstance('instance-3'));
    }
  }, [dispatch, instances]);

  const handleDelete = (id: string) => {
    if (Object.keys(instances).length > 1) { // Prevent deleting the last instance
      dispatch(removeInstance(id));
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Don't do anything if dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get the ordered list of instance IDs
    const orderedIds = Object.keys(instances);
    
    // Remove the dragged item from its position and insert it at the new position
    const [movedId] = orderedIds.splice(source.index, 1);
    orderedIds.splice(destination.index, 0, movedId);

    // Create a new instances object with the updated order
    const reorderedInstances = orderedIds.reduce((acc, id) => {
      acc[id] = instances[id];
      return acc;
    }, {} as typeof instances);

    // Update the Redux state with the new order
    dispatch(updateInstancesOrder(reorderedInstances));
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        maxWidth: '2500px',
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ py: 4 }}>
        <GuitarScaleVisualizerHeader />
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fretboards" direction="horizontal">
            {(provided) => (
              <Box 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid-container"
                sx={{
                  mt: 4,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 667px), 1fr))',
                  gap: 2,
                  gridAutoFlow: 'dense',
                  '& > *': {
                    minHeight: 'fit-content',
                    minWidth: { xs: '467px', sm: '600px', md: '667px' },
                    width: '100%',
                    breakInside: 'avoid',
                  },
                  justifyItems: 'center',
                  margin: '0 auto',
                }}
              >
                {Object.keys(instances).map((id, index) => (
                  <Draggable key={id} draggableId={id} index={index}>
                    {(provided, snapshot) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          p: 2,
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                          boxShadow: snapshot.isDragging ? 12 : 1,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: 'translateZ(0)',
                          '&:hover': {
                            boxShadow: 8,
                            transform: snapshot.isDragging ? 'none' : 'translateY(-4px)',
                            '& .delete-button': {
                              opacity: 1,
                            },
                          },
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          width: '100%',
                          maxWidth: '800px',
                          position: 'relative',
                          cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                          ...(snapshot.isDragging && {
                            opacity: 0.8,
                            pointerEvents: 'none',
                          }),
                        }}
                      >
                        <IconButton
                          onClick={() => handleDelete(id)}
                          className="delete-button"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            opacity: 0,
                            transition: 'opacity 0.2s ease-in-out',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            },
                            zIndex: 1,
                          }}
                          size="small"
                          aria-label="delete fretboard"
                        >
                          <DeleteIcon />
                        </IconButton>
                        <FretboardManual id={id} />
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </Container>
  );
} 