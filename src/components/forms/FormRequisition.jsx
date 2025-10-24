import React from 'react';
import {
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, TextareaAutosize
} from '@mui/material';
import Swal from 'sweetalert2';

export default function FormRequisition({ data, keyName }) {
  const handleSubmit = async (e) => {

  };

  return (
    <TableContainer component={Paper} sx={{ mb: 2, p: 2 }}>
      <Table size="small">
        <TableRow>
          <TableCell>1. Bearing DE</TableCell>
          <TableCell>
            <TextField label="Renew No. /  Brand:" />
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>2. Bearing NDE</TableCell>
          <TableCell>
            <TextField label="Renew No. /  Brand:" />
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>3. Oil Seal DE</TableCell>
          <TableCell>
            <TextField label="Renew No. /  Brand:" />
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>4. Oil Seal NDE</TableCell>
          <TableCell>
            <TextField label="Renew No. /  Brand:" />
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>5. V-Ring DE</TableCell>
          <TableCell>
            <TextField label="Renew No. /  Brand:" />
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>6. V-Ring NDE</TableCell>
          <TableCell>
            <TextField label="Renew No. /  Brand:" />
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
      </Table>
    </TableContainer>
  );
}
