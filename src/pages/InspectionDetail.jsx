import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Box, Typography, Chip, Grid, Accordion, AccordionSummary,
    AccordionDetails, Breadcrumbs, Link, LinearProgress,
    Button, Card, CardContent, Container, Paper, Fade, Grow,
    alpha, useTheme
} from '@mui/material';
import {
    CircleX, CircleCheckBig, ChevronRight, Printer,
    Building2, ScanQrCode, Network, Siren, ArrowLeft, ClipboardType
    , Camera, Cog
} from 'lucide-react';
import * as Forms from "../components/forms/allForms";

// ✅ Helper functions
const getUpdatedAt = (payload) => {
    if (!payload) return null;
    if (payload.updated_at || payload.updatedAt) return payload.updated_at || payload.updatedAt;

    if (Array.isArray(payload)) {
        const found = payload.find(x => x?.updated_at || x?.updatedAt);
        return found?.updated_at || found?.updatedAt || null;
    }

    if (payload.meta?.updated_at || payload.meta?.updatedAt) {
        return payload.meta.updated_at || payload.meta.updatedAt;
    }

    return null;
};

const getCreatedAt = (payload) => {
    if (!payload) return null;
    if (payload.created_at || payload.createdAt) return payload.created_at || payload.createdAt;

    if (Array.isArray(payload)) {
        const found = payload.find(x => x?.created_at || x?.createdAt);
        return found?.created_at || found?.createdAt || null;
    }

    if (payload.meta?.created_at || payload.meta?.createdAt) {
        return payload.meta.created_at || payload.meta.createdAt;
    }

    return null;
};

