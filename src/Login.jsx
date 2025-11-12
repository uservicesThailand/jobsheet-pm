import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Avatar,
    Paper,
    Snackbar,
    Alert,
    Button,
    InputAdornment, IconButton,
} from '@mui/material';
import { Eye, EyeOff, Lock } from 'lucide-react'; // เพิ่ม Eye, EyeOff
import LoadingMechanic from './components/LoadingBackdrop';

const Login = ({ onLogin }) => {
    const apiHost = import.meta.env.VITE_API_HOST;

    if (!apiHost) {
        console.warn("API host is not defined. Please check your .env file.");
    }
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [branch, setBranch] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${apiHost}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, branch }),
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('usvt_name', `${data.name} ${data.lastname}`);
                sessionStorage.setItem('usvt_branch', branch);
                sessionStorage.setItem('usvt_user_key', data.user_key);
                sessionStorage.setItem('usvt_lang', data.user_language);
                sessionStorage.setItem('usvt_photo', data.user_photo || ''); // ✅ บันทึกชื่อไฟล์ภาพ
                sessionStorage.setItem('usvt_role', data.u_role);

                await new Promise(resolve => setTimeout(resolve, 500));
                onLogin(data);
            } else {
                setErrorOpen(true); // <-- เพิ่มตรงนี้
            }

        } catch (err) {
            console.error('Login error:', err);
            setErrorOpen(true);
        } finally {
            // รอให้โหลดอย่างน้อย 1 วินาที
            await new Promise(resolve => setTimeout(resolve, 500));
            setLoading(false);
        }
    };


    return (
        <Container
            maxWidth={false}
            disableGutters
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 3,
                    width: '50vh',
                    maxHeight: '85vh',
                    borderRadius: 4,
                }}
            >
                <Box display="flex" flexDirection="column" alignItems="center">
                    <img
                        src="/img/U-LOGO.png"
                        alt="Logo"
                        width="120"
                        height="auto"
                        style={{ marginBottom: 16 }}
                    />
                    <Avatar sx={{ m: 1, bgcolor: '#ff9800' }}>
                        <Lock size={20} />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        เข้าสู่ระบบงาน PM
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ mt: 2, width: '100%' }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            size="small"
                            label="ชื่อผู้ใช้"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            size="small"
                            label="รหัสผ่าน"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleTogglePassword}
                                            edge="end"
                                            aria-label="toggle password visibility"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <FormControl
                            fullWidth
                            required
                            margin="normal"
                            size="small"
                        >
                            <InputLabel>กรุณาเลือกสาขา</InputLabel>
                            <Select
                                value={branch}
                                label="กรุณาเลือกสาขา"
                                onChange={(e) => setBranch(e.target.value)}
                            >
                                <MenuItem value="" disabled>---- กรุณาเลือกสาขา ----</MenuItem>
                                <MenuItem value="UBK">UBK</MenuItem>
                                <MenuItem value="URY">URY</MenuItem>
                                <MenuItem value="USB">USB</MenuItem>
                                <MenuItem value="UCB">UCB</MenuItem>
                                <MenuItem value="UPB">UPB</MenuItem>
                                <MenuItem value="UMC">UMC</MenuItem>
                                <MenuItem value="USR">USR</MenuItem>
                                <MenuItem value="UKK">UKK</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            loading={loading}
                            size="large"
                            sx={{
                                mt: 2,
                                borderRadius: 8,
                                backgroundColor: "#ff9800",
                                '&:hover': {
                                    backgroundColor: "#fb8c00",
                                },
                            }}
                        >
                            เข้าสู่ระบบ
                        </Button>

                        {/* {loading && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 2, textAlign: 'center' }}
                            >
                                กำลังเข้าระบบ...
                            </Typography>
                        )} */}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        © 2025 JobSheet By MIS TEAM
                    </Typography>
                </Box>
            </Paper>

            {/* Snackbar แจ้งเตือนเมื่อเข้าสู่ระบบผิด */}
            <Snackbar
                open={errorOpen}
                onClose={() => setErrorOpen(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="error" onClose={() => setErrorOpen(false)}>
                    ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
                </Alert>
            </Snackbar>
            {/* โหลดเข้าสู่ระบบแบบ overlay */}
            <LoadingMechanic open={loading} message="กำลังเข้าสู่ระบบ..." />
        </Container>
    );
};

export default Login;
