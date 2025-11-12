//components/ProfileSetting.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Avatar, IconButton, Stack,
    Button, Paper, InputAdornment, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Camera, User, Phone, Mail, MessageSquareText, Languages } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function ProfileSetting() {
    const userId = sessionStorage.getItem('usvt_user_key') || 'unknow';

    const [profileImage, setProfileImage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        u_email: '',
        u_tel: '',
        lineId: '',
        user_photo: '',
        user_language: 'en',
    });

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_HOST}/api/user/${userId}`)
            .then(res => {
                const data = res.data;
                setFormData({
                    name: data.name || '',
                    lastname: data.lastname || '',
                    u_email: data.u_email || '',
                    u_tel: data.u_tel || '',
                    lineId: data.line_id || '',
                    user_photo: data.user_photo || '',
                    user_language: data.user_language || 'en',
                });
                if (data.user_photo) {
                    setProfileImage(`${import.meta.env.VITE_API_HOST}/img/${data.user_photo}`);
                } else {
                    setProfileImage(`/logo2.png`);
                }
            })
            .catch(err => console.error('โหลดข้อมูลล้มเหลว', err));
    }, []);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);
        setProfileImage(imageUrl);

        const formDataImage = new FormData();
        formDataImage.append('image', file);

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_HOST}/api/upload-profile-image/${userId}`,
                formDataImage,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            const { fileName } = res.data;

            // อัปเดตชื่อไฟล์ใน formData
            setFormData(prev => ({ ...prev, user_photo: fileName }));
        } catch (err) {
            console.error('Upload failed:', err);
            Swal.fire({
                icon: 'error',
                title: 'อัปโหลดรูปภาพไม่สำเร็จ',
                text: 'กรุณาลองใหม่ภายหลัง',
            });
        }
    };



    const handleInputChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleSubmit = () => {
        axios.put(`${import.meta.env.VITE_API_HOST}/api/user/${userId}`, formData)
            .then(() => {

                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                });
            })
            .catch(err => {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถบันทึกข้อมูลได้',
                });
            });
    };


    return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {("PROFILE SETTING")}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={profileImage}
                            sx={{ width: 96, height: 96, mx: 'auto' }}
                        />
                        <IconButton
                            component="label"
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                bgcolor: '#fff',
                                border: '1px solid #ccc',
                                '&:hover': { bgcolor: '#f0f0f0' },
                            }}
                        >
                            <Camera size={20} />
                            <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                        </IconButton>
                    </Box>
                </Box>

                <Stack spacing={2}>
                    <Stack spacing={2}>
                        {/* ชื่อ-นามสกุล */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label={("NAME")}
                                value={formData.name}
                                onChange={handleInputChange('name')}
                                sx={{ flex: 1 }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <User size={18} />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />


                            <TextField
                                label={("LASTNAME")}
                                value={formData.lastname}
                                onChange={handleInputChange('lastname')}
                                sx={{ flex: 1 }}
                            />
                        </Box>

                        <TextField
                            label={("EMAIL")}
                            value={formData.u_email}
                            onChange={handleInputChange('u_email')}
                            fullWidth
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Mail size={18} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            label={("PHONE")}
                            value={formData.u_tel}
                            onChange={handleInputChange('u_tel')}
                            fullWidth
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Phone size={18} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <TextField
                            label={("LINE ID")}
                            value={formData.lineId}
                            onChange={handleInputChange('lineId')}
                            fullWidth
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MessageSquareText size={18} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        {/* ช่องเลือกภาษา */}

                        {/* <FormControl fullWidth>
                            <InputLabel id="language-label">
                                {("profile.userLanguage")}
                            </InputLabel>
                            <Select
                                labelId="language-label"
                                label={("profile.userLanguage")}
                                value={formData.user_language}
                                onChange={handleInputChange('user_language')}
                            >
                                <MenuItem value="" disabled>เลือก</MenuItem>
                                <MenuItem value="th">ไทย</MenuItem>
                                <MenuItem value="en">English</MenuItem>
                            </Select>
                        </FormControl> */}
                    </Stack>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleSubmit}
                        sx={{
                            mt: 3,
                            background: 'linear-gradient(to right, #fb8c00, #ffa726)',
                            color: '#fff',
                            fontWeight: 'bold',
                            '&:hover': {
                                background: 'linear-gradient(to right, #f57c00, #ffb74d)',
                            },
                        }}
                    >
                        {("SAVE")}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}
