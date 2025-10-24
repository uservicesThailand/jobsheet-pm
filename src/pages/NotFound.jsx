// src/pages/NotFound.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <Box textAlign="center" mt={10}>
            <Typography variant="h3" gutterBottom>404</Typography>
            <Typography variant="h5" gutterBottom>ไม่พบหน้าที่คุณร้องขอ หรือหมดอายุ</Typography>
            <Button variant="contained" onClick={() => navigate('/')}>กลับหน้าหลัก</Button>
        </Box>
    );
}
