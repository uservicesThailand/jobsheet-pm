import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent,
    TextField, Chip, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, Grid
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

export default function SaveButton() {

    return (
        <>
            <Button
                type="submit"
                color="warning"
                variant="contained" startIcon={<SaveIcon />}
                size="large"
            >
                บันทึก
            </Button>
        </>
    )
}