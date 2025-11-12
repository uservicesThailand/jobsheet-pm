import * as React from 'react';
import {
    Drawer, List, ListItemButton, ListItemText, Collapse, Divider,
    AppBar, Box, Toolbar, IconButton, Typography,
    Container, Avatar, Tooltip, MenuItem, Button
} from '@mui/material';
import { LogOut, Menu as MenuIcon, CalendarCheck, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingMechanic from './LoadingBackdrop';

// ธีมสีบริษัท - Orange & Navy Blue
const theme = {
    primary: {
        main: '#FF6B35',
        light: '#FF8C61',
        lighter: '#FFE5DC',
        dark: '#E55A2B',
    },
    secondary: {
        main: '#1A3A52',
        light: '#2E5371',
        lighter: '#E8EEF2',
        dark: '#0F2838',
    },
    accent: {
        orange: '#FFA726',
        blue: '#3A5A7A',
    },
    neutral: {
        bg: '#F8FAFB',
        border: '#E0E7ED',
    }
};

function ResponsiveAppBar() {
    const navigate = useNavigate();

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
            await fetch(`${import.meta.env.VITE_API_HOST}/api/logout`, {
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
        <Box
            sx={{
                width: 300,
                height: '100%',
                bgcolor: theme.neutral.bg,
            }}
            role="presentation"
            onKeyDown={(e) => e.key === 'Escape' && setDrawerOpen(false)}
        >
            {/* ส่วนหัวใน Drawer */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 2.5,
                    background: `linear-gradient(135deg, ${theme.secondary.main} 0%, ${theme.secondary.light} 100%)`,
                    boxShadow: '0 4px 12px rgba(26, 58, 82, 0.15)',
                }}
            >
                <Avatar
                    alt={userName}
                    src={
                        sessionStorage.getItem('usvt_photo')
                            ? `${import.meta.env.VITE_API_HOST}/img/${sessionStorage.getItem('usvt_photo')}`
                            : '/logo2.png'
                    }
                    sx={{
                        width: 48,
                        height: 48,
                        border: `3px solid ${theme.primary.main}`,
                        boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
                    }}
                />
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white' }}>
                        {userName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.primary.lighter }}>
                        {userBranch}
                    </Typography>
                </Box>
            </Box>
            <Divider sx={{ borderColor: theme.neutral.border }} />

            {/* เมนูเร็ว */}
            <List sx={{ px: 1, py: 1.5 }}>
                <ListItemButton
                    onClick={() => { navigate('/fullCalendar'); setDrawerOpen(false); }}
                    sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: theme.primary.lighter,
                            color: theme.primary.dark,
                        }
                    }}
                >
                    <CalendarCheck size={20} color={theme.primary.main} style={{ marginRight: 12 }} />
                    <ListItemText
                        primary={('ตารางงาน')}
                        primaryTypographyProps={{ fontWeight: 500 }}
                    />
                </ListItemButton>
                <ListItemButton
                    onClick={() => { navigate('/profile-setting'); setDrawerOpen(false); }}
                    sx={{
                        borderRadius: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: theme.primary.lighter,
                            color: theme.primary.dark,
                        }
                    }}
                >
                    <Avatar sx={{ width: 20, height: 20, mr: 1.5 }} />
                    <ListItemText
                        primary={('ตั้งค่าโปรไฟล์')}
                        primaryTypographyProps={{ fontWeight: 500 }}
                    />
                </ListItemButton>
            </List>


            {/* เมนูหมวด Scan */}
            {/*    <List sx={{ px: 1 }}>
                <ListItemButton
                    onClick={() => setScanOpen(v => !v)}
                    sx={{
                        borderRadius: 2,
                        bgcolor: scanOpen ? theme.secondary.lighter : 'transparent',
                        '&:hover': {
                            bgcolor: theme.secondary.lighter,
                        }
                    }}
                >
                    {scanOpen
                        ? <ChevronDown size={20} color={theme.secondary.main} style={{ marginRight: 12 }} />
                        : <ChevronRight size={20} color={theme.secondary.main} style={{ marginRight: 12 }} />
                    }
                    <ListItemText
                        primary="เมนู Scan"
                        primaryTypographyProps={{
                            fontWeight: 600,
                            color: theme.secondary.main
                        }}
                    />
                </ListItemButton>
                <Collapse in={scanOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {scanItems.map((text, idx) => (
                            <ListItemButton
                                key={text}
                                sx={{
                                    pl: 5,
                                    borderRadius: 2,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: theme.primary.lighter,
                                        transform: 'translateX(4px)',
                                    }
                                }}
                                onClick={() => {
                                    console.log('goto scan item:', idx, text);
                                    setDrawerOpen(false);
                                }}
                            >
                                <ListItemText
                                    primary={text}
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        color: theme.secondary.light,
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>
            </List> */}

            {/* เมนูหมวด Tag */}
            {/*      <List sx={{ px: 1 }}>
                <ListItemButton
                    onClick={() => setTagOpen(v => !v)}
                    sx={{
                        borderRadius: 2,
                        bgcolor: tagOpen ? theme.secondary.lighter : 'transparent',
                        '&:hover': {
                            bgcolor: theme.secondary.lighter,
                        }
                    }}
                >
                    {tagOpen
                        ? <ChevronDown size={20} color={theme.secondary.main} style={{ marginRight: 12 }} />
                        : <ChevronRight size={20} color={theme.secondary.main} style={{ marginRight: 12 }} />
                    }
                    <ListItemText
                        primary="เมนู Tag"
                        primaryTypographyProps={{
                            fontWeight: 600,
                            color: theme.secondary.main
                        }}
                    />
                </ListItemButton>
                <Collapse in={tagOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {tagItems.map((text, idx) => (
                            <ListItemButton
                                key={text}
                                sx={{
                                    pl: 5,
                                    borderRadius: 2,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: theme.primary.lighter,
                                        transform: 'translateX(4px)',
                                    }
                                }}
                                onClick={() => {
                                    console.log('goto tag item:', idx, text);
                                    setDrawerOpen(false);
                                }}
                            >
                                <ListItemText
                                    primary={text}
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        color: theme.secondary.light,
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>
            </List> */}

            <Divider sx={{ my: 1.5, borderColor: theme.neutral.border }} />

            {/* ปุ่มออกระบบใน Drawer */}
            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    variant="contained"
                    startIcon={<LogOut size={18} />}
                    onClick={handleLogout}
                    sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        bgcolor: theme.primary.main,
                        color: 'white',
                        fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
                        '&:hover': {
                            bgcolor: theme.primary.dark,
                            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
                        }
                    }}
                >
                    {('ออกระบบ')}
                </Button>
            </Box>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                sx={{
                    bgcolor: 'white', // เปลี่ยนเป็นสีขาว
                    boxShadow: '0px 4px 12px rgba(26, 58, 82, 0.15)',
                    borderBottom: `3px solid ${theme.primary.main}`, // เพิ่มขอบส้มด้านล่าง
                    zIndex: 1100,
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ width: '100%', gap: 1 }}>
                        {/* Hamburger */}
                        <IconButton
                            edge="start"
                            onClick={toggleDrawer(true)}
                            sx={{
                                display: { xs: 'inline-flex', md: 'none' },
                                mr: 1,
                                color: theme.secondary.main, // เปลี่ยนเป็นสีกรม
                                '&:hover': {
                                    bgcolor: theme.primary.lighter,
                                }
                            }}
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
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                }
                            }}
                        >
                            <img src="/img/U-LOGO.png" alt="Logo" style={{ height: 40 }} />
                        </Box>


                        <Box sx={{ flexGrow: 1 }} />

                        {/* Desktop Menu */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
                            <Tooltip title="ดูโปรไฟล์" arrow>
                                <Box
                                    onClick={() => navigate('/profile-setting')}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        gap: 1.5,
                                        px: 1.5,
                                        py: 1,
                                        borderRadius: 2,
                                        border: `1px solid ${theme.neutral.border}`,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: theme.primary.lighter,
                                            borderColor: theme.primary.main,
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.15)',
                                        },
                                    }}
                                >
                                    <Avatar
                                        alt={userName}
                                        src={
                                            sessionStorage.getItem('usvt_photo')
                                                ? `${import.meta.env.VITE_API_HOST}/img/${sessionStorage.getItem('usvt_photo')}`
                                                : '/logo2.png'
                                        }
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            border: `2px solid ${theme.primary.main}`,
                                        }}
                                    />
                                    <Box sx={{ display: { md: 'block', lg: 'block' } }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.secondary.main }}>
                                            {userName}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 400, color: theme.secondary.light }}>
                                            {userBranch}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Tooltip>

                            <Tooltip title="ดูรายการที่ต้องทำ" arrow>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/fullCalendar')}
                                    startIcon={<CalendarCheck size={18} />}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        borderColor: theme.secondary.main,
                                        color: theme.secondary.main,
                                        fontWeight: 500,
                                        '&:hover': {
                                            bgcolor: theme.secondary.lighter,
                                            borderColor: theme.secondary.main,
                                        }
                                    }}
                                >
                                    {('ตารางงาน')}
                                </Button>
                            </Tooltip>

                            <Button
                                variant="contained"
                                onClick={handleLogout}
                                startIcon={<LogOut size={18} />}
                                sx={{
                                    ml: 1,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    bgcolor: theme.primary.main,
                                    color: 'white',
                                    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
                                    '&:hover': {
                                        bgcolor: theme.primary.dark,
                                        boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
                                    }
                                }}
                            >
                                {('ออกระบบ')}
                            </Button>
                        </Box>

                        {/* Mobile Menu */}
                        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, ml: 'auto' }}>
                            <Tooltip title="ดูรายการที่ต้องทำ" arrow>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/fullCalendar')}
                                    startIcon={<CalendarCheck size={18} />}
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        borderColor: theme.secondary.main,
                                        color: theme.secondary.main,
                                        fontWeight: 500,
                                        '&:hover': {
                                            bgcolor: theme.secondary.lighter,
                                            borderColor: theme.secondary.main,
                                        }
                                    }}
                                >
                                    {('ตารางงาน')}
                                </Button>
                            </Tooltip>
                            <Tooltip title={('ดูโปรไฟล์')} arrow>
                                <IconButton
                                    onClick={() => navigate('/profile-setting')}
                                    sx={{
                                        '&:hover': {
                                            bgcolor: theme.primary.lighter,
                                        }
                                    }}
                                >
                                    <Avatar
                                        alt={userName}
                                        src={
                                            sessionStorage.getItem('usvt_photo')
                                                ? `${import.meta.env.VITE_API_HOST}/img/${sessionStorage.getItem('usvt_photo')}`
                                                : '/logo2.png'
                                        }
                                        sx={{
                                            width: 34,
                                            height: 34,
                                            border: `2px solid ${theme.primary.main}`,
                                        }}
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
                ModalProps={{ keepMounted: true }}
                sx={{
                    '& .MuiDrawer-paper': {
                        boxShadow: '4px 0 20px rgba(26, 58, 82, 0.15)',
                    }
                }}
            >
                {DrawerContent}
            </Drawer>
        </>
    );
}

export default ResponsiveAppBar;