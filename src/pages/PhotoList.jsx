// TagList.jsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
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
    Chip,
    TablePagination,
    Stack,
    Button,
    Tooltip,
    InputAdornment
} from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import LoadingMechanic from '../components/LoadingBackdrop';
import { Printer, QrCode, Cog, Search } from 'lucide-react';

const apiHost = import.meta.env.VITE_API_HOST;

export default function PhotoList() {
    const navigate = useNavigate();

    const [tagList, setTagList] = useState([]);
    const [selectedMotor, setSelectedMotor] = useState(null); // string | null
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);

    const inputRef = useRef(null);
    const [timelineOpen, setTimelineOpen] = useState(false);
    const [selectedInspID, setSelectedInspID] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const branch = sessionStorage.getItem('usvt_branch') || '';

    useEffect(() => {
        setLoading(true);
        axios
            .get(`http://192.168.112.49:5000/api/photoList`, { params: { branch } })
            .then((res) => {
                setTagList(res.data || []);
            })
            .catch((err) => {
                console.error('Error loading tag list:', err);
            })
            .finally(() => setLoading(false));
    }, [branch]);

    // ---- options มอเตอร์ (unique) ----
    const motorOptions = useMemo(() => {
        const unique = new Map((tagList || []).map((item) => [(item?.motor_name ?? '-'), item]));
        return Array.from(unique.values()).map((item) => item?.motor_name ?? '-');
    }, [tagList]);

    // ---- filter list ----
    const filteredList = useMemo(() => {
        const q = (searchText ?? '').toString().toLowerCase();
        return (tagList || []).filter((item) => {
            const motorMatch = selectedMotor ? ((item?.motor_name ?? '-') === selectedMotor) : true;
            const searchSource = [
                item?.insp_customer_name,
                item?.insp_sale_quote,
                item?.insp_service_order,
            ].map((v) => (v ?? '').toString().toLowerCase());
            const searchMatch = searchSource.some((v) => v.includes(q));
            return motorMatch && searchMatch;
        });
    }, [tagList, selectedMotor, searchText]);

    const handleChangePage = (_event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getPriorityColor = (p) => {
        const val = (p ?? '').toString().toLowerCase();
        if (val === 'high') return '#d32f2f';
        if (val === 'medium' || val === 'meduim') return '#ed6c02';
        return '#90a4ae';
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
                <Typography color="text.primary">Photo List</Typography>
            </Breadcrumbs>

            <Typography variant="h6" gutterBottom>
                รายการตรวจสอบ (ทั้งหมด {filteredList.length} รายการ)
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <Autocomplete
                    options={motorOptions}          // ถ้าเป็น string[] โค้ดนี้ใช้ได้เลย
                    value={selectedMotor}
                    onChange={(_e, newValue) => {
                        // freeSolo: newValue อาจเป็น string หรือ null
                        setSelectedMotor(typeof newValue === 'string' ? newValue : newValue ?? null);
                        setTimeout(() => inputRef.current?.blur(), 100);
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="เลือกมอเตอร์ (motor name)"
                            inputRef={inputRef}
                            slotProps={
                                {
                                    input: {
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Cog size={18} />
                                            </InputAdornment>
                                        ),
                                    }
                                }
                            }
                        />
                    )}
                    fullWidth
                    clearOnEscape
                    freeSolo
                />


                <TextField
                    slotProps={
                        {
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} />
                                    </InputAdornment>
                                ),
                            }
                        }
                    }
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
                                    <TableCell align="center">Action</TableCell>
                                    <TableCell align="center">Motor</TableCell>
                                    <TableCell>Inspection No</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>SQ</TableCell>
                                    <TableCell>Service Order</TableCell>
                                    <TableCell>incoming date</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredList.length === 0 ? (
                                    <TableRow>
                                        {/* มี 10 คอลัมน์ */}
                                        <TableCell colSpan={10} align="center" sx={{ py: 3, color: 'text.secondary', fontWeight: 600 }}>
                                            ไม่มีผลลัพธ์
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredList
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => (
                                            <TableRow
                                                key={row.insp_id}
                                                hover
                                                sx={{
                                                    backgroundColor: (theme) =>
                                                        theme.palette.mode === 'light'
                                                            ? index % 2 === 0
                                                                ? '#fafafa'
                                                                : '#fff'
                                                            : index % 2 === 0
                                                                ? '#1e1e1e'
                                                                : '#2a2a2a',
                                                    '&:hover': {
                                                        backgroundColor: (theme) =>
                                                            theme.palette.mode === 'light' ? '#e3f2fd' : '#333',
                                                    },
                                                }}
                                            >
                                                <TableCell align="center">
                                                    <Tooltip title="พิมพ์เอกสาร">
                                                        <span>
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{ bgcolor: '#E3F2FD', color: '#0D47A1', '&:hover': { bgcolor: '#BBDEFB' }, width: '100%' }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const url = `/print/${row.insp_no}`;
                                                                    window.open(url, '_blank');
                                                                }}

                                                            >
                                                                <Printer size={16} />
                                                                &nbsp;พิมพ์
                                                            </Button>
                                                        </span>
                                                    </Tooltip>

                                                    {/* <Tooltip title="พิมพ์ QR">
                                                            <span>
                                                                <Button
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: '#E8F5E9',
                                                                        color: '#1B5E20',
                                                                        '&:hover': { bgcolor: '#C8E6C9' },
                                                                        border: '1px solid #A5D6A7',
                                                                        width: '100%',
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(`/print-qr/${row.insp_no}`, '_blank');
                                                                    }}
                                                                >
                                                                    <QrCode size={16} />
                                                                    &nbsp;QR
                                                                </Button>
                                                            </span>
                                                        </Tooltip> */}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px' }}>
                                                        {row?.motor_name ?? '-'}
                                                    </Box>
                                                </TableCell>

                                                <TableCell>
                                                    <Button
                                                        color="primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/inspection/${row.insp_no}?from=photoList`);
                                                        }}
                                                    >
                                                        {row?.insp_no ?? '-'}
                                                    </Button>
                                                </TableCell>
                                                <TableCell>{row?.insp_customer_name ?? '-'}</TableCell>
                                                <TableCell>{row?.insp_sale_quote ?? '-'}</TableCell>
                                                <TableCell>{row?.insp_service_order ?? '-'}</TableCell>
                                                <TableCell>
                                                    {row?.insp_created_at
                                                        ? `${dayjs(row.insp_created_at).format('YYYY-MM-DD')}`
                                                        : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
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