const getProgressColor = (value) => {
    if (value <= 9) return { color: "error", gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" };
    if (value <= 55) return { color: "warning", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" };
    if (value <= 89) return { color: "info", gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" };
    return { color: "success", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" };
};

// ✅ Modern Circular Progress Component
const CircularWithLabel = ({ value, done, total }) => {
    const theme = useTheme();
    const colors = getProgressColor(value);
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'inline-flex',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
            }}
        >
            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx="60"
                    cy="60"
                    r="40"
                    stroke={theme.palette.grey[200]}
                    strokeWidth="10"
                    fill="none"
                />
                <circle
                    cx="60"
                    cy="60"
                    r="40"
                    stroke={`url(#gradient-${value})`}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 1s ease-out',
                    }}
                />
                <defs>
                    <linearGradient id={`gradient-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={theme.palette[colors.color].light} />
                        <stop offset="100%" stopColor={theme.palette[colors.color].main} />
                    </linearGradient>
                </defs>
            </svg>
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="h4"
                    fontWeight={700}
                    color={`${colors.color}.main`}
                >
                    {value}%
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {done}/{total} งาน
                </Typography>
            </Box>
        </Box>
    );
};

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

export default function InspectionDetail() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fromPage = searchParams.get("from");
    const { id } = useParams();
    const num = searchParams.get("num");

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});
    const [expanded, setExpanded] = useState([]);
    const [navigating, setNavigating] = useState(false);

    const apiHost = import.meta.env.VITE_API_HOST;
    const userKey = sessionStorage.getItem("usvt_user_key") || "0";

    const jobItems = [
        { key: "FormSquirrelCageMotor", title: "Squirrel Cage Motor", emoji: <ClipboardType /> },
        { key: "FormScmImage", title: "SCM Images", emoji: <Camera /> },
    ];

    const formDoneMap = useMemo(() => {
        const map = {};
        Object.entries(formData || {}).forEach(([key, payload]) => {
            map[key] = !!getCreatedAt(payload);
        });
        return map;
    }, [formData]);

    const filteredItems = useMemo(() => {
        if (data && (data.trp_motor_code === "BLANK" ||
            (data.trp_motor_code == null && data.insp_motor_code === "BLANK"))) {
            return jobItems.filter(item => item.key === "FormTestReport");
        }
        return jobItems;
    }, [data]);

    const totalForms = filteredItems.length;
    const doneForms = filteredItems.filter(it => formDoneMap[it.key]).length;
    const percent = totalForms > 0 ? Math.round((doneForms / totalForms) * 100) : 0;

    useEffect(() => {
        setLoading(true);
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000));
        const fetchData = axios.get(`${apiHost}/api/inspectionPM/${id}`);

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

    useEffect(() => {
        const loadAllForms = async () => {
            const newFormData = {};
            await Promise.all(
                filteredItems.map(async ({ key }) => {
                    try {
                        const res = await axios.get(`${apiHost}/api/forms/${key}/${id}-${num}`);
                        newFormData[key] = res.data.data || res.data;
                    } catch {
                        newFormData[key] = null;
                    }
                })
            );
            setFormData(newFormData);
        };

        if (data) {
            loadAllForms();
        }
    }, [data]);

    useEffect(() => {
        if (data && (data.trp_motor_code === "BLANK" ||
            (data.trp_motor_code == null && data.insp_motor_code === "BLANK"))) {
            setExpanded(['FormTestReport']);
        }
    }, [data]);

    const handleAccordionChange = (panelKey) => (event, isExpanded) => {
        setExpanded(prev =>
            isExpanded ? [...prev, panelKey] : prev.filter(key => key !== panelKey)
        );
    };

    const handleNavigate = (path) => {
        setNavigating(true);
        setTimeout(() => {
            navigate(path);
            setNavigating(false);
        }, 300);
    };

    if (loading || !data) {
        return <LoadingScreen />;
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            {/* Modern Header with Gradient */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 0,
                    mb: 4
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Button
                                onClick={() => handleNavigate(-1)}
                                sx={{
                                    minWidth: 'auto',
                                    p: 1.5,
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease'
                                }}
                                color="primary"
                                startIcon={<ArrowLeft size={20} />}
                            >
                                ย้อนกลับ
                            </Button>
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
                                                        Jobsheet ID: {data.insp_no}-{num}
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

                                        {/* Right Side - Progress */}
                                        <Grid size={{ xs: 12, lg: 4 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 3,
                                                    p: 3,
                                                    borderRadius: 3,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                                                }}
                                            >
                                                <CircularWithLabel value={percent} done={doneForms} total={totalForms} />
                                                <Button
                                                    variant="contained"
                                                    startIcon={<Printer size={20} />}
                                                    disabled={percent === 0}
                                                    onClick={() => window.open(`/print/${data.insp_no}-${num}`, '_blank')}
                                                    fullWidth
                                                    sx={{
                                                        py: 1.5,
                                                        borderRadius: 3,
                                                        fontWeight: 600,
                                                        fontSize: '1rem',
                                                        background: percent === 0
                                                            ? theme.palette.grey[300]
                                                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        boxShadow: percent === 0 ? 'none' : '0 8px 24px rgba(102, 126, 234, 0.4)',
                                                        '&:hover': {
                                                            background: percent === 0
                                                                ? theme.palette.grey[300]
                                                                : 'linear-gradient(135deg, #5568d3 0%, #63358d 100%)',
                                                            transform: percent === 0 ? 'none' : 'translateY(-2px)',
                                                            boxShadow: percent === 0 ? 'none' : '0 12px 32px rgba(102, 126, 234, 0.5)'
                                                        },
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    พิมพ์รายงาน
                                                </Button>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grow>

                        {/* Forms List */}
                        <Box>
                            {filteredItems.map(({ key, title, emoji }, index) => {
                                const FormComponent = Forms[key];
                                const isDone = !!formDoneMap[key];

                                return (
                                    <Grow in timeout={(index + 1) * 200} key={key}>
                                        <Accordion
                                            expanded={expanded.includes(key)}
                                            onChange={handleAccordionChange(key)}
                                            sx={{
                                                mb: 2,
                                                borderRadius: 3,
                                                overflow: 'hidden',
                                                border: '2px solid',
                                                borderColor: isDone ? 'success.light' : 'grey.200',
                                                boxShadow: isDone
                                                    ? '0 8px 24px rgba(16, 185, 129, 0.2)'
                                                    : '0 4px 12px rgba(0,0,0,0.05)',
                                                '&:before': { display: 'none' },
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: isDone
                                                        ? '0 12px 32px rgba(16, 185, 129, 0.3)'
                                                        : '0 8px 24px rgba(0,0,0,0.1)'
                                                }
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ChevronRight size={24} />}
                                                sx={{
                                                    py: 2,
                                                    px: 3,
                                                    bgcolor: isDone
                                                        ? alpha(theme.palette.success.main, 0.05)
                                                        : 'grey.50',
                                                    '&:hover': {
                                                        bgcolor: isDone
                                                            ? alpha(theme.palette.success.main, 0.1)
                                                            : 'grey.100'
                                                    },
                                                    '& .MuiAccordionSummary-expandIconWrapper': {
                                                        transition: 'transform 0.3s ease',
                                                        color: isDone ? 'success.main' : 'text.secondary'
                                                    },
                                                    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                                                        transform: 'rotate(90deg)',
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                                    <Box
                                                        sx={{
                                                            width: 48,
                                                            height: 48,
                                                            borderRadius: 2.5,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1.5rem',
                                                            bgcolor: isDone
                                                                ? alpha(theme.palette.success.main, 0.15)
                                                                : alpha(theme.palette.grey[400], 0.15),
                                                            border: '2px solid',
                                                            borderColor: isDone ? 'success.light' : 'grey.300'
                                                        }}
                                                    >
                                                        {emoji}
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight={700}
                                                            color={isDone ? 'success.dark' : 'text.primary'}
                                                        >
                                                            {index + 1}. {title}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        size="medium"
                                                        color={isDone ? 'success' : 'default'}
                                                        label={isDone ? 'สร้างแล้ว' : 'รอดำเนินการ'}
                                                        icon={isDone ? <CircleCheckBig size={16} /> : <CircleX size={16} />}
                                                        sx={{
                                                            fontWeight: 700,
                                                            px: 1.5,
                                                            boxShadow: isDone ? 2 : 0
                                                        }}
                                                    />
                                                </Box>
                                            </AccordionSummary>

                                            <AccordionDetails
                                                sx={{
                                                    bgcolor: 'white',
                                                    p: 4,
                                                    borderTop: '2px solid',
                                                    borderColor: 'grey.100'
                                                }}
                                            >
                                                {FormComponent ? (
                                                    <Box
                                                        sx={{
                                                            p: 3,
                                                            borderRadius: 2,
                                                            bgcolor: alpha(theme.palette.grey[50], 0.5),
                                                            border: '1px solid',
                                                            borderColor: 'grey.200'
                                                        }}
                                                    >
                                                        <FormComponent
                                                            data={formData[key]}
                                                            keyName={key}
                                                            inspNo={id + '-' + num}
                                                            userKey={userKey}
                                                            inspSV={data.insp_service_order}
                                                            customerName={data.insp_customer_name}
                                                            customerNo={data.insp_customer_no}
                                                            date={data.insp_document_date}
                                                            attention={data.insp_attention}
                                                            jobNo={data.insp_sale_quote}
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{
                                                            textAlign: 'center',
                                                            py: 4,
                                                            fontStyle: 'italic'
                                                        }}
                                                    >
                                                        ไม่มีฟอร์ม
                                                    </Typography>
                                                )}
                                            </AccordionDetails>
                                        </Accordion>
                                    </Grow>
                                );
                            })}
                        </Box>
                    </Box>
                </Fade>
            </Container>

            <Box sx={{ pb: 6 }} />
        </Box>
    );
}