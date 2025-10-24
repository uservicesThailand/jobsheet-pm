import * as React from 'react';
import {
    Drawer, List, ListItemButton, ListItemText, Collapse, Divider,
    AppBar, Box, Toolbar, IconButton, Typography,
    Menu, Container, Avatar, Button, Tooltip, MenuItem
} from '@mui/material';
import { Menu as MenuIcon } from 'lucide-react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pages = ['Tags', 'Scan', 'Report', 'Setting'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];
const scanItems = [
    "Scan tag เปิดงานซ่อม",
    "Scan Report (รับงาน)",
    "Scan QA (รับงาน)",
    "Scan ME (รับงาน)",
    "Scan MC2 (รับงาน)",
    "Scan PLA (รับงาน)",
    "Scan Rewind (รับงาน)",
    "Scan Balance (รับงาน)",
    "Scan Oven (รับงาน)",
    "Scan Color (รับงาน)",
    "Scan Machine (รับงาน)",
    "Scan CS (รับงาน)",
    "Scan Mgr QA (รับงาน)",
    "Scan Mgr ME (รับงาน)"
];
const tagItems = [
    "PROJECT START",
    "TAG LIST",
    "TAG LIST Report",
    "TAG LIST QA",
    "TAG LIST ME",
    "TAG LIST MC2",
    "TAG LIST PLA",
    "TAG LIST CS",
    "TAG LIST Rewind",
    "TAG LIST Balance",
    "TAG LIST Oven",
    "TAG LIST Color",
    "TAG LIST Machine",
    "Job Approved QA",
    "Job Approved ME",
    "TAG LIST STORE"
];


