import React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

export default () => {
  return (
    <Box
      sx={{
        width: '100%',
        '& > * + *': {
          marginTop: 2,
        },
      }}
    >
      <LinearProgress />
    </Box>
  );
};
