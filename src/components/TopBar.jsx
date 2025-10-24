import * as React from 'react';
import {
    Drawer, List, ListItemButton, ListItemText, Collapse, Divider,
    AppBar, Box, Toolbar, IconButton, Typography,
    Container, Avatar, Tooltip, MenuItem, Button
} from '@mui/material';
import { LogOut, Menu as MenuIcon, CalendarCheck, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingMechanic from './LoadingBackdrop';

// หน้าเมนูหลัก (เดสก์ท็อปจะใช้ในอนาคตได้)
const pages = ['Tags', 'Scan', 'Report', 'Setting', 'Onsite'];

const scanItems = [
    "Scan tag เปิดงานซ่อม", "Scan Report (รับงาน)", "Scan QA (รับงาน)",
    "Scan ME (รับงาน)", "Scan MC2 (รับงาน)", "Scan PLA (รับงาน)",
    "Scan Rewind (รับงาน)", "Scan Balance (รับงาน)", "Scan Oven (รับงาน)",
    "Scan Color (รับงาน)", "Scan Machine (รับงาน)", "Scan CS (รับงาน)",
    "Scan Mgr QA (รับงาน)", "Scan Mgr ME (รับงาน)"
];

const tagItems = [
    "PROJECT START", "TAG LIST", "TAG LIST Report", "TAG LIST QA", "TAG LIST ME",
    "TAG LIST MC2", "TAG LIST PLA", "TAG LIST CS", "TAG LIST Rewind",
    "TAG LIST Balance", "TAG LIST Oven", "TAG LIST Color", "TAG LIST Machine",
    "Job Approved QA", "Job Approved ME", "TAG LIST STORE"
];
const apiHost = import.meta.env.VITE_API_HOST;

function ResponsiveAppBar() {
    const [loggingOut, setLoggingOut] = React.useState(false);
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [scanOpen, setScanOpen] = React.useState(false);
    const [tagOpen, setTagOpen] = React.useState(false);

    const userName = sessionStorage.getItem('usvt_name') || 'Guest';
    const userBranch = sessionStorage.getItem('usvt_branch') || 'Unknown';
    const userKey = sessionStorage.getItem('usvt_user_key');

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch(`${apiHost}/api/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_key: userKey }),
            });
        } catch (err) {
            console.error('Logout API error:', err);
        }
        await new Promise(res => setTimeout(res, 500));
        sessionStorage.clear();
        window.location.href = '/';
    };

    const toggleDrawer = (open) => () => setDrawerOpen(open);

    const DrawerContent = (
        <Box sx={{ width: 300 }} role="presentation" onKeyDown={(e) => e.key === 'Escape' && setDrawerOpen(false)}>
            {/* ส่วนหัวใน Drawer */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2 }}>
                <Avatar
                    alt={userName}
                    src={
                        sessionStorage.getItem('usvt_photo')
                            ? `${import.meta.env.VITE_API_HOST}/img/${sessionStorage.getItem('usvt_photo')}`
                            : '/logo2.png'
                    }
                    sx={{ width: 44, height: 44 }}
                />
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{userName}</Typography>
                    <Typography variant="body2" color="text.secondary">{userBranch}</Typography>
                </Box>
            </Box>
            <Divider />

            {/* เมนูเร็ว */}
            {/* <List>
                <ListItemButton onClick={() => { navigate('/fullCalendar'); setDrawerOpen(false); }}>
                    <CalendarCheck size={18} style={{ marginRight: 12 }} />
                    <ListItemText primary={('calendar')} />
                </ListItemButton>
                <ListItemButton onClick={() => { navigate('/profile-setting'); setDrawerOpen(false); }}>
                    <Avatar sx={{ width: 18, height: 18, mr: 1.5 }} />
                    <ListItemText primary={('common.profile')} />
                </ListItemButton>
            </List> */}

            {/* <Divider sx={{ my: 1 }} /> */}

            {/* เมนูหมวด Scan */}
            {/*  <List>
                <ListItemButton onClick={() => setScanOpen(v => !v)}>
                    {scanOpen ? <ChevronDown size={18} style={{ marginRight: 12 }} /> : <ChevronRight size={18} style={{ marginRight: 12 }} />}
                    <ListItemText primary="เมนู Scan" />
                </ListItemButton>
                <Collapse in={scanOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {scanItems.map((text, idx) => (
                            <ListItemButton
                                key={text}
                                sx={{ pl: 5 }}
                                onClick={() => {
                                    // TODO: ปรับเส้นทางให้ตรงกับระบบของคุณ
                                    // ตัวอย่าง: navigate(`/scan/${idx}`);
                                    console.log('goto scan item:', idx, text);
                                    setDrawerOpen(false);
                                }}
                            >
                                <ListItemText primary={text} />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>
            </List> */}

            {/* เมนูหมวด Tag */}
            {/*  <List>
                <ListItemButton onClick={() => setTagOpen(v => !v)}>
                    {tagOpen ? <ChevronDown size={18} style={{ marginRight: 12 }} /> : <ChevronRight size={18} style={{ marginRight: 12 }} />}
                    <ListItemText primary="เมนู Tag" />
                </ListItemButton>
                <Collapse in={tagOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {tagItems.map((text, idx) => (
                            <ListItemButton
                                key={text}
                                sx={{ pl: 5 }}
                                onClick={() => {
                                    // TODO: ปรับเส้นทางให้ตรงกับระบบของคุณ
                                    // ตัวอย่าง: navigate(`/tags/${idx}`);
                                    console.log('goto tag item:', idx, text);
                                    setDrawerOpen(false);
                                }}
                            >
                                <ListItemText primary={text} />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>
            </List> */}

            {/*  <Divider sx={{ my: 1 }} /> */}

            {/* ปุ่มออกระบบใน Drawer (สำหรับมือถือ) */}
            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    startIcon={<LogOut size={18} />}
                    onClick={handleLogout}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    {('logout')}
                </Button>
            </Box>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    backgroundColor: 'white',
                    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)',
                    zIndex: 1100,
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ width: '100%', gap: 1 }}>
                        {/* Hamburger: แสดงเฉพาะมือถือ */}
                        <IconButton
                            edge="start"
                            onClick={toggleDrawer(true)}
                            sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 1 }}
                            aria-label="open menu"
                        >
                            <MenuIcon size={22} />
                        </IconButton>

                        {/* โลโก้ */}
                        <Box
                            onClick={() => navigate('/')}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                mr: 2,
                            }}
                        >
                            <img src="/img/U-LOGO.png" alt="Logo" style={{ height: 36 }} />
                        </Box>

                        {/* กล่องกลางดันขวา */}
                        <Box sx={{ flexGrow: 1 }} />

                        {/* โปรไฟล์ + ปุ่มต่างๆ: เดสก์ท็อปแสดงเต็ม, มือถือซ่อน (ไปอยู่ใน Drawer) */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                            <Tooltip title="ดูโปรไฟล์">
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        gap: 1,
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 2,
                                        '&:hover': { backgroundColor: '#f0f0f0' },
                                    }}
                                >
                                    <Avatar
                                        alt={userName}
                                        src={
                                            sessionStorage.getItem('usvt_photo')
                                                ? `${import.meta.env.VITE_API_HOST}/img/${sessionStorage.getItem('usvt_photo')}`
                                                : '/logo2.png'
                                        }
                                        sx={{ width: 40, height: 40 }}
                                    />
                                    <Box sx={{ display: { lg: 'block', md: 'none' } }} />
                                    <Box sx={{ display: { md: 'block', lg: 'block' } }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            {userName}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 300, color: 'text.secondary' }}>
                                            {userBranch}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Tooltip>

                            {/* <Tooltip title="ดูรายการที่ต้องทำ">
                                <Button
                                    variant="outlined"
                                    color="info"
                                    onClick={() => navigate('/fullCalendar')}
                                    startIcon={<CalendarCheck size={18} />}
                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                >
                                    {('calendar')}
                                </Button>
                            </Tooltip>
 */}
                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={handleLogout}
                                startIcon={<LogOut size={18} />}
                                sx={{ ml: 1, textTransform: 'none', fontWeight: 500, borderRadius: 2 }}
                            >
                                {('logout')}
                            </Button>
                        </Box>

                        {/* มุมขวา: มือถือแสดงเฉพาะไอคอนแจ้งเตือน + อวาตาร์เล็ก */}
                        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, ml: 'auto' }}>

                            <Tooltip title={('common.profile')}>
                                <IconButton onClick={() => navigate('/profile-setting')}>
                                    <Avatar
                                        alt={userName}
                                        src={
                                            sessionStorage.getItem('usvt_photo')
                                                ? `${import.meta.env.VITE_API_HOST}/img/${sessionStorage.getItem('usvt_photo')}`
                                                : '/logo2.png'
                                        }
                                        sx={{ width: 32, height: 32 }}
                                    />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Toolbar>
                </Container>
                <LoadingMechanic open={loggingOut} message="กำลังออกจากระบบ..." />
            </AppBar>

            {/* Drawer สำหรับมือถือ */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                ModalProps={{ keepMounted: true }} // ช่วยเรื่อง performance บนมือถือ
            >
                {DrawerContent}
            </Drawer>
        </>
    );
}

export default ResponsiveAppBar;
