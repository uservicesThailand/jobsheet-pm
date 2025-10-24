import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Box, Typography, Chip, Grid, Breadcrumbs, Link, LinearProgress,
    Button, Card, CardContent, Container, Paper, Fade, Grow,
    alpha, useTheme, TextField, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, CircularProgress
} from '@mui/material';
import Swal from 'sweetalert2';
import {
    Building2, ScanQrCode, Network, Siren, ArrowLeft,
    Save, Pencil, FileText, ChevronRight, CheckCircle2, Circle, Tag
} from 'lucide-react';

// Loading Component
const LoadingScreen = () => (
    <Box
        sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
    >
        <Box sx={{ textAlign: 'center' }}>
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    border: '6px solid rgba(255,255,255,0.2)',
                    borderTop: '6px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    mx: 'auto',
                    '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                    }
                }}
            />
            <Typography variant="h6" color="white" sx={{ mt: 3, fontWeight: 600 }}>
                กำลังโหลดข้อมูล...
            </Typography>
        </Box>
    </Box>
);

export default function FormNumberInput() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fromPage = searchParams.get("from");
    const { id } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [navigating, setNavigating] = useState(false);
    const [formNumber, setFormNumber] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [formsStatus, setFormsStatus] = useState({}); // ⭐ เก็บสถานะแต่ละฟอร์ม
    const [loadingStatus, setLoadingStatus] = useState(false); // ⭐ สถานะการโหลด
    const [isEditing, setIsEditing] = useState(true);
    const [refreshNumber, setRefreshNumber] = useState(0);

    const apiHost = import.meta.env.VITE_API_HOST;

    // โหลดข้อมูล inspection
    useEffect(() => {
        setLoading(true);
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
        const fetchData = axios.get(`${apiHost}/api/inspection/${id}`);

        Promise.all([minLoadingTime, fetchData])
            .then(([, res]) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching detail:", err);
                setLoading(false);
            });
    }, [id]);

    // โหลดจำนวนฟอร์มที่มีอยู่
    useEffect(() => {
        if (data) {
            axios.get(`${apiHost}/api/forms/scm-number/${id}`)
                .then(res => {
                    if (res.data.data && res.data.data.number) {
                        setFormNumber(res.data.data.number);
                        setIsEditing(false);
                    } else {
                        setFormNumber('');
                        setIsEditing(true);
                    }
                })
                .catch(err => {
                    console.error('Error loading form number:', err);
                    setIsEditing(true);
                });
        }
    }, [data, id, refreshNumber]); //  เพิ่ม refreshNumber เป็น dependency

    // ⭐ โหลดสถานะของแต่ละฟอร์ม
    useEffect(() => {
        if (formNumber > 0) {
            setLoadingStatus(true);
            const loadFormsStatus = async () => {
                const statusMap = {};
                const formsList = Array.from({ length: parseInt(formNumber) }, (_, i) => i + 1);

                await Promise.all(
                    formsList.map(async (formIndex) => {
                        const inspNoWithNum = `${id}-${formIndex}`;
                        try {
                            const res = await axios.get(`${apiHost}/api/forms/form_scm_inspection_headers/${inspNoWithNum}`);
                            if (res.data.data && res.data.data.length > 0) {
                                statusMap[formIndex] = {
                                    created: true,
                                    tagNo: res.data.data[0].tag_no || '-',
                                    count: res.data.data.length
                                };
                            } else {
                                statusMap[formIndex] = {
                                    created: false,
                                    tagNo: null,
                                    count: 0
                                };
                            }
                        } catch (err) {
                            statusMap[formIndex] = {
                                created: false,
                                tagNo: null,
                                count: 0
                            };
                        }
                    })
                );

                setFormsStatus(statusMap);
                setLoadingStatus(false);
            };

            loadFormsStatus();
        }
    }, [formNumber, id, apiHost]);

    // ฟังก์ชันบันทึก
    const handleSaveFormNumber = async () => {
        if (!formNumber || formNumber <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'ข้อมูลไม่ครบถ้วน',
                text: 'กรุณาระบุจำนวนฟอร์มที่ถูกต้อง',
                confirmButtonText: 'ตรวจสอบอีกครั้ง',
                confirmButtonColor: '#667eea',
            });
            return;
        }

        setIsSaving(true);

        try {
            const response = await axios.post(`${apiHost}/api/forms/scm-number`, {
                insp_no: id,
                number: parseInt(formNumber)
            });

            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ!',
                    text: response.data.message || 'บันทึกจำนวนงานเรียบร้อยแล้ว',
                    confirmButtonText: 'ตกลง',
                    confirmButtonColor: '#667eea',
                    timer: 2000,
                    timerProgressBar: true,
                });

                // ⭐ Trigger useEffect เพื่อโหลดข้อมูลใหม่
                setRefreshNumber(prev => prev + 1);
                setIsEditing(false); // ⭐ เปลี่ยนเป็นโหมดดู
            }
        } catch (err) {
            console.error('Save error:', err);
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: err.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
                confirmButtonText: 'ปิด',
                confirmButtonColor: '#ef4444',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleNavigate = (path) => {
        setNavigating(true);
        setTimeout(() => {
            navigate(path);
            setNavigating(false);
        }, 300);
    };

    const handleFormClick = (formIndex) => {
        navigate(`/inspection/${id}?num=${formIndex}`);
    };

    if (loading || !data) {
        return <LoadingScreen />;
    }

    // สร้าง array ของฟอร์มตามจำนวนที่กรอก
    const formsList = formNumber > 0
        ? Array.from({ length: parseInt(formNumber) }, (_, i) => i + 1)
        : [];

    // นับจำนวนฟอร์มที่สร้างแล้ว
    const createdFormsCount = Object.values(formsStatus).filter(status => status.created).length;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            {/* Modern Header with Gradient */}
            <Paper elevation={0} sx={{ borderRadius: 0, mb: 4 }}>
                <Container maxWidth="lg">
                    <Box sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Button
                                onClick={() => handleNavigate(-1)}
                                sx={{
                                    minWidth: 'auto',
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    color: 'black',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.25)',
                                        transform: 'translateX(-4px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <ArrowLeft size={20} />
                            </Button>

                            <Breadcrumbs
                                separator="›"
                                sx={{
                                    '& .MuiBreadcrumbs-separator': {
                                        color: 'rgba(0, 0, 0, 0.7)'
                                    }
                                }}
                            >
                                <Link
                                    underline="hover"
                                    component="button"
                                    onClick={() => handleNavigate("/dashboard")}
                                    sx={{
                                        color: 'rgba(0, 0, 0, 0.9)',
                                        fontWeight: 500,
                                        '&:hover': { color: 'black' }
                                    }}
                                >
                                    Dashboard
                                </Link>
                                {fromPage && fromPage !== 'NoticFollow' && fromPage !== 'search-list' &&
                                    fromPage !== 'QR-Scan' && fromPage !== 'start' && fromPage !== 'Tag' && (
                                        <Link
                                            underline="hover"
                                            component="button"
                                            onClick={() => handleNavigate(`/${fromPage}`)}
                                            sx={{
                                                color: 'rgba(0, 0, 0, 0.9)',
                                                fontWeight: 500,
                                                '&:hover': { color: 'black' }
                                            }}
                                        >
                                            {fromPage.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                        </Link>
                                    )}
                                <Typography sx={{ color: 'black', fontWeight: 600 }}>
                                    Details
                                </Typography>
                            </Breadcrumbs>
                        </Box>

                        {navigating && <LinearProgress sx={{ bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} />}
                    </Box>
                </Container>
            </Paper>

            {/* Main Content */}
            <Container maxWidth="lg">
                <Fade in timeout={800}>
                    <Box>
                        {/* QR Scan Badge */}
                        {fromPage === 'QR-Scan' && (
                            <Grow in timeout={600}>
                                <Chip
                                    icon={<ScanQrCode size={18} />}
                                    label="QR Scan"
                                    color="success"
                                    sx={{
                                        mb: 3,
                                        px: 1,
                                        fontWeight: 600,
                                        boxShadow: 2
                                    }}
                                />
                            </Grow>
                        )}

                        {/* Main Info Card */}
                        <Grow in timeout={800}>
                            <Card
                                sx={{
                                    mb: 4,
                                    borderRadius: 4,
                                    overflow: 'visible',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                                    position: 'relative',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '6px',
                                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '16px 16px 0 0'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Grid container spacing={4} alignItems="center">
                                        {/* Left Side - Info */}
                                        <Grid size={{ xs: 12, lg: 8 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 3,
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Network size={32} color="white" />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography
                                                        variant="h4"
                                                        fontWeight={700}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            backgroundClip: 'text',
                                                            WebkitBackgroundClip: 'text',
                                                            WebkitTextFillColor: 'transparent',
                                                        }}
                                                    >
                                                        SID: {data.insp_service_order}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        fontWeight={700}
                                                        sx={{
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            backgroundClip: 'text',
                                                            WebkitBackgroundClip: 'text',
                                                            WebkitTextFillColor: 'transparent',
                                                            mb: 1
                                                        }}
                                                    >
                                                        Jobsheet ID: {data.insp_no}
                                                    </Typography>
                                                    {data.insp_urgent === 1 && (
                                                        <Chip
                                                            icon={<Siren size={16} />}
                                                            label="ด่วน"
                                                            color="error"
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 700,
                                                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                                                                animation: 'pulse 2s ease-in-out infinite',
                                                                '@keyframes pulse': {
                                                                    '0%, 100%': { opacity: 1 },
                                                                    '50%': { opacity: 0.7 }
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                                                <Building2 size={22} color={theme.palette.text.secondary} />
                                                <Typography variant="h6" fontWeight={500} color="text.primary">
                                                    {data.insp_customer_no || "-"} {data.insp_customer_name || "-"}
                                                </Typography>
                                            </Box>

                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2.5,
                                                            borderRadius: 3,
                                                            bgcolor: alpha(theme.palette.grey[100], 0.5),
                                                            border: `2px solid ${theme.palette.grey[200]}`,
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                transform: 'translateY(-4px)',
                                                                boxShadow: 4
                                                            }
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            fontWeight={600}
                                                            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                                                        >
                                                            ประเภทมอเตอร์:
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                                                            {data?.trp_motor_name || data?.insp_motor_name || '-'}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                    <Paper
                                                        elevation={0}
                                                        sx={{
                                                            p: 2.5,
                                                            borderRadius: 3,
                                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                                            border: '2px solid',
                                                            borderColor: alpha(theme.palette.primary.main, 0.3),
                                                            transition: 'all 0.3s ease',
                                                            '&:hover': {
                                                                transform: 'translateY(-4px)',
                                                                boxShadow: 4
                                                            }
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color="primary"
                                                            fontWeight={600}
                                                            sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                                                        >
                                                            Sale Quote:
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight={600} color="primary.main" sx={{ mt: 0.5 }}>
                                                            {data.insp_sale_quote || "-"}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        {/* Right Side - Form Number Input */}
                                        {/* Right Side - Form Number Input */}
                                        <Grid size={{ xs: 12, lg: 4 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 2.5,
                                                    p: 3,
                                                    borderRadius: 3,
                                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                                    border: '2px solid',
                                                    borderColor: alpha(theme.palette.primary.main, 0.2),
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                                    <Box
                                                        sx={{
                                                            p: 1,
                                                            borderRadius: 2,
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <FileText size={18} color="white" />
                                                    </Box>
                                                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                                        จำนวนงาน
                                                    </Typography>
                                                </Box>

                                                {/* แสดง TextField และปุ่มตามสถานะ */}
                                                {isEditing ? (
                                                    <>
                                                        <TextField
                                                            variant="outlined"
                                                            fullWidth
                                                            type="number"
                                                            value={formNumber}
                                                            onChange={(e) => setFormNumber(e.target.value)}
                                                            inputProps={{ min: 1 }}
                                                            placeholder="กรอกจำนวนงาน"
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 2,
                                                                    bgcolor: 'white',
                                                                    '&:hover fieldset': {
                                                                        borderColor: theme.palette.primary.main,
                                                                    },
                                                                },
                                                            }}
                                                        />

                                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                                            <Button
                                                                variant="contained"
                                                                fullWidth
                                                                startIcon={<Save />}
                                                                onClick={handleSaveFormNumber}
                                                                disabled={isSaving || !formNumber}
                                                                sx={{
                                                                    borderRadius: 2,
                                                                    py: 1.2,
                                                                    fontWeight: 600,
                                                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                                                    '&:hover': {
                                                                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                                                                    }
                                                                }}
                                                            >
                                                                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
                                                            </Button>

                                                            {formNumber && (
                                                                <Button
                                                                    variant="outlined"
                                                                    onClick={() => setIsEditing(false)}
                                                                    disabled={isSaving}
                                                                    sx={{
                                                                        borderRadius: 2,
                                                                        py: 1.2,
                                                                        minWidth: 'auto',
                                                                        px: 2,
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    ยกเลิก
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Box
                                                            sx={{
                                                                p: 3,
                                                                borderRadius: 2,
                                                                bgcolor: 'white',
                                                                border: '2px solid',
                                                                borderColor: theme.palette.grey[200],
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            <Typography variant="h3" fontWeight={700} color="primary.main">
                                                                {formNumber || 0}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                                งาน
                                                            </Typography>
                                                        </Box>

                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            startIcon={<Pencil />}
                                                            onClick={() => setIsEditing(true)}
                                                            sx={{
                                                                borderRadius: 2,
                                                                py: 1.2,
                                                                fontWeight: 600,
                                                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                                                '&:hover': {
                                                                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                                                                }
                                                            }}
                                                        >
                                                            แก้ไข
                                                        </Button>
                                                    </>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grow>

                        {/* Forms List */}
                        {formsList.length > 0 ? (
                            <Grow in timeout={1000}>
                                <Card
                                    sx={{
                                        borderRadius: 4,
                                        overflow: 'hidden',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            p: 3,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                                color="white"
                                                sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                                            >
                                                <FileText size={28} />
                                                รายการงาน ({formsList.length} รายการ)
                                            </Typography>
                                            {loadingStatus ? (
                                                <CircularProgress size={24} sx={{ color: 'white' }} />
                                            ) : (
                                                <Chip
                                                    label={`สร้างแล้ว ${createdFormsCount}/${formsList.length}`}
                                                    sx={{
                                                        bgcolor: 'rgba(255,255,255,0.2)',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        backdropFilter: 'blur(10px)'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Box>

                                    <List sx={{ p: 0 }}>
                                        {formsList.map((formIndex, index) => {
                                            const status = formsStatus[formIndex] || { created: false, tagNo: null, count: 0 };

                                            return (
                                                <Grow in timeout={(index + 1) * 100} key={formIndex}>
                                                    <ListItem
                                                        disablePadding
                                                        sx={{
                                                            borderBottom: index !== formsList.length - 1 ? '1px solid' : 'none',
                                                            borderColor: 'grey.200',
                                                        }}
                                                    >
                                                        <ListItemButton
                                                            onClick={() => handleFormClick(formIndex)}
                                                            sx={{
                                                                py: 2.5,
                                                                px: 3,
                                                                transition: 'all 0.3s ease',
                                                                bgcolor: status.created ? alpha(theme.palette.success.main, 0.02) : 'transparent',
                                                                '&:hover': {
                                                                    bgcolor: status.created
                                                                        ? alpha(theme.palette.success.main, 0.1)
                                                                        : alpha(theme.palette.primary.main, 0.08),
                                                                    transform: 'translateX(8px)',
                                                                    '& .form-number': {
                                                                        background: status.created
                                                                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                        color: 'white',
                                                                    },
                                                                    '& .chevron-icon': {
                                                                        transform: 'translateX(4px)',
                                                                        color: status.created ? 'success.main' : 'primary.main',
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <ListItemIcon>
                                                                <Box
                                                                    className="form-number"
                                                                    sx={{
                                                                        width: 48,
                                                                        height: 48,
                                                                        borderRadius: 2,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontWeight: 700,
                                                                        fontSize: '1.1rem',
                                                                        bgcolor: status.created
                                                                            ? alpha(theme.palette.success.main, 0.1)
                                                                            : alpha(theme.palette.primary.main, 0.1),
                                                                        color: status.created ? 'success.main' : 'primary.main',
                                                                        border: '2px solid',
                                                                        borderColor: status.created
                                                                            ? alpha(theme.palette.success.main, 0.3)
                                                                            : alpha(theme.palette.primary.main, 0.2),
                                                                        transition: 'all 0.3s ease',
                                                                    }}
                                                                >
                                                                    {formIndex}
                                                                </Box>
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                        <Typography variant="h6" fontWeight={600}>
                                                                            งานที่ {formIndex}
                                                                        </Typography>
                                                                        {status.created && (
                                                                            <CheckCircle2
                                                                                size={20}
                                                                                color={theme.palette.success.main}
                                                                            />
                                                                        )}
                                                                    </Box>
                                                                }
                                                                secondary={
                                                                    <Box component="span"> {/* ⭐ เปลี่ยนจาก div เป็น span */}
                                                                        <Typography
                                                                            variant="body2"
                                                                            color="text.secondary"
                                                                            component="span" // ⭐ เพิ่ม component="span"
                                                                        >
                                                                            Jobsheet: {id}-{formIndex}
                                                                        </Typography>
                                                                        {status.created && status.tagNo && (
                                                                            <Box
                                                                                component="span" // ⭐ เปลี่ยนเป็น span
                                                                                sx={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: 0.5,
                                                                                    mt: 0.5
                                                                                }}
                                                                            >
                                                                                <Tag size={14} color={theme.palette.success.main} />
                                                                                <Typography
                                                                                    variant="caption"
                                                                                    color="success.main"
                                                                                    fontWeight={600}
                                                                                    component="span" // ⭐ เพิ่ม component="span"
                                                                                >
                                                                                    Tag: {status.tagNo}
                                                                                </Typography>
                                                                                {status.count > 1 && (
                                                                                    <Chip
                                                                                        label={`+${status.count - 1}`}
                                                                                        size="small"
                                                                                        color="success"
                                                                                        sx={{
                                                                                            height: 18,
                                                                                            fontSize: '0.7rem',
                                                                                            ml: 0.5
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </Box>
                                                                        )}
                                                                    </Box>
                                                                }
                                                            />
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Chip
                                                                    size="small"
                                                                    label={status.created ? 'สร้างแล้ว' : 'รอสร้าง'}
                                                                    color={status.created ? 'success' : 'default'}
                                                                    icon={status.created ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                                                                    sx={{ fontWeight: 600 }}
                                                                />
                                                                <ChevronRight
                                                                    className="chevron-icon"
                                                                    size={24}
                                                                    style={{
                                                                        transition: 'all 0.3s ease',
                                                                        color: theme.palette.text.secondary
                                                                    }}
                                                                />
                                                            </Box>
                                                        </ListItemButton>
                                                    </ListItem>
                                                </Grow>
                                            );
                                        })}
                                    </List>
                                </Card>
                            </Grow>
                        ) : (
                            <Grow in timeout={1000}>
                                <Paper
                                    sx={{
                                        p: 6,
                                        borderRadius: 4,
                                        textAlign: 'center',
                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                        border: '2px dashed',
                                        borderColor: 'grey.300',
                                    }}
                                >
                                    <FileText size={64} color={theme.palette.grey[400]} style={{ marginBottom: 16 }} />
                                    <Typography variant="h6" color="text.secondary" fontWeight={600}>
                                        กรุณาระบุจำนวนฟอร์มเพื่อแสดงรายการ
                                    </Typography>
                                </Paper>
                            </Grow>
                        )}
                    </Box>
                </Fade>
            </Container>

            <Box sx={{ pb: 6 }} />
        </Box>
    );
}