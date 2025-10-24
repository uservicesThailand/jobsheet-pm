// src/Layout.jsx
import React from 'react';
import TopBar from './components/TopBar';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

export default function Layout() {
    return (
        <>
            <Box>
                <TopBar />
                <Outlet /> {/* แสดงแต่ละหน้าตาม Route */}
            </Box>
        </>);
}
