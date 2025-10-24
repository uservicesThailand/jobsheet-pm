// FormList.jsx - Redesigned for cleaner, modern UI
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
    InputAdornment,
    Card,
    Grid
} from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import LoadingMechanic from '../components/LoadingBackdrop';
import { Printer, QrCode, Cog, Search, Calendar, Filter } from 'lucide-react';

const apiHost = import.meta.env.VITE_API_HOST;

export default function FormList() {
    const navigate = useNavigate();

    const [tagList, setTagList] = useState([]);
    const [selectedMotor, setSelectedMotor] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);

    const inputRef = useRef(null);
    const [timelineOpen, setTimelineOpen] = useState(false);
    const [selectedInspID, setSelectedInspID] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const [selectedMonth, setSelectedMonth] = useState(null);

    const branch = sessionStorage.getItem('usvt_branch') || '';

    const yearOptions = useMemo(() => {
        const currentYear = dayjs().year();
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
            years.push(i);
        }
        return years;
    }, []);

    const monthOptions = useMemo(() => [
        { value: null, label: 'ทุกเดือน' },
        { value: 1, label: 'มกราคม' },
        { value: 2, label: 'กุมภาพันธ์' },
        { value: 3, label: 'มีนาคม' },
        { value: 4, label: 'เมษายน' },
        { value: 5, label: 'พฤษภาคม' },
        { value: 6, label: 'มิถุนายน' },
        { value: 7, label: 'กรกฎาคม' },
        { value: 8, label: 'สิงหาคม' },
        { value: 9, label: 'กันยายน' },
        { value: 10, label: 'ตุลาคม' },
        { value: 11, label: 'พฤศจิกายน' },
        { value: 12, label: 'ธันวาคม' }
    ], []);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${apiHost}/api/formList`, {
                params: {
                    branch,
                    year: selectedYear
                }
            })
            .then((res) => {
                setTagList(res.data || []);
            })
            .catch((err) => {
                console.error('Error loading tag list:', err);
            })
            .finally(() => setLoading(false));
    }, [branch, selectedYear]);

    const motorOptions = useMemo(() => {
        const unique = new Map((tagList || []).map((item) => [(item?.motor_name ?? '-'), item]));
        return Array.from(unique.values()).map((item) => item?.motor_name ?? '-');
    }, [tagList]);

    const filteredList = useMemo(() => {
        const q = (searchText ?? '').toString().toLowerCase();
        return (tagList || []).filter((item) => {
            const motorMatch = selectedMotor ? ((item?.motor_name ?? '-') === selectedMotor) : true;

            let monthMatch = true;
            if (selectedMonth !== null && item?.insp_created_at) {
                const itemMonth = dayjs(item.insp_created_at).month() + 1;
                monthMatch = itemMonth === selectedMonth;
            }

            const searchSource = [
                item?.insp_customer_name,
                item?.insp_sale_quote,
                item?.insp_service_order,
                item?.insp_no,
            ].map((v) => (v ?? '').toString().toLowerCase());
            const searchMatch = searchSource.some((v) => v.includes(q));

            return motorMatch && monthMatch && searchMatch;
        });
    }, [tagList, selectedMotor, selectedMonth, searchText]);

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
        <Box
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                backgroundColor: '#f8f9fa',
                minHeight: '100vh'
            }}
        >
            {/* Breadcrumb */}
            <Breadcrumbs
                aria-label="breadcrumb"
                sx={{
                    mb: 3,
                    '& .MuiBreadcrumbs-separator': {
                        color: '#90a4ae'
                    }
                }}
            >
                <Link
                    underline="hover"
                    color="#546e7a"
                    component="button"
                    onClick={() => navigate('/dashboard')}
                    sx={{
                        fontWeight: 500,
                        '&:hover': {
                            color: '#1976d2'
                        }
                    }}
                >
                    Dashboard
                </Link>
                <Typography
                    color="#263238"
                    fontWeight={600}
                >
                    รายการตรวจสอบ
                </Typography>
            </Breadcrumbs>

            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 600,
                        color: '#263238',
                        mb: 1
                    }}
                >
                    รายการตรวจสอบ
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: '#607d8b',
                        fontWeight: 400
                    }}
                >
                    ทั้งหมด {filteredList.length} รายการ
                </Typography>
            </Box>

            {/* Filter Section */}
            <Card
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#ffffff'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                    <Filter size={20} style={{ marginRight: 8, color: '#546e7a' }} />
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 600,
                            color: '#263238'
                        }}
                    >
                        ตัวกรองข้อมูล
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {/* Motor Filter */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Autocomplete
                            options={motorOptions}
                            value={selectedMotor}
                            onChange={(_e, newValue) => {
                                setSelectedMotor(typeof newValue === 'string' ? newValue : newValue ?? null);
                                setTimeout(() => inputRef.current?.blur(), 100);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="มอเตอร์"
                                    inputRef={inputRef}
                                    size="small"
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Cog size={18} style={{ color: '#78909c' }} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#fafafa',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                            },
                                            '&.Mui-focused': {
                                                backgroundColor: '#ffffff',
                                            }
                                        }
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    {/* Year Filter */}
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <Autocomplete
                            options={yearOptions}
                            value={selectedYear}
                            onChange={(_e, newValue) => setSelectedYear(newValue ?? dayjs().year())}
                            getOptionLabel={(option) => option.toString()}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="ปี"
                                    size="small"
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Calendar size={18} style={{ color: '#78909c' }} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#fafafa',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                            },
                                            '&.Mui-focused': {
                                                backgroundColor: '#ffffff',
                                            }
                                        }
                                    }}
                                />
                            )}
                            disableClearable
                        />
                    </Grid>

                    {/* Month Filter */}
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} >
                        <Autocomplete
                            options={monthOptions}
                            value={monthOptions.find(m => m.value === selectedMonth) || monthOptions[0]}
                            onChange={(_e, newValue) => {
                                setSelectedMonth(newValue?.value ?? null);
                            }}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="เดือน"
                                    size="small"
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Calendar size={18} style={{ color: '#78909c' }} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#fafafa',
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                            },
                                            '&.Mui-focused': {
                                                backgroundColor: '#ffffff',
                                            }
                                        }
                                    }}
                                />
                            )}
                            disableClearable
                        />
                    </Grid>

                    {/* Search Filter */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            size="small"
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={18} style={{ color: '#78909c' }} />
                                        </InputAdornment>
                                    ),
                                }
                            }}
                            label="ค้นหา (ชื่อ, SQ, Service Order)"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#fafafa',
                                    '&:hover': {
                                        backgroundColor: '#f5f5f5',
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: '#ffffff',
                                    }
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </Card>

            {loading ? (
                <LoadingMechanic open={loading} message="กำลังโหลดข้อมูล..." />
            ) : (
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden'
                    }}
                >
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        backgroundColor: '#37474f',
                                        '& .MuiTableCell-head': {
                                            color: '#ffffff',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            borderBottom: 'none',
                                            py: 2
                                        }
                                    }}
                                >
                                    {/* <TableCell align="center" sx={{ width: '140px' }}>การดำเนินการ</TableCell> */}
                                    <TableCell align="center" sx={{ width: '120px' }}>มอเตอร์</TableCell>
                                    <TableCell>เลขที่ตรวจสอบ</TableCell>
                                    <TableCell>ลูกค้า</TableCell>
                                    <TableCell>SQ</TableCell>
                                    <TableCell>Service Order</TableCell>
                                    <TableCell>วันที่รับเข้า</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredList.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            align="center"
                                            sx={{
                                                py: 8,
                                                color: '#90a4ae',
                                                fontSize: '1rem',
                                                fontWeight: 500
                                            }}
                                        >
                                            ไม่พบข้อมูล
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredList
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => (
                                            <TableRow
                                                key={row.insp_id}
                                                sx={{
                                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                                                    '&:hover': {
                                                        backgroundColor: '#e3f2fd',
                                                        transition: 'background-color 0.2s ease'
                                                    },
                                                    '& .MuiTableCell-root': {
                                                        borderBottom: '1px solid #eeeeee',
                                                        py: 2
                                                    }
                                                }}
                                            >
                                                {/* <TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        sx={{
                                                            bgcolor: '#1976d2',
                                                            color: '#ffffff',
                                                            textTransform: 'none',
                                                            fontWeight: 500,
                                                            boxShadow: 'none',
                                                            minWidth: '100px',
                                                            '&:hover': {
                                                                bgcolor: '#1565c0',
                                                                boxShadow: '0 2px 4px rgba(25, 118, 210, 0.25)'
                                                            }
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const url = `/print/${row.insp_no}`;
                                                            window.open(url, '_blank');
                                                        }}
                                                        startIcon={<Printer size={16} />}
                                                    >
                                                        พิมพ์
                                                    </Button>
                                                </TableCell>

                                               */}
                                                <TableCell align="center">
                                                    <Chip
                                                        label={row?.motor_name ?? '-'}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#e8eaf6',
                                                            color: '#3f51b5',
                                                            fontWeight: 500,
                                                            fontSize: '0.813rem'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        sx={{
                                                            color: '#1976d2',
                                                            fontWeight: 500,
                                                            textTransform: 'none',
                                                            p: 0,
                                                            minWidth: 'auto',
                                                            '&:hover': {
                                                                backgroundColor: 'transparent',
                                                                textDecoration: 'underline'
                                                            }
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/formNumberInput/${row.insp_no}?from=FormList`);
                                                        }}
                                                    >
                                                        {row?.insp_no ?? '-'}
                                                    </Button>
                                                </TableCell>

                                                <TableCell sx={{ color: '#37474f', fontWeight: 500 }}>
                                                    {row?.insp_customer_name ?? '-'}
                                                </TableCell>

                                                <TableCell sx={{ color: '#546e7a' }}>
                                                    {row?.insp_sale_quote ?? '-'}
                                                </TableCell>

                                                <TableCell sx={{ color: '#546e7a' }}>
                                                    {row?.insp_service_order ?? '-'}
                                                </TableCell>

                                                <TableCell sx={{ color: '#607d8b' }}>
                                                    {row?.insp_created_at
                                                        ? dayjs(row.insp_created_at).format('DD/MM/YYYY')
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
                        labelRowsPerPage="แสดงต่อหน้า:"
                        labelDisplayedRows={({ from, to, count }) =>
                            `${from}-${to} จาก ${count}`
                        }
                        sx={{
                            borderTop: '1px solid #e0e0e0',
                            backgroundColor: '#fafafa',
                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                color: '#546e7a',
                                fontWeight: 500
                            }
                        }}
                    />
                </Card>
            )}
        </Box>
    );
}