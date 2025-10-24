import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    CircularProgress,
    Stack,
    Card,
    CardContent,
    IconButton,
    Divider,
    Button,
} from '@mui/material';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import NotificationFollowButton from '../components/NotificationFollowButton';

export default function FollowedNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(10); // หรือ 10 ตามต้องการ
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const apiHost = import.meta.env.VITE_API_HOST;
    const userKey = sessionStorage.getItem('usvt_user_key');
    const navigate = useNavigate();

    const fetchNotifications = async (pageNumber = 1) => {
        try {
            const res = await axios.get(`${apiHost}/api/notifications/list/${userKey}`, {
                params: { page: pageNumber, limit },
            });
            setNotifications(res.data.data || []);
            setTotalCount(res.data.total || 0);
            setTotalPages(res.data.totalPages || 1);
            setPage(pageNumber);
        } catch (err) {
            console.error('❌ Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userKey) return;
        fetchNotifications(1);
    }, [userKey]);

    return (
        <Box sx={{ px: { xs: 2, sm: 4 }, pt: 2, pb: 3 }}>
            {/* ✅ Header Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => navigate('/')} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={600}>
                    ย้อนกลับ
                </Typography>
            </Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        แจ้งเตือนที่ติดตาม
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        รายการอัปเดตจากงานที่คุณกำลังติดตาม
                    </Typography>
                </Box>
            </Stack>
            {totalCount > 0 && (
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="body2" color="text.secondary">
                        รวม {totalCount} รายการ • หน้า {page} / {totalPages}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            disabled={page <= 1}
                            onClick={() => fetchNotifications(page - 1)}
                        >
                            ก่อนหน้า
                        </Button>
                        <Button
                            size="small"
                            disabled={page >= totalPages}
                            onClick={() => fetchNotifications(page + 1)}
                        >
                            ถัดไป
                        </Button>
                    </Stack>
                </Box>
            )}
            {/* ✅ Loading / Empty / List */}
            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : notifications.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" mt={4}>
                    ยังไม่มีแจ้งเตือนจากงานที่คุณติดตาม
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {notifications.map((item, index) => (
                        <Card
                            key={index}
                            variant="outlined"
                            sx={{
                                '&:hover': { boxShadow: 3 },
                                borderRadius: 3,
                                p: 1,
                            }}
                        >
                            <CardContent sx={{ px: 2, py: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Stack direction="row" spacing={2}>
                                        <NotificationImportantIcon color="primary" />
                                        <Box>
                                            <Typography fontWeight={600}
                                                onClick={() => navigate(`/inspection/${item.insp_no}?from=NoticFollow`)}
                                                variant="subtitle1"
                                                color="primary"
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                งาน: {item.insp_service_order}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                ลูกค้า: {item.insp_customer_name}
                                            </Typography>
                                            <Typography variant="caption" color="secondary">
                                                ติดตามเมื่อ:  {dayjs(item.followed_at).format('DD/MM/YYYY HH:mm')}
                                            </Typography><br />
                                            <Typography variant="caption" color="text.secondary">
                                                อัปเดตเมื่อ: {dayjs(item.inspection_updated_at).format('DD/MM/YYYY HH:mm')}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Box onClick={(e) => e.stopPropagation()}>
                                        <NotificationFollowButton
                                            insp_id={item.insp_id}
                                            insp_no={item.insp_no}
                                            user_key={userKey}
                                        />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
