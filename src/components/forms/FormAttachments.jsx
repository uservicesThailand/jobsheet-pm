import React from 'react';
import { Box, Typography } from '@mui/material';

export default function FormAttachments({ data, keyName }) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>{keyName}</Typography>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Box>
  );
}
