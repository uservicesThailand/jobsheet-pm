// src/pages/SearchList.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Stack,
    Snackbar,
    Alert,
    InputAdornment,
    Breadcrumbs,
    Link,
    Divider,
    Autocomplete,
    Table, TableHead, TableRow, TableCell, TableBody, TableContainer
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';
import { Search, FileText, Building2, SearchCheck } from 'lucide-react';

export default function SearchList() {
    const apiHost = import.meta.env.VITE_API_HOST;
    const navigate = useNavigate();

    const [orderId, setOrderId] = useState('');
    const [companyCode, setCompanyCode] = useState('');
    const [error, setError] = useState('');
    const [companyList, setCompanyList] = useState([]);
    const [orderIdError, setOrderIdError] = useState(false);
    const [companyCodeError, setCompanyCodeError] = useState(false);
    const [results, setResults] = useState([]);
    const [branchWarning, setBranchWarning] = useState('');
    const [searched, setSearched] = useState(false); // ✅ รู้ว่ากดค้นหาแล้วหรือยัง

    const branch = sessionStorage.getItem('usvt_branch') || '';

    useEffect(() => {
        axios.get(`${apiHost}/company/list`, { params: { branch } })
            .then((res) => {
                const formatted = res.data.map((item) => ({
                    code: item.insp_customer_no,
                    name: item.insp_customer_name,
                }));
                setCompanyList(formatted);
            })
            .catch((err) => {
                console.error('โหลดบริษัทล้มเหลว:', err);
            });
    }, [apiHost, branch]);

    const handleSearch = async () => {
        // Reset states
        setOrderIdError(false);
        setCompanyCodeError(false);
        setError('');
        setBranchWarning('');
        setResults([]);
        setSearched(false);

        // validation: ใส่ได้ทีละช่อง
        if (orderId && companyCode) {
            setError('กรุณากรอกเพียงช่องใดช่องหนึ่งเท่านั้น');
            setOrderIdError(true);
            setCompanyCodeError(true);
            return;
        }
        if (!orderId && !companyCode) {
            setError('กรุณากรอกอย่างน้อย 1 ช่องเพื่อค้นหา');
            setOrderIdError(true);
            setCompanyCodeError(true);
            return;
        }

        try {
            setSearched(true);
            let res;
            if (orderId) {
                res = await axios.post(`${apiHost}/api/searchSV`, { order_id: orderId, branch });
            } else {
                res = await axios.post(`${apiHost}/api/searchCustomer`, { company_code: companyCode, branch });
            }

            const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);

            // ถ้าพบข้อมูล แต่ branch ไม่ตรง → เตือน + ไม่แสดงผลลัพธ์
            if (data.length > 0 && data[0].insp_branch && data[0].insp_branch !== branch) {
                setBranchWarning(`หมายเลขนี้อยู่ Branch: ${data[0].insp_branch} โปรดสลับการเข้าสู่ระบบ`);
                setResults([]); // ❌ ไม่โชว์ผลลัพธ์
                return;
            }

            setResults(data);
        } catch (err) {
            console.error(err);
            setError('ไม่พบข้อมูลหรือเกิดข้อผิดพลาด');
            setResults([]); // ไม่แสดงผลลัพธ์
            setSearched(true);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={600}>
                    ย้อนกลับ
                </Typography>
            </Box>

            <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" component="button" onClick={() => navigate('/dashboard')}>
                    Dashboard
                </Link>
                <Typography color="primary" variant="button">Search List</Typography>
            </Breadcrumbs>

            <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
                <Typography variant="h5" gutterBottom>
                    🔍 ค้นหาข้อมูลคำสั่งซื้อ
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                    <TextField
                        label="หมายเลขคำสั่งซื้อ (SV)"
                        variant="outlined"
                        fullWidth
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        error={orderIdError}
                        helperText={orderIdError ? 'ไม่สามารถกรอกพร้อมกับรหัสบริษัทได้' : ''}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FileText size={18} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    {/* เตือนเรื่อง branch ถ้าค้นด้วย SV แล้วสาขาไม่ตรง */}
                    {branchWarning && (
                        <Alert severity="warning">{branchWarning}</Alert>
                    )}

                    <Typography align="center">หรือ</Typography>

                    <Autocomplete
                        options={companyList}
                        getOptionLabel={(option) => `${option.code} - ${option.name}`}
                        isOptionEqualToValue={(option, value) => option.code === value.code}
                        onChange={(e, newValue) => setCompanyCode(newValue ? newValue.code : '')}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="รหัสบริษัท (CT)"
                                variant="outlined"
                                error={companyCodeError}
                                helperText={companyCodeError ? 'ไม่สามารถกรอกพร้อมกับหมายเลขคำสั่งซื้อได้' : ''}
                                slotProps={{
                                    input: {
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Building2 size={18} />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                        )}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Search size={18} />}
                        onClick={handleSearch}
                        disabled={!orderId && !companyCode}
                    >
                        ค้นหา
                    </Button>
                </Stack>

                {/* แสดงผลลัพธ์เฉพาะเมื่อมีข้อมูลและไม่มี branchWarning */}
                {Array.isArray(results) && results.length > 0 && !branchWarning && (
                    <Box mt={4}>
                        <Typography
                            variant="subtitle1"
                            sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
                        >
                            <SearchCheck size={20} />
                            ผลลัพธ์ที่พบ:
                        </Typography>

                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Service Order</TableCell>
                                        <TableCell>ชื่อลูกค้า</TableCell>
                                        <TableCell>วันที่เอกสาร</TableCell>
                                        <TableCell>สถานะ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {results.map((row, idx) => (
                                        <TableRow hover key={idx}>
                                            <TableCell
                                                onClick={() => navigate(`/inspection/${row.insp_no}?from=search-list`)}
                                                sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 500 }}
                                            >
                                                {row.insp_service_order}
                                            </TableCell>
                                            <TableCell>{row.insp_customer_name}</TableCell>
                                            <TableCell>{row.insp_document_date}</TableCell>
                                            <TableCell>{row.insp_status}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* ถ้าค้นหาแล้ว แต่ไม่มีข้อมูล และไม่มี branchWarning → บอกว่าไม่พบผลลัพธ์ */}
                {searched && results.length === 0 && !branchWarning && !error && (
                    <Box mt={3}>
                        <Alert severity="info">ไม่พบผลลัพธ์</Alert>
                    </Box>
                )}
            </Paper>

            <Snackbar
                open={!!error}
                autoHideDuration={4000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
}