function ResponsiveAppBar() {
    const navigate = useNavigate();

    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [anchorElScan, setAnchorElScan] = React.useState(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);
    const [scanExpanded, setScanExpanded] = React.useState(false);
    const [anchorElTag, setAnchorElTag] = React.useState(null);
    const [tagExpanded, setTagExpanded] = React.useState(false);

    const handleOpenTagMenu = (event) => {
        setAnchorElTag(event.currentTarget);
    };

    const handleCloseTagMenu = () => {
        setAnchorElTag(null);
    };


    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleOpenScanMenu = (event) => {
        setAnchorElScan(event.currentTarget);
    };
    const handleCloseScanMenu = () => {
        setAnchorElScan(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('branch');
        navigate('/');
        handleCloseUserMenu();
    };

    return (
        <AppBar
            position="sticky"
            sx={{
                backgroundColor: 'white',
                boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)',
                zIndex: 1100,
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters>

                    {/* Logo - Desktop */}
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="#"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontWeight: 700,
                            letterSpacing: '.2rem',
                            textDecoration: 'none',
                        }}
                    >
                        <img src="/img/U-LOGO.png" alt="Logo" style={{ height: 40 }} />
                    </Typography>
                    {/* Mobile Menu - Drawer Style */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            onClick={() => setMobileDrawerOpen(true)}
                            sx={{ color: '#001F3F' }}
                        >
                            <MenuIcon size={24} />
                        </IconButton>
                        <Drawer
                            anchor="left"
                            open={mobileDrawerOpen}
                            onClose={() => setMobileDrawerOpen(false)}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    px: 2,
                                    py: 2,
                                    backgroundColor: '#f5f5f5',
                                    borderBottom: '1px solid #ccc',
                                }}
                            >
                                <img src="/img/U-LOGO.png" alt="Logo" style={{ height: 32 }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                    MENU
                                </Typography>
                            </Box>

                            <Box sx={{ width: 250 }} role="presentation">
                                <List>
                                    {/* Expandable Tag menu */}
                                    <ListItemButton onClick={() => setTagExpanded(!tagExpanded)}>
                                        <ListItemText primary="Tags" />
                                        {tagExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </ListItemButton>
                                    <Collapse in={tagExpanded} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {tagItems.map((item) => (
                                                <ListItemButton
                                                    key={item}
                                                    sx={{ pl: 4 }}
                                                    onClick={() => setMobileDrawerOpen(false)}
                                                >
                                                    <ListItemText primary={item} />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>

                                    <ListItemButton onClick={() => setMobileDrawerOpen(false)}>
                                        <ListItemText primary="Report" />
                                    </ListItemButton>
                                    <ListItemButton onClick={() => setMobileDrawerOpen(false)}>
                                        <ListItemText primary="Setting" />
                                    </ListItemButton>

                                    <ListItemButton onClick={() => setScanExpanded(!scanExpanded)}>
                                        <ListItemText primary="Scan" />
                                        {scanExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </ListItemButton>
                                    <Collapse in={scanExpanded} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {scanItems.map((item) => (
                                                <ListItemButton
                                                    key={item}
                                                    sx={{ pl: 4 }}
                                                    onClick={() => setMobileDrawerOpen(false)}
                                                >
                                                    <ListItemText primary={item} />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>
                                </List>
                                <Divider />
                            </Box>
                        </Drawer>
                    </Box>

                    {/* Logo - Mobile */}
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontWeight: 700,
                            letterSpacing: '.2rem',
                            textDecoration: 'none',
                        }}
                    >
                        <img src="/img/U-LOGO.png" alt="Logo" style={{ height: 40 }} />
                    </Typography>

                    {/* Desktop Nav */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) =>
                            page === 'Tags' ? (
                                <React.Fragment key={page}>
                                    <Button
                                        onClick={handleOpenTagMenu}
                                        sx={{
                                            my: 2,
                                            color: 'text.primary',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5,
                                            '&:hover': { backgroundColor: '#c0d3e4' },
                                        }}
                                    >
                                        {page}
                                        {Boolean(anchorElTag) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </Button>
                                    <Menu
                                        anchorEl={anchorElTag}
                                        open={Boolean(anchorElTag)}
                                        onClose={handleCloseTagMenu}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                    >
                                        {tagItems.map((item) => (
                                            <MenuItem key={item} onClick={handleCloseTagMenu}>
                                                <Typography textAlign="left">{item}</Typography>
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </React.Fragment>
                            ) : page === 'Scan' ? (
                                <React.Fragment key={page}>
                                    <Button
                                        onClick={handleOpenScanMenu}
                                        sx={{
                                            my: 2,
                                            color: 'text.primary',
                                            fontWeight: 500,
                                            '&:hover': { backgroundColor: '#c0d3e4' },
                                        }}
                                    >
                                        {page}
                                    </Button>
                                    <Menu
                                        anchorEl={anchorElScan}
                                        open={Boolean(anchorElScan)}
                                        onClose={handleCloseScanMenu}
                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                    >
                                        {scanItems.map((item) => (
                                            <MenuItem key={item} onClick={handleCloseScanMenu}>
                                                <Typography textAlign="left">{item}</Typography>
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </React.Fragment>
                            ) : (
                                <Button
                                    key={page}
                                    onClick={handleCloseNavMenu}
                                    sx={{
                                        my: 2,
                                        color: 'text.primary',
                                        fontWeight: 500,
                                        '&:hover': { backgroundColor: '#c0d3e4' },
                                    }}
                                >
                                    {page}
                                </Button>
                            )
                        )}
                    </Box>

                    {/* Avatar Section */}
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <Box
                                onClick={handleOpenUserMenu}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    gap: 1,
                                }}
                            >
                                <Avatar alt="Pimlapas Y." sx={{ width: 40, height: 40 }} />
                                <Box>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 600, color: 'text.primary' }}
                                    >
                                        Pimlapas Y.
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 300, color: 'text.secondary' }}
                                    >
                                        UBK
                                    </Typography>
                                </Box>
                            </Box>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-user"
                            anchorEl={anchorElUser}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem
                                    key={setting}
                                    onClick={() => setting === 'Logout' ? handleLogout() : handleCloseUserMenu()}
                                >
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default ResponsiveAppBar;
