// src/pages/AdminUserManager.jsx
import React from 'react';
import {
    Box, Typography, Avatar, Chip, IconButton, Tooltip, Button,
    TextField, Switch, Stack, FormControl, InputLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
    Tabs, Tab, TablePagination, InputAdornment, Card
} from '@mui/material';
import { Eye, EyeOff, RectangleEllipsis, RefreshCw, Plus, KeyRound, Trash2, UserRound, User, Code, Pen, UserLock, Shield, Mail, List, UserRoundPlus, Search, ArrowLeft, Users } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

dayjs.extend(relativeTime);
dayjs.locale('th');

const API = import.meta.env.VITE_API_HOST;
const ROLE_OPTIONS = ['member', 'admin', 'developer'];
const safeRole = (v) => (ROLE_OPTIONS.includes(v) ? v : 'member');
const roleLabel = (r) => (r === 'developer' ? 'Developer' : r === 'admin' ? 'Admin' : 'Member');
const BRANCHES = ['UBK', 'URY', 'USB', 'UCB', 'UPB', 'UMC', 'USR', 'UKK'];

const theme = {
    primary: {
        main: '#FF6B35',
        light: '#FF8C61',
        lighter: '#FFF5F2',
        dark: '#E55A2B',
    },
    secondary: {
        main: '#1A3A52',
        light: '#5A7A92',
        lighter: '#F5F7FA',
        dark: '#0F2838',
    },
    success: {
        main: '#10B981',
        lighter: '#D1FAE5',
    },
    neutral: {
        bg: '#FAFBFC',
        border: '#E5E7EB',
        text: '#6B7280',
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper Function
function genNextUsername(branch, users) {
    const listInBranch = users.filter(u => (u.branch_log || '') === branch);
    let n = listInBranch.length + 1;
    const existing = new Set(users.map(u => String(u.username || '').toUpperCase()));
    let candidate = '';
    do {
        candidate = `${branch}${String(n).padStart(3, '0')}`;
        n += 1;
    } while (existing.has(candidate.toUpperCase()));
    return candidate;
}

// ─────────────────────────────────────────────────────────────────────────────
// User Rows Component
const UserRows = React.memo(function UserRows({
    rows, loading, page, rowsPerPage, filtered,
    photoUrl, isOnline, lastSeenText, changeRole, toggleStatus,
    openChangePassword, deleteUser
}) {
    const renderRoleValue = React.useCallback((selected) => (
        <Stack direction="row" alignItems="center" spacing={1}>
            {selected === 'member' && <UserRound size={16} />}
            {selected === 'admin' && <KeyRound size={16} />}
            {selected === 'developer' && <Code size={16} />}
            <span>{selected}</span>
        </Stack>
    ), []);

    const paged = React.useMemo(() => {
        const start = page * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page, rowsPerPage]);

    if (loading) {
        return (
            <TableRow>
                <TableCell colSpan={12}>
                    <Stack direction="row" justifyContent="center" p={4}>
                        <CircularProgress size={32} sx={{ color: theme.primary.main }} />
                    </Stack>
                </TableCell>
            </TableRow>
        );
    }

    if (paged.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={12}>
                    <Box p={4} textAlign="center">
                        <Users size={48} style={{ color: theme.neutral.text, opacity: 0.5 }} />
                        <Typography sx={{ mt: 2, color: theme.neutral.text }}>
                            ไม่มีข้อมูลผู้ใช้
                        </Typography>
                    </Box>
                </TableCell>
            </TableRow>
        );
    }

    return (
        <>
            {paged.map((u) => {
                const online = isOnline(u);
                const loginStr = u.u_last_login ? dayjs(u.u_last_login).format('DD/MM/YYYY HH:mm:ss') : '-';
                const role = safeRole(u.u_role);

                return (
                    <TableRow
                        key={u.user_key}
                        hover
                        sx={{
                            '&:hover': {
                                bgcolor: theme.primary.lighter,
                            }
                        }}
                    >
                        <TableCell>
                            <Avatar
                                src={photoUrl(u)}
                                alt={u.username}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    border: `2px solid ${theme.primary.lighter}`,
                                }}
                            />
                        </TableCell>
                        <TableCell>
                            <Typography sx={{ fontWeight: 600, color: theme.secondary.main }}>
                                {u.username}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography sx={{ color: theme.secondary.main }}>
                                {`${u.name || ''} ${u.lastname || ''}`.trim() || '-'}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Chip
                                label={u.branch_log || '-'}
                                size="small"
                                sx={{
                                    bgcolor: theme.secondary.lighter,
                                    color: theme.secondary.main,
                                    fontWeight: 600,
                                }}
                            />
                        </TableCell>
                        <TableCell>
                            <Typography sx={{ color: theme.neutral.text, fontSize: '0.9rem' }}>
                                {u.u_email || '-'}
                            </Typography>
                        </TableCell>

                        <TableCell align="center">
                            {online ? (
                                <Chip
                                    label="ออนไลน์"
                                    size="small"
                                    sx={{
                                        bgcolor: theme.success.lighter,
                                        color: theme.success.main,
                                        fontWeight: 600,
                                    }}
                                />
                            ) : (
                                <Chip
                                    label="ออฟไลน์"
                                    size="small"
                                    sx={{
                                        bgcolor: theme.neutral.border,
                                        color: theme.neutral.text,
                                        fontWeight: 600,
                                    }}
                                />
                            )}
                        </TableCell>

                        <TableCell>
                            <Typography sx={{ fontSize: '0.85rem', color: theme.neutral.text }}>
                                {u.u_last_login ? loginStr : '-'}
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography sx={{ fontSize: '0.85rem', color: theme.neutral.text }}>
                                {lastSeenText(u.u_last_login)}
                            </Typography>
                        </TableCell>

                        <TableCell align="center">
                            <FormControl
                                variant="standard"
                                disabled={role === 'developer'}
                                size="small"
                                sx={{ minWidth: 150 }}
                            >
                                <Select
                                    labelId={`role-${u.user_key}`}
                                    value={role}
                                    onChange={(e) => changeRole(u, e.target.value)}
                                    renderValue={renderRoleValue}
                                    sx={{
                                        color: theme.secondary.main,
                                        fontWeight: 600,
                                    }}
                                >
                                    <MenuItem value="member">
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <UserRound size={16} /> <span>member</span>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="admin">
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <KeyRound size={16} /> <span>admin</span>
                                        </Stack>
                                    </MenuItem>
                                    <MenuItem value="developer" disabled>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Code size={16} /> <span>developer</span>
                                        </Stack>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </TableCell>

                        <TableCell align="center">
                            {role !== 'developer' && (
                                <Switch
                                    checked={!!u.user_status}
                                    onChange={() => toggleStatus(u)}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                            color: theme.success.main,
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                            backgroundColor: theme.success.main,
                                        },
                                    }}
                                />
                            )}
                        </TableCell>

                        <TableCell align="right">
                            <Tooltip title="เปลี่ยนรหัสผ่าน">
                                <IconButton
                                    onClick={() => openChangePassword(u)}
                                    size="small"
                                    sx={{
                                        color: theme.primary.main,
                                        '&:hover': {
                                            bgcolor: theme.primary.lighter,
                                        }
                                    }}
                                >
                                    <KeyRound size={18} />
                                </IconButton>
                            </Tooltip>
                            {role !== 'developer' && (
                                <Tooltip title="ลบผู้ใช้">
                                    <IconButton
                                        onClick={() => deleteUser(u)}
                                        size="small"
                                        sx={{
                                            color: '#EF4444',
                                            '&:hover': {
                                                bgcolor: '#FEE2E2',
                                            }
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </TableCell>
                    </TableRow>
                );
            })}
        </>
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
export default function AdminUserManager() {
    const nav = useNavigate();
    const [showPwd, setShowPwd] = React.useState(false);

    const myRole = sessionStorage.getItem('usvt_role') || '';
    const myKey = sessionStorage.getItem('usvt_user_key') || '';
    const canSee = myRole === 'admin' || myRole === 'developer';
    React.useEffect(() => { if (!canSee) nav('/'); }, [canSee, nav]);

    const [loading, setLoading] = React.useState(false);
    const [rows, setRows] = React.useState([]);
    const [q, setQ] = React.useState('');
    const [inputQ, setInputQ] = React.useState('');
    const [statusTab, setStatusTab] = React.useState(-1);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(20);
    const [openAdd, setOpenAdd] = React.useState(false);
    const [openPwd, setOpenPwd] = React.useState(false);
    const [pwdTarget, setPwdTarget] = React.useState(null);
    const [newPwd, setNewPwd] = React.useState('');

    const [f, setF] = React.useState({
        name: '',
        lastname: '',
        username: '',
        password: '',
        user_status: 1,
        u_role: 'member',
        branch_log: '',
        u_email: '',
    });

    React.useEffect(() => {
        if (!openAdd) return;
        const b = f.branch_log;
        if (!BRANCHES.includes(b)) return;

        const current = (f.username || '').toUpperCase();
        const shouldGen = current === '' || !current.startsWith(b.toUpperCase());

        if (shouldGen) {
            const next = genNextUsername(b, rows);
            setF(prev => ({ ...prev, username: next }));
        }
    }, [openAdd, f.branch_log, rows]);

    const fetchUsers = React.useCallback(async (query = q) => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/admin/users?q=${encodeURIComponent(query)}`, {
                headers: { 'X-User-Key': myKey }
            });
            const data = await res.json();
            setRows(Array.isArray(data) ? data : []);
            setPage(0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [q, myKey]);

    React.useEffect(() => { if (canSee) fetchUsers(); }, [canSee, fetchUsers]);

    const applySearch = React.useCallback(() => {
        setQ(inputQ);
        fetchUsers(inputQ);
    }, [inputQ, fetchUsers]);

    const photoUrl = (u) => (u.user_photo ? `${API}/img/${u.user_photo}` : '/logo2.png');

    const lastSeenText = (isoStr) => {
        if (!isoStr) return '-';
        const d = dayjs(isoStr);
        const rel = d.fromNow(true);
        return `${rel} ที่แล้ว`;
    };

    const isOnline = (u) => {
        return !!(u.u_last_login && (!u.u_last_logout || dayjs(u.u_last_login).isAfter(dayjs(u.u_last_logout))));
    };

    const toggleStatus = async (user) => {
        try {
            await fetch(`${API}/api/admin/users/${user.user_key}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-User-Key': myKey },
                body: JSON.stringify({ user_status: user.user_status ? 0 : 1 })
            });
            setRows(prev => prev.map(r => r.user_key === user.user_key ? { ...r, user_status: user.user_status ? 0 : 1 } : r));
        } catch (e) { console.error(e); }
    };

    const changeRole = async (user, newRole) => {
        try {
            await fetch(`${API}/api/admin/users/${user.user_key}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-User-Key': myKey },
                body: JSON.stringify({ u_role: newRole })
            });
            setRows(prev => prev.map(r => r.user_key === user.user_key ? { ...r, u_role: newRole } : r));
        } catch (e) { console.error(e); }
    };

    const onAddSubmit = async () => {
        if (!f.name || !f.username || !f.password) {
            setOpenAdd(false);
            await Promise.resolve();
            document.activeElement?.blur();

            await Swal.fire({
                title: 'ผิดพลาด',
                text: 'กรุณากรอก Name, Username, Password',
                icon: 'warning',
                returnFocus: false,
                confirmButtonColor: theme.primary.main,
            });

            setOpenAdd(true);
            return;
        }

        try {
            const res = await fetch(`${API}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Key': myKey,
                    'user_key': myKey,
                },
                body: JSON.stringify(f),
            });

            let data = null;
            try { data = await res.json(); } catch { }

            if (!res.ok) {
                const msg = data?.error || data?.message || `เพิ่มผู้ใช้ไม่สำเร็จ (HTTP ${res.status})`;
                setOpenAdd(false);
                await Promise.resolve();
                document.activeElement?.blur();

                await Swal.fire({
                    title: 'ผิดพลาด',
                    text: msg,
                    icon: 'error',
                    returnFocus: false,
                    confirmButtonColor: theme.primary.main,
                });

                setOpenAdd(true);
                return;
            }

            setOpenAdd(false);
            setF({
                name: '', lastname: '', username: '', password: '',
                user_status: 1, u_role: 'member', branch_log: '', u_email: '',
            });
            fetchUsers(q);

            await Swal.fire({
                title: 'สำเร็จ',
                text: 'เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว',
                icon: 'success',
                returnFocus: false,
                confirmButtonColor: theme.primary.main,
            });

        } catch (e) {
            setOpenAdd(false);
            await Promise.resolve();
            document.activeElement?.blur();

            await Swal.fire({
                title: 'ผิดพลาด',
                text: e.message,
                icon: 'error',
                returnFocus: false,
                confirmButtonColor: theme.primary.main,
            });

            setOpenAdd(true);
        }
    };

    const openChangePassword = (user) => { setPwdTarget(user); setOpenPwd(true); };

    const onChangePassword = async () => {
        if (!pwdTarget) return;
        if (!newPwd || newPwd.length < 6) {
            await Swal.fire({
                title: 'ผิดพลาด',
                text: 'รหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร',
                icon: 'warning',
                confirmButtonColor: theme.primary.main,
            });
            return;
        }
        try {
            await fetch(`${API}/api/admin/users/${pwdTarget.user_key}/password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-User-Key': myKey },
                body: JSON.stringify({ new_password: newPwd })
            });
            setOpenPwd(false);
            setNewPwd('');
            await Swal.fire({
                title: 'สำเร็จ',
                text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonColor: theme.primary.main,
            });
        } catch (e) {
            console.error(e);
            await Swal.fire({
                title: 'ผิดพลาด',
                text: 'ไม่สามารถเปลี่ยนรหัสผ่านได้',
                icon: 'error',
                confirmButtonColor: theme.primary.main,
            });
        }
    };

    const deleteUser = async (user) => {
        const result = await Swal.fire({
            title: 'ยืนยันการลบ',
            text: `คุณต้องการลบผู้ใช้ ${user.username} ใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: theme.neutral.text,
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
        });

        if (!result.isConfirmed) return;

        try {
            await fetch(`${API}/api/admin/users/${user.user_key}`, {
                method: 'DELETE',
                headers: { 'X-User-Key': myKey }
            });
            setRows(prev => prev.filter(r => r.user_key !== user.user_key));
            await Swal.fire({
                title: 'สำเร็จ',
                text: 'ลบผู้ใช้เรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonColor: theme.primary.main,
            });
        } catch (e) {
            console.error(e);
            await Swal.fire({
                title: 'ผิดพลาด',
                text: 'ไม่สามารถลบผู้ใช้ได้',
                icon: 'error',
                confirmButtonColor: theme.primary.main,
            });
        }
    };

    const filtered = React.useMemo(() => {
        let out = rows;
        if (statusTab !== -1) {
            out = out.filter(r => Number(r.user_status) === statusTab);
        }
        return out;
    }, [rows, statusTab]);

    React.useEffect(() => { setPage(0); }, [statusTab, rowsPerPage]);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: theme.neutral.bg,
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 2, sm: 4 },
            }}
        >
            <Box sx={{ maxWidth: 1400, margin: '0 auto' }}>
                {/* Header with Back Button */}
                <Button
                    startIcon={<ArrowLeft size={20} />}
                    onClick={() => nav(-1)}
                    sx={{
                        mb: 3,
                        color: theme.neutral.text,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        '&:hover': {
                            bgcolor: 'transparent',
                            color: theme.primary.main,
                        }
                    }}
                >
                    ย้อนกลับ
                </Button>

                {/* Page Title */}
                <Box sx={{ mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: `${theme.secondary.main}15`,
                                color: theme.secondary.main,
                            }}
                        >
                            <UserLock size={24} />
                        </Box>
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: theme.secondary.main,
                                    fontSize: { xs: '1.5rem', sm: '2rem' },
                                }}
                            >
                                User Management
                            </Typography>
                            <Typography
                                sx={{
                                    color: theme.neutral.text,
                                    fontSize: '0.95rem',
                                }}
                            >
                                จัดการผู้ใช้งานและสิทธิ์การเข้าถึง
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                {/* Search & Actions */}
                <Card
                    sx={{
                        mb: 3,
                        p: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: `1px solid ${theme.neutral.border}`,
                    }}
                >
                    <Stack spacing={2}>
                        <TextField
                            size="small"
                            placeholder="ค้นหา username, name, lastname, email, branch..."
                            value={inputQ}
                            onChange={(e) => setInputQ(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); }}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} style={{ color: theme.neutral.text }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: theme.primary.main,
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: theme.primary.main,
                                    },
                                }
                            }}
                        />
                        <Box display="flex" gap={2}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshCw size={16} />}
                                onClick={applySearch}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    color: theme.secondary.main,
                                    borderColor: theme.neutral.border,
                                    '&:hover': {
                                        borderColor: theme.secondary.main,
                                        bgcolor: theme.secondary.lighter,
                                    }
                                }}
                            >
                                โหลดใหม่
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<Plus size={16} />}
                                onClick={() => setOpenAdd(true)}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    bgcolor: theme.primary.main,
                                    boxShadow: `0 4px 12px ${theme.primary.lighter}`,
                                    '&:hover': {
                                        bgcolor: theme.primary.dark,
                                    }
                                }}
                            >
                                เพิ่มผู้ใช้
                            </Button>
                        </Box>
                    </Stack>
                </Card>

                {/* Tabs */}
                <Paper
                    sx={{
                        mb: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: `1px solid ${theme.neutral.border}`,
                    }}
                >
                    <Tabs
                        value={statusTab}
                        onChange={(e, v) => setStatusTab(v)}
                        variant="scrollable"
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                color: theme.neutral.text,
                                '&.Mui-selected': {
                                    color: theme.primary.main,
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: theme.primary.main,
                                height: 3,
                            }
                        }}
                    >
                        <Tab value={-1} label={`ทั้งหมด (${rows.length})`} />
                        <Tab value={1} label={`เปิดใช้งาน (${rows.filter(r => Number(r.user_status) === 1).length})`} />
                        <Tab value={0} label={`ปิดใช้งาน (${rows.filter(r => Number(r.user_status) === 0).length})`} />
                    </Tabs>
                </Paper>

                {/* Table */}
                <Paper
                    sx={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: `1px solid ${theme.neutral.border}`,
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}
                >
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow
                                    sx={{
                                        bgcolor: theme.secondary.main,
                                        '& .MuiTableCell-head': {
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                        }
                                    }}
                                >
                                    <TableCell>รูป</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>ชื่อ - นามสกุล</TableCell>
                                    <TableCell>Branch</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell align="center">สถานะ</TableCell>
                                    <TableCell>เข้าใช้ล่าสุด</TableCell>
                                    <TableCell>เมื่อ</TableCell>
                                    <TableCell align="center">Role</TableCell>
                                    <TableCell align="center">Active</TableCell>
                                    <TableCell align="right">จัดการ</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                <UserRows
                                    rows={rows}
                                    loading={loading}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    filtered={filtered}
                                    photoUrl={photoUrl}
                                    isOnline={isOnline}
                                    lastSeenText={lastSeenText}
                                    changeRole={changeRole}
                                    toggleStatus={toggleStatus}
                                    openChangePassword={openChangePassword}
                                    deleteUser={deleteUser}
                                />
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={filtered.length}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        labelRowsPerPage="แถวต่อหน้า"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} จาก ${count !== -1 ? count : `มากกว่า ${to}`}`}
                        sx={{
                            borderTop: `1px solid ${theme.neutral.border}`,
                            '& .MuiTablePagination-select': {
                                color: theme.secondary.main,
                            },
                            '& .MuiTablePagination-displayedRows': {
                                color: theme.neutral.text,
                            }
                        }}
                    />
                </Paper>

                {/* Add User Dialog */}
                <Dialog
                    open={openAdd}
                    onClose={() => setOpenAdd(false)}
                    maxWidth="sm"
                >
                    <DialogTitle sx={{
                        fontWeight: 700,
                        color: theme.secondary.main,
                        borderBottom: `1px solid ${theme.neutral.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}>
                        <UserRoundPlus size={24} style={{ color: theme.primary.main }} />
                        เพิ่มผู้ใช้ใหม่
                    </DialogTitle>
                    <DialogContent sx={{ mt: 3 }}>
                        <Stack spacing={2.5} sx={{ mt: 1 }}>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    label="ชื่อ"
                                    value={f.name}
                                    onChange={(e) => setF({ ...f, name: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <User size={18} style={{ color: theme.neutral.text }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="นามสกุล"
                                    value={f.lastname}
                                    onChange={(e) => setF({ ...f, lastname: e.target.value })}
                                />
                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    value={f.username}
                                    onChange={(e) => setF({ ...f, username: e.target.value })}
                                    helperText={BRANCHES.includes(f.branch_log)
                                        ? 'ระบบจะสร้างอัตโนมัติเมื่อเลือกสาขา (แก้ไขได้)'
                                        : 'โปรดเลือกสาขาก่อน ระบบจะสร้างค่าเริ่มต้นให้'}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <UserLock size={18} style={{ color: theme.neutral.text }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    type={showPwd ? 'text' : 'password'}
                                    label="Password"
                                    value={f.password}
                                    onChange={(e) => setF({ ...f, password: e.target.value })}
                                    error={f.password.length > 0 && f.password.length < 6}
                                    helperText={
                                        f.password.length === 0
                                            ? 'รหัสผ่านอย่างน้อย 6 ตัว'
                                            : f.password.length < 6
                                                ? `ขาดอีก ${6 - f.password.length} ตัว`
                                                : <span style={{ color: theme.success.main }}>รหัสผ่านใช้งานได้</span>
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <RectangleEllipsis size={18} style={{ color: theme.neutral.text }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPwd(!showPwd)}
                                                    edge="end"
                                                >
                                                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        label="Role"
                                        value={safeRole(f.u_role)}
                                        onChange={(e) => setF({ ...f, u_role: e.target.value })}
                                    >
                                        <MenuItem value="member">member</MenuItem>
                                        <MenuItem value="admin">admin</MenuItem>
                                        <MenuItem value="developer" disabled>developer</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth size="small">
                                    <InputLabel>สถานะ</InputLabel>
                                    <Select
                                        label="สถานะ"
                                        value={Number(f.user_status)}
                                        onChange={(e) => setF({ ...f, user_status: Number(e.target.value) })}
                                    >
                                        <MenuItem value={1}>เปิดใช้งาน</MenuItem>
                                        <MenuItem value={0}>ปิดใช้งาน</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={f.u_email}
                                    onChange={(e) => setF({ ...f, u_email: e.target.value })}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Mail size={18} style={{ color: theme.neutral.text }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <FormControl fullWidth>
                                    <InputLabel>สาขา</InputLabel>
                                    <Select
                                        value={BRANCHES.includes(f.branch_log) ? f.branch_log : ''}
                                        label="สาขา"
                                        onChange={(e) => setF({ ...f, branch_log: e.target.value })}
                                    >
                                        <MenuItem value="" disabled>---- เลือกสาขา ----</MenuItem>
                                        {BRANCHES.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Stack>
                            <Typography variant="caption" sx={{ color: theme.neutral.text }}>
                                * รูปภาพ (photo) มีฟีเจอร์ให้ผู้ใช้อัปโหลดเองในภายหลัง
                            </Typography>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.neutral.border}` }}>
                        <Button
                            onClick={() => setOpenAdd(false)}
                            sx={{
                                textTransform: 'none',
                                color: theme.neutral.text,
                            }}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            variant="contained"
                            onClick={onAddSubmit}
                            sx={{
                                textTransform: 'none',
                                bgcolor: theme.primary.main,
                                '&:hover': {
                                    bgcolor: theme.primary.dark,
                                }
                            }}
                        >
                            บันทึก
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Change Password Dialog */}
                <Dialog
                    open={openPwd}
                    onClose={() => setOpenPwd(false)}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 2.5,
                        }
                    }}
                >
                    <DialogTitle sx={{
                        fontWeight: 700,
                        color: theme.secondary.main,
                        borderBottom: `1px solid ${theme.neutral.border}`,
                    }}>
                        เปลี่ยนรหัสผ่าน {pwdTarget ? `(${pwdTarget.username})` : ''}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            sx={{ mt: 2 }}
                            fullWidth
                            type="password"
                            label="รหัสผ่านใหม่ (>= 6 ตัวอักษร)"
                            value={newPwd}
                            onChange={(e) => setNewPwd(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <KeyRound size={18} style={{ color: theme.neutral.text }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.neutral.border}` }}>
                        <Button
                            onClick={() => setOpenPwd(false)}
                            sx={{
                                textTransform: 'none',
                                color: theme.neutral.text,
                            }}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            variant="contained"
                            onClick={onChangePassword}
                            sx={{
                                textTransform: 'none',
                                bgcolor: theme.primary.main,
                                '&:hover': {
                                    bgcolor: theme.primary.dark,
                                }
                            }}
                        >
                            บันทึก
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}