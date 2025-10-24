// AllTagList.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
    Box,
    Breadcrumbs,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Link,
    Autocomplete,
    TextField,
    LinearProgress,
    Chip,
    TablePagination,
    Stack,
    Button,
    IconButton,
    Fab,
    ButtonGroup
} from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import LoadingMechanic from '../components/LoadingBackdrop';
import { Printer, QrCode, Pencil, Trash } from 'lucide-react';
const apiHost = import.meta.env.VITE_API_HOST;

export default function AllTagList() {
    const navigate = useNavigate();
    const [tagList, setTagList] = useState([]);
    const [motorOptions, setMotorOptions] = useState([]);
    const [selectedMotor, setSelectedMotor] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const inputRef = useRef(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        setLoading(true);
        axios.get(`${apiHost}/api/tagList`)
            .then(res => {
                setTagList(res.data);
                const uniqueMotors = Array.from(
                    new Map(res.data.map(item => [item.motor_name, item])).values()
                );
                setMotorOptions(uniqueMotors.map(item => item.motor_name));
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading tag list:', err);
                setLoading(false);
            });
    }, []);

    const filteredList = tagList.filter(item => {
        const motorMatch = selectedMotor ? item.motor_name === selectedMotor : true;
        const searchMatch = [
            item.insp_customer_name,
            item.insp_sale_quote,
            item.insp_service_order
        ].some(field => field?.toLowerCase().includes(searchText.toLowerCase()));
        return motorMatch && searchMatch;
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box p={3}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link
                    underline="hover"
                    color="inherit"
                    component="button"
                    onClick={() => navigate('/dashboard')}
                >
                    Dashboard
                </Link>
                <Typography color="text.primary">Tag List</Typography>
            </Breadcrumbs>

            <Typography variant="h6" gutterBottom>
                รายการตรวจสอบ (ทั้งหมด {filteredList.length} รายการ)
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <Autocomplete
                    options={motorOptions}
                    value={selectedMotor}
                    onChange={(e, newValue) => {
                        setSelectedMotor(newValue);
                        setTimeout(() => {
                            inputRef.current?.blur(); // บังคับ blur จริง
                        }, 100); // หน่วงนิดให้ dropdown ปิดก่อน
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="เลือกมอเตอร์ (motor name)"
                            inputRef={inputRef} // ใส่ตรงนี้!
                        />
                    )}
                    fullWidth
                    clearOnEscape
                    freeSolo
                />

                <TextField
                    label="ค้นหาชื่อ/SQ/Service Order"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    fullWidth
                />
            </Stack>

            {loading ? (
                <LoadingMechanic open={loading} message="กำลังโหลดข้อมูล TAG ..." />
            ) : (
                <>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Motor</TableCell>
                                    <TableCell>Inspection No</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>SQ</TableCell>
                                    <TableCell>Service Order</TableCell>
                                    <TableCell>Priority</TableCell>
                                    <TableCell align='center'>Station Now</TableCell>
                                    <TableCell align='center'>Station Prev</TableCell>
                                    <TableCell>Created At</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow
                                        key={row.insp_id}
                                        hover
                                        sx={{
                                            cursor: 'pointer',
                                            backgroundColor: (theme) =>
                                                theme.palette.mode === 'light'
                                                    ? (index % 2 === 0 ? '#fafafa' : '#fff')
                                                    : (index % 2 === 0 ? '#1e1e1e' : '#2a2a2a'),
                                            '&:hover': {
                                                backgroundColor: (theme) =>
                                                    theme.palette.mode === 'light' ? '#e3f2fd' : '#333',
                                            },
                                        }}
                                    /* onClick={() => navigate(`/inspection/${row.insp_no}?from=Tag-List`)} */
                                    >
                                        <TableCell>
                                            <ButtonGroup variant="outlined" aria-label="Colorful buttons" size='small'>
                                                <Button sx={{ color: 'primary.main', borderColor: 'primary.main' }}> <Printer /></Button>
                                                <Button sx={{ color: 'success.main', borderColor: 'success.main' }}> <QrCode /></Button>
                                            </ButtonGroup>
                                            <ButtonGroup variant="outlined" aria-label="Colorful buttons" size='small' sx={{ mt: 1 }}>
                                                <Button sx={{ color: 'warning.main', borderColor: 'warning.main' }}> <Pencil /></Button>
                                                <Button sx={{ color: 'error.main', borderColor: 'error.main' }}><Trash /></Button>
                                            </ButtonGroup>
                                            {/*  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>

                                                <Fab size="small" color="warning" aria-label="print">
                                                    <Pencil />
                                                </Fab>
                                                <Fab size="small" color="error" aria-label="qrcode">
                                                    <Trash />
                                                </Fab>
                                            </Stack> */}
                                        </TableCell>
                                        <TableCell>{row.motor_name}</TableCell>
                                        <TableCell>
                                            <Link
                                                underline="hover"
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/inspection/${row.insp_no}?from=Tag-List`);
                                                }}
                                            >
                                                {row.insp_no}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{row.insp_customer_name || '-'}</TableCell>
                                        <TableCell>{row.insp_sale_quote || '-'}</TableCell>
                                        <TableCell>{row.insp_service_order || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.insp_priority || '-'}
                                                size="small"
                                                sx={{
                                                    backgroundColor:
                                                        row.insp_priority === 'High'
                                                            ? '#d32f2f'
                                                            : row.insp_priority === 'Meduim'
                                                                ? '#ed6c02'
                                                                : '#cfd8dc',
                                                    color: '#fff',
                                                    fontWeight: 'bold',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align='center'>
                                            <Chip
                                                label={row.insp_station_now || '-'}
                                                variant="outlined"
                                                color="primary"
                                                sx={{ fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell align='center'>{(row.insp_station_prev) || '-'}</TableCell>
                                        <TableCell>
                                            {row.insp_created_at
                                                ? `${dayjs(row.insp_created_at).format("YYYY-MM-DD HH:mm")}น.`
                                                : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={filteredList.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 20, 50]}
                    />
                </>
            )}
        </Box>
    );
}
