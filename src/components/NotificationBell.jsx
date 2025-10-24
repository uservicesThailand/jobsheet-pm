// src/components/NotificationBell.jsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Stack,
    Divider,
    Box,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const API_HOST = import.meta.env.VITE_API_HOST;

export default function NotificationBell({ userKey }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const socketRef = useRef(null);

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    // helper: upsert กันซ้ำตาม insp_id
    const upsertNotification = (list, item) => {
        const map = new Map(list.map(n => [n.insp_id, n]));
        map.set(item.insp_id, item); // แทนค่าถ้ามีอยู่แล้ว
        // เรียงใหม่ตาม inspection_updated_at ล่าสุดมาก่อน
        return Array.from(map.values()).sort((a, b) => {
            const ta = new Date(a.inspection_updated_at || 0).getTime();
            const tb = new Date(b.inspection_updated_at || 0).getTime();
            return tb - ta;
        });
    };

    useEffect(() => {
        if (!userKey) return;

        // -------- 1) ตั้ง socket โดยส่ง auth.userKey เพื่อ auto-join ที่ฝั่ง server
        const s = io(API_HOST, {
            transports: ['websocket', 'polling'],
            auth: { userKey },           // <<< สำคัญ: server จะจับไป join room ให้เอง
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            path: '/socket.io',          // เผื่อ reverse proxy กำหนด path
        });
        socketRef.current = s;

        s.on('connect', () => {
            // ไม่ต้อง emit('join') แล้ว
            // console.log('[socket] connected', s.id);
        });

        s.on('connect_error', (err) => {
            console.warn('[socket] connect_error:', err?.message || err);
        });

        // -------- 2) โหลดแจ้งเตือนรอบแรก (unread)
        const ac = new AbortController();
        const fetchInitial = async () => {
            try {
                const res = await axios.get(`${API_HOST}/api/notifications/${userKey}`, {
                    signal: ac.signal,
                    // withCredentials: true, // เปิดถ้า backend ต้องการ cookie
                });
                const data = Array.isArray(res.data) ? res.data : [];
                // sort ใหม่กันเคส backend ส่งไม่เรียง
                data.sort((a, b) => new Date(b.inspection_updated_at || 0) - new Date(a.inspection_updated_at || 0));
                setNotifications(data);
            } catch (e) {
                if (e.name !== 'CanceledError') {
                    console.error('Error fetching notifications:', e);
                }
            }
        };
        fetchInitial();

        // -------- 3) รับแจ้งเตือนใหม่แบบ upsert (กันซ้ำ)
        s.on('notification', (data) => {
            setNotifications(prev => upsertNotification(prev, data));
        });

        // -------- cleanup
        return () => {
            ac.abort();
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [userKey]);

    const markAsRead = async (insp_id) => {
        try {
            await axios.post(`${API_HOST}/api/notifications/read`, {
                user_key: userKey,
                insp_id,
            });
            // ลบออกจาก list ฝั่ง client
            setNotifications(prev => prev.filter(n => n.insp_id !== insp_id));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                aria-controls="notification-menu"
                aria-haspopup="true"
            >
                <Badge badgeContent={notifications.length} color="error">
                    <NotificationsIcon sx={{ color: '#0D47A1' }} />
                </Badge>
            </IconButton>

            <Menu
                id="notification-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{ sx: { width: 340, maxHeight: 420 } }}
            >
                {notifications.length === 0 ? (
                    <MenuItem disabled>
                        <Typography variant="body2" color="text.secondary">
                            ไม่มีแจ้งเตือน
                        </Typography>
                    </MenuItem>
                ) : (
                    notifications.map((item, index) => (
                        <Box key={item.insp_id ?? index}>
                            <MenuItem
                                onClick={async () => {
                                    handleClose();
                                    await markAsRead(item.insp_id);
                                    navigate(`/inspection/${item.insp_no}`);
                                }}
                                sx={{ alignItems: 'start' }}
                            >
                                <Stack direction="row" spacing={1}>
                                    <NotificationImportantIcon color="primary" fontSize="small" />
                                    <Stack>
                                        <Typography fontWeight={600}>
                                            งาน: {item.insp_service_order}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                                        >
                                            อัปเดตเมื่อ: {dayjs(item.inspection_updated_at).format('DD/MM/YYYY HH:mm')}
                                            <br />
                                            ลูกค้า : {item.insp_customer_name}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </MenuItem>
                            {index < notifications.length - 1 && <Divider />}
                        </Box>
                    ))
                )}
            </Menu>
        </>
    );
}
