// src/pages/AdminUserManager.jsx
import React from 'react';
import {
    Box, Typography, Avatar, Chip, IconButton, Tooltip, Button,
    TextField, Switch, Stack, FormControl, InputLabel,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
    Tabs, Tab, TablePagination, InputAdornment
} from '@mui/material';
import { Eye, EyeOff, RectangleEllipsis, RefreshCw, Plus, KeyRound, Trash2, UserRound, User, Code, Pen, UserLock, Shield, Mail, List, UserRoundPlus, Search } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/th';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

dayjs.extend(relativeTime);
dayjs.locale('th');

const API = import.meta.env.VITE_API_HOST;
const ROLE_OPTIONS = ['member', 'admin', 'developer'];
const safeRole = (v) => (ROLE_OPTIONS.includes(v) ? v : 'member');
const roleLabel = (r) => (r === 'developer' ? 'Developer' : r === 'admin' ? 'Admin' : 'Member');

// ป้องกัน out-of-range สำหรับ branch
const BRANCHES = ['UBK', 'URY', 'USB', 'UCB', 'UPB', 'UMC', 'USR', 'UKK'];

// ─────────────────────────────────────────────────────────────────────────────
// แยก Table Rows ออกมาเพื่อ memo ลด re-render
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
                    <Stack direction="row" justifyContent="center" p={2}><CircularProgress size={24} /></Stack>
                </TableCell>
            </TableRow>
        );
    }

    if (paged.length === 0) {
        return (
            <TableRow>
                <TableCell colSpan={12}>
                    <Box p={2} textAlign="center" color="secondary">ไม่มีข้อมูล</Box>
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
                    <TableRow key={u.user_key} hover>
                        <TableCell>
                            <Avatar src={photoUrl(u)} alt={u.username} sx={{ width: 36, height: 36 }} />
                        </TableCell>
                        <TableCell>{u.username}</TableCell>
                        <TableCell>{`${u.name || ''} ${u.lastname || ''}`.trim() || '-'}</TableCell>
                        <TableCell>{u.branch_log || '-'}</TableCell>
                        <TableCell>{u.u_email || '-'}</TableCell>

                        <TableCell align="center">
                            {online ? (
                                <Chip label="ออนไลน์" color="success" size="small" />
                            ) : (
                                <Chip label="ออฟไลน์" color="default" size="small" />
                            )}
                        </TableCell>

                        <TableCell>
                            {u.u_last_login ? (
                                <Tooltip title={loginStr}><span>{loginStr}</span></Tooltip>
                            ) : '-'}
                        </TableCell>
                        <TableCell>{lastSeenText(u.u_last_login)}</TableCell>

                        <TableCell align="center">
                            <FormControl variant="standard" disabled={role === 'developer'} size="small" sx={{ minWidth: 150 }}>
                                <Select
                                    labelId={`role-${u.user_key}`}
                                    value={role}
                                    onChange={(e) => changeRole(u, e.target.value)}
                                    renderValue={renderRoleValue}
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
                                    {/* ใส่ developer กลับมาแต่ disabled เพื่อกัน out-of-range */}
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
                                <Switch color="warning" checked={!!u.user_status} onChange={() => toggleStatus(u)} />
                            )}
                        </TableCell>

                        <TableCell align="right">
                            <Tooltip title="เปลี่ยนรหัสผ่าน">
                                <IconButton onClick={() => openChangePassword(u)} size="small">
                                    <KeyRound size={18} />
                                </IconButton>
                            </Tooltip>
                            {role !== 'developer' && (
                                <Tooltip title="ลบผู้ใช้">
                                    <IconButton color="error" onClick={() => deleteUser(u)} size="small">
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
// วางไว้เหนือ component หลัก
function genNextUsername(branch, users) {
    const listInBranch = users.filter(u => (u.branch_log || '') === branch);
    // ตัวเลขเริ่มจากจำนวนในสาขา + 1
    let n = listInBranch.length + 1;

    // กันชนซ้ำแบบง่าย: ถ้ามีอยู่แล้ว ให้ขยับเลขไปเรื่อยๆ
    const existing = new Set(users.map(u => String(u.username || '').toUpperCase()));
    let candidate = '';
    do {
        candidate = `${branch}${String(n).padStart(3, '0')}`; // USB001, USB002, ...
        n += 1;
    } while (existing.has(candidate.toUpperCase()));

    return candidate;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminUserManager() {
    const nav = useNavigate();
    const [showPwd, setShowPwd] = React.useState(false);

    // session
    const myRole = sessionStorage.getItem('usvt_role') || '';
    const myKey = sessionStorage.getItem('usvt_user_key') || '';
    const canSee = myRole === 'admin' || myRole === 'developer';
    React.useEffect(() => { if (!canSee) nav('/'); }, [canSee, nav]);

    const [loading, setLoading] = React.useState(false);
    const [rows, setRows] = React.useState([]);

    // ค้นหา: แยก inputQ ออกจาก q จริง
    const [q, setQ] = React.useState('');
    const [inputQ, setInputQ] = React.useState('');

    // filter & pagination
    const [statusTab, setStatusTab] = React.useState(-1); // -1 ทั้งหมด, 1 active, 0 inactive
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(20);

    // dialogs
    const [openAdd, setOpenAdd] = React.useState(false);
    const [openPwd, setOpenPwd] = React.useState(false);
    const [pwdTarget, setPwdTarget] = React.useState(null);

    // add form
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

    // ใน AdminUserManager() เพิ่ม useEffect นี้
    React.useEffect(() => {
        // ทำเฉพาะตอนเปิด dialog เพิ่มผู้ใช้ และมีการเลือกสาขาถูกต้อง
        if (!openAdd) return;
        const b = f.branch_log;
        if (!BRANCHES.includes(b)) return;

        // ถ้า username ยังว่าง หรือยังเป็นของสาขาอื่น ให้ gen ใหม่
        const current = (f.username || '').toUpperCase();
        const shouldGen =
            current === '' || !current.startsWith(b.toUpperCase());

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
            setPage(0); // รีเซ็ตหน้าเมื่อโหลดใหม่
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [q, myKey]);

    React.useEffect(() => { if (canSee) fetchUsers(); }, [canSee, fetchUsers]);

    // กดค้นหา/โหลดใหม่ค่อยใช้ q จริง
    const applySearch = React.useCallback(() => {
        setQ(inputQ);
        fetchUsers(inputQ);
    }, [inputQ, fetchUsers]);

    const photoUrl = (u) => (u.user_photo ? `${API}/img/${u.user_photo}` : '/logo2.png');

    // === utilities ===
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
        // validate ฝั่งหน้า (ตัวอย่าง: required และยาวรหัสผ่าน)
        if (!f.name || !f.username || !f.password) {
            // ปิด dialog ชั่วคราว เพื่อให้ Swal ไม่โดนทับ
            setOpenAdd(false);
            await Promise.resolve();           // 1 tick ให้ dialog ปิดจริง
            document.activeElement?.blur();    // กันโฟกัสย้อน

            await Swal.fire({
                title: 'ผิดพลาด',
                text: 'กรุณากรอก Name, Username, Password',
                icon: 'warning',
                returnFocus: false,
            });

            // เปิด dialog กลับมาอีกครั้ง ให้ผู้ใช้แก้ต่อ (state f ยังอยู่)
            setOpenAdd(true);
            return;
        }

        try {
            const res = await fetch(`${API}/api/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Key': myKey,
                    'user_key': myKey, // กันชื่อ header
                },
                body: JSON.stringify(f),
            });

            let data = null;
            try { data = await res.json(); } catch { }

            if (!res.ok) {
                const msg = data?.error || data?.message || `เพิ่มผู้ใช้ไม่สำเร็จ (HTTP ${res.status})`;

                // ปิด dialog ชั่วคราว → Swal → เปิดกลับมา
                setOpenAdd(false);
                await Promise.resolve();
                document.activeElement?.blur();

                await Swal.fire({
                    title: 'ผิดพลาด',
                    text: msg,
                    icon: 'error',
                    returnFocus: false,
                });

                setOpenAdd(true);   // เด้ง modal อีกครั้ง
                return;
            }

            // === success ===
            setOpenAdd(false);     // คราวนี้ปิดจริง
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
            });

        } catch (e) {
            // network/exception
            setOpenAdd(false);
            await Promise.resolve();
            document.activeElement?.blur();

            await Swal.fire({
                title: 'ผิดพลาด',
                text: e.message,
                icon: 'error',
                returnFocus: false,
            });

            setOpenAdd(true); // ให้แก้ต่อได้
        }
    };

    const openChangePassword = (user) => { setPwdTarget(user); setOpenPwd(true); };

    const [newPwd, setNewPwd] = React.useState('');
    const onChangePassword = async () => {
        if (!pwdTarget) return;
        if (!newPwd || newPwd.length < 6) {
            alert('รหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร');
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
        } catch (e) { console.error(e); }
    };

    const deleteUser = async (user) => {
        if (!window.confirm(`ลบผู้ใช้ ${user.username}?`)) return;
        try {
            await fetch(`${API}/api/admin/users/${user.user_key}`, {
                method: 'DELETE',
                headers: { 'X-User-Key': myKey }
            });
            setRows(prev => prev.filter(r => r.user_key !== user.user_key));
        } catch (e) { console.error(e); }
    };

    // ===== filter =====
    const filtered = React.useMemo(() => {
        let out = rows;
        if (statusTab !== -1) {
            out = out.filter(r => Number(r.user_status) === statusTab);
        }
        return out;
    }, [rows, statusTab]);

    // รีเซ็ตหน้าเมื่อเปลี่ยนแท็บหรือแถวต่อหน้า
    React.useEffect(() => { setPage(0); }, [statusTab, rowsPerPage]);

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, pt: 3 }}>
                <IconButton onClick={() => nav(-1)} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={600}>
                    ย้อนกลับ
                </Typography>
            </Box>
            <Box p={4}>
                <Stack direction="column" fullWidth mb={2}>
                    <Typography variant="h6"><UserLock /> User Management</Typography>
                    <Stack spacing={1} mt={3}>
                        <TextField
                            slotProps={
                                {
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search size={18} />
                                            </InputAdornment>
                                        ),
                                    }
                                }
                            }
                            size="small"
                            label="ค้นหา (username / name / lastname / email / branch)"
                            value={inputQ}
                            onChange={(e) => setInputQ(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); }}
                            fullWidth
                        />
                        <Box display="flex" gap={2}>
                            <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={applySearch}>
                                โหลดใหม่
                            </Button>
                            <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setOpenAdd(true)}>
                                เพิ่มผู้ใช้
                            </Button>
                        </Box>
                    </Stack>
                </Stack>
                {/* Tabs: ทั้งหมด / เปิดใช้งาน / ปิดใช้งาน */}
                <Paper variant="outlined" sx={{ mb: 1 }}>
                    <Tabs
                        value={statusTab}
                        onChange={(e, v) => setStatusTab(v)}
                        aria-label="filter by status"
                        variant="scrollable"
                    >
                        <Tab value={-1} label={`ทั้งหมด (${rows.length})`} />
                        <Tab value={1} label={`เปิดใช้งาน (${rows.filter(r => Number(r.user_status) === 1).length})`} />
                        <Tab value={0} label={`ปิดใช้งาน (${rows.filter(r => Number(r.user_status) === 0).length})`} />
                    </Tabs>
                </Paper>

                <Paper variant="outlined">
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>รูป</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>ชื่อ - นามสกุล</TableCell>
                                    <TableCell>Branch</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell align="center">สถานะ</TableCell>
                                    <TableCell>เข้าใช้ล่าสุด</TableCell>
                                    <TableCell>เมื่อ</TableCell>
                                    <TableCell align="center">Set Role</TableCell>
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

                    {/* Pagination */}
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
                    />
                </Paper>

                {/* Add User Dialog */}
                <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
                    <DialogTitle><UserRoundPlus /> เพิ่มผู้ใช้ใหม่</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} mt={1}>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <User size={18} />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                    fullWidth label="ชื่อ" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                                <TextField
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                    fullWidth label="นามสกุล" value={f.lastname} onChange={(e) => setF({ ...f, lastname: e.target.value })} />
                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <UserLock size={18} />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                    helperText={BRANCHES.includes(f.branch_log)
                                        ? 'ระบบจะสร้างอัตโนมัติเมื่อเลือกสาขา (แก้ไขได้)'
                                        : 'โปรดเลือกสาขาก่อน ระบบจะสร้างค่าเริ่มต้นให้'}
                                    fullWidth label="Username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />
                                <TextField
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <RectangleEllipsis size={18} />
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
                                        },
                                    }}
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
                                                : <span style={{ color: 'green' }}>รหัสผ่านใช้งานได้</span>
                                    }
                                />


                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="role-new">Role</InputLabel>
                                    <Select
                                        labelId="role-new"
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
                                    <InputLabel id="active-new">สถานะ</InputLabel>
                                    <Select
                                        labelId="active-new"
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
                                {/* Email */}
                                <TextField
                                    slotProps={
                                        {
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Mail size={18} />
                                                    </InputAdornment>
                                                ),
                                            }
                                        }
                                    }
                                    fullWidth
                                    label="Email"
                                    value={f.u_email}
                                    onChange={(e) => setF({ ...f, u_email: e.target.value })}
                                />

                                {/* Branch Select */}
                                <FormControl fullWidth>
                                    <InputLabel>กรุณาเลือกสาขา</InputLabel>
                                    <Select
                                        value={BRANCHES.includes(f.branch_log) ? f.branch_log : ''}
                                        label="กรุณาเลือกสาขา"
                                        onChange={(e) => setF({ ...f, branch_log: e.target.value })}
                                    >
                                        <MenuItem value="" disabled>---- กรุณาเลือกสาขา ----</MenuItem>
                                        {BRANCHES.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Typography variant="caption" color="secondary">
                                * รูปภาพ (photo) มีฟีเจอร์ให้ผู้ใช้อัปโหลดเองในภายหลัง
                            </Typography>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAdd(false)}>ยกเลิก</Button>
                        <Button variant="contained" onClick={onAddSubmit}>บันทึก</Button>
                    </DialogActions>
                </Dialog>

                {/* Change Password Dialog */}
                <Dialog open={openPwd} onClose={() => setOpenPwd(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>เปลี่ยนรหัสผ่าน {pwdTarget ? `(${pwdTarget.username})` : ''}</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            type="password"
                            label="รหัสผ่านใหม่ (>= 6 ตัวอักษร)"
                            value={newPwd}
                            onChange={(e) => setNewPwd(e.target.value)}
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenPwd(false)}>ยกเลิก</Button>
                        <Button variant="contained" onClick={onChangePassword}>บันทึก</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </>
    );
}
