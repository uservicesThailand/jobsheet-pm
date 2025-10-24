import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Typography,
    IconButton,
    Alert,
    LinearProgress,
    Chip,
    Stack,
    Paper,
    Container,
    Tabs,
    Tab,
    TextField
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    CheckCircle,
    Image as ImageIcon,
    Save,
    Restore,
    RestoreFromTrash
} from '@mui/icons-material';

const apiHost = import.meta.env.VITE_API_HOST;

const ScmImage = ({ data, inspNo, inspSV, userKey, customerName, customerNo }) => {
    const MAX_IMAGES = 20;

    const [activeTab, setActiveTab] = useState(0);
    const [previewImages, setPreviewImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, index: null });
    const [restoreDialog, setRestoreDialog] = useState({ open: false, image: null });
    const [restoreAllDialog, setRestoreAllDialog] = useState(false);
    // ======= เพิ่ม State ใหม่สำหรับรูปปก (เพิ่มหลังจาก state เดิม) =======
    const [headerImage, setHeaderImage] = useState(null);
    const [headerFile, setHeaderFile] = useState(null);
    const [uploadingHeader, setUploadingHeader] = useState(false);
    const [deleteHeaderDialog, setDeleteHeaderDialog] = useState(false);
    /* Description รูปภาพ */
    const [imageDescriptions, setImageDescriptions] = useState({});
    const [editingDescription, setEditingDescription] = useState({});
    const [savedDescriptions, setSavedDescriptions] = useState({});
    // ======= แก้ไข useEffect เดิม =======
    React.useEffect(() => {
        if (data && Array.isArray(data)) {
            const descriptions = {};
            const saved = {}; // เพิ่มตัวแปรนี้
            const active = [];
            const deleted = [];
            let header = null;

            data.forEach(item => {
                const imageObj = {
                    url: `${apiHost}${item.image_path}`,
                    path: item.image_path,
                    id: item.id,
                    uploaded: true
                };

                if (item.location === 'SCMHeader' && item.del !== 1) {
                    header = imageObj;
                } else if (item.del === 1) {
                    deleted.push(imageObj);
                } else if (item.location === 'SCM') {
                    active.push(imageObj);
                }

                if (item.location === 'SCM' && item.img_description) {
                    descriptions[item.id] = item.img_description;
                    saved[item.id] = true; // เพิ่มบรรทัดนี้
                }
            });

            setPreviewImages(active);
            setDeletedImages(deleted);
            setHeaderImage(header);
            setImageDescriptions(descriptions);
            setSavedDescriptions(saved); // เพิ่มบรรทัดนี้
        }
    }, [data]);
    /* เพิ่มฟังก์ชันจัดการ description (2 ฟังก์ชัน) */
    const handleDescriptionChange = (imageId, value) => {
        setImageDescriptions(prev => ({
            ...prev,
            [imageId]: value
        }));
    };

    const handleSaveDescription = async (imageId) => {
        try {
            const response = await fetch(`${apiHost}/api/update-image-description`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: imageId,
                    description: imageDescriptions[imageId] || ''
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'ไม่สามารถบันทึก description ได้');
            }
            // เพิ่มบรรทัดนี้
            setSavedDescriptions(prev => ({
                ...prev,
                [imageId]: true
            }));
            showAlert('success', 'บันทึก description เรียบร้อยแล้ว');

        } catch (error) {
            console.error('Save description error:', error);
            showAlert('error', error.message || 'เกิดข้อผิดพลาดในการบันทึก description');
        }
    };
    // ======= เพิ่มฟังก์ชันใหม่สำหรับรูปปก (เพิ่มก่อน handleUploadAndSave) =======
    const handleHeaderFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
            showAlert('error', 'รองรับเฉพาะไฟล์ JPEG, PNG, WebP');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showAlert('error', 'ไฟล์ต้องมีขนาดไม่เกิน 10MB');
            return;
        }

        setHeaderFile(file);
        setHeaderImage({
            url: URL.createObjectURL(file),
            uploaded: false
        });
        showAlert('success', 'เลือกรูปปกเรียบร้อยแล้ว');
    };

    const handleUploadHeader = async () => {
        if (!headerFile && !headerImage) {
            showAlert('error', 'กรุณาเลือกรูปปก');
            return;
        }

        if (!headerFile && headerImage?.uploaded) {
            showAlert('info', 'รูปปกถูกบันทึกแล้ว');
            return;
        }

        setUploadingHeader(true);

        try {
            const formData = new FormData();
            formData.append('image', headerFile);
            formData.append('inspNo', inspNo);
            formData.append('inspSV', inspSV);

            const response = await fetch(`${apiHost}/api/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'อัพโหลดล้มเหลว');
            }

            const saveData = {
                inspNo,
                inspSV,
                userKey,
                customerName,
                customerNo,
                imagePaths: [result.data.path],
                location: 'SCMHeader'
            };

            const saveResponse = await fetch(`${apiHost}/api/save-images-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(saveData)
            });

            const saveResult = await saveResponse.json();

            if (saveResult.success) {
                showAlert('success', 'บันทึกรูปปกสำเร็จ!');

                setHeaderImage({
                    url: `${apiHost}${result.data.path}`,
                    path: result.data.path,
                    id: saveResult.data.ids[0],
                    uploaded: true
                });
                setHeaderFile(null);
            } else {
                throw new Error(saveResult.error || 'บันทึกล้มเหลว');
            }

        } catch (error) {
            showAlert('error', 'เกิดข้อผิดพลาด: ' + error.message);
        } finally {
            setUploadingHeader(false);
        }
    };

    const openDeleteHeaderDialog = () => {
        setDeleteHeaderDialog(true);
    };

    const closeDeleteHeaderDialog = () => {
        setDeleteHeaderDialog(false);
    };

    const confirmDeleteHeader = async () => {
        try {
            if (headerImage?.uploaded && headerImage?.id) {
                const response = await fetch(`${apiHost}/api/update-image-location/del`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: headerImage.id })
                });

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.error || 'ไม่สามารถลบไฟล์ได้');
                }
            }

            if (headerImage?.url.startsWith('blob:')) {
                URL.revokeObjectURL(headerImage.url);
            }

            setHeaderImage(null);
            setHeaderFile(null);
            showAlert('success', 'ลบรูปปกเรียบร้อยแล้ว');

        } catch (error) {
            console.error('Delete header error:', error);
            showAlert('error', error.message || 'เกิดข้อผิดพลาดในการลบไฟล์');
        } finally {
            closeDeleteHeaderDialog();
        }
    };

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 4000);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = previewImages.length + files.length;

        if (totalImages > MAX_IMAGES) {
            showAlert('error', `สามารถอัพโหลดได้สูงสุด ${MAX_IMAGES} รูป`);
            return;
        }

        const validFiles = [];
        for (const file of files) {
            if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
                showAlert('error', `${file.name}: รองรับเฉพาะไฟล์ JPEG, PNG, WebP`);
                continue;
            }

            if (file.size > 10 * 1024 * 1024) {
                showAlert('error', `${file.name}: ไฟล์ต้องมีขนาดไม่เกิน 10MB`);
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        const newPreviews = validFiles.map(file => ({
            url: URL.createObjectURL(file),
            file: file,
            uploaded: false
        }));

        setPreviewImages(prev => [...prev, ...newPreviews]);
        setSelectedFiles(prev => [...prev, ...validFiles]);
        showAlert('success', `เลือกไฟล์ ${validFiles.length} รูป`);
    };

    const handleRemoveImage = (index) => {
        const image = previewImages[index];

        if (!image.uploaded && image.url.startsWith('blob:')) {
            URL.revokeObjectURL(image.url);
        }

        setPreviewImages(prev => prev.filter((_, i) => i !== index));

        if (!image.uploaded) {
            setSelectedFiles(prev => prev.filter((_, i) => {
                const previewIndex = previewImages.slice(0, index).filter(p => !p.uploaded).length;
                return i !== previewIndex;
            }));
        }
    };

    const openDeleteDialog = (index) => {
        setDeleteDialog({ open: true, index });
    };

    const closeDeleteDialog = () => {
        setDeleteDialog({ open: false, index: null });
    };

    const confirmDelete = async () => {
        const { index } = deleteDialog;
        const image = previewImages[index];

        try {
            if (image.uploaded && image.id) {
                const response = await fetch(`${apiHost}/api/update-image-location/del`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: image.id })
                });

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.error || 'ไม่สามารถลบไฟล์ได้');
                }

                // ย้ายรูปไปยังแท็บที่ลบแล้ว
                setDeletedImages(prev => [...prev, image]);
            }

            handleRemoveImage(index);
            showAlert('success', 'ลบรูปภาพเรียบร้อยแล้ว');

        } catch (error) {
            console.error('Delete error:', error);
            showAlert('error', error.message || 'เกิดข้อผิดพลาดในการลบไฟล์');
        } finally {
            closeDeleteDialog();
        }
    };

    const openRestoreDialog = (image) => {
        setRestoreDialog({ open: true, image });
    };

    const closeRestoreDialog = () => {
        setRestoreDialog({ open: false, image: null });
    };

    const confirmRestore = async () => {
        const { image } = restoreDialog;

        try {
            const response = await fetch(`${apiHost}/api/restore-image`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: image.id })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'ไม่สามารถกู้คืนไฟล์ได้');
            }

            // ย้ายรูปกลับไปยังแท็บหลัก
            setPreviewImages(prev => [...prev, image]);
            setDeletedImages(prev => prev.filter(img => img.id !== image.id));
            showAlert('success', 'กู้คืนรูปภาพเรียบร้อยแล้ว');

        } catch (error) {
            console.error('Restore error:', error);
            showAlert('error', error.message || 'เกิดข้อผิดพลาดในการกู้คืนไฟล์');
        } finally {
            closeRestoreDialog();
        }
    };

    const openRestoreAllDialog = () => {
        setRestoreAllDialog(true);
    };

    const closeRestoreAllDialog = () => {
        setRestoreAllDialog(false);
    };

    const confirmRestoreAll = async () => {
        try {
            const response = await fetch(`${apiHost}/api/restore-all-images`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inspNo })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'ไม่สามารถกู้คืนไฟล์ได้');
            }

            // ย้ายรูปทั้งหมดกลับไปยังแท็บหลัก
            setPreviewImages(prev => [...prev, ...deletedImages]);
            setDeletedImages([]);
            showAlert('success', `กู้คืนรูปภาพทั้งหมด ${deletedImages.length} รูปเรียบร้อยแล้ว`);

        } catch (error) {
            console.error('Restore all error:', error);
            showAlert('error', error.message || 'เกิดข้อผิดพลาดในการกู้คืนไฟล์');
        } finally {
            closeRestoreAllDialog();
        }
    };

    const handleUploadAndSave = async () => {
        if (selectedFiles.length === 0 && previewImages.filter(p => p.uploaded).length === 0) {
            showAlert('error', 'กรุณาเลือกรูปภาพอย่างน้อย 1 รูป');
            return;
        }

        setUploading(true);

        try {
            const uploadedPaths = [];

            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('inspNo', inspNo);
                formData.append('inspSV', inspSV);

                const response = await fetch(`${apiHost}/api/upload`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    uploadedPaths.push(result.data.path);
                } else {
                    throw new Error(result.error || 'อัพโหลดล้มเหลว');
                }
            }

            const saveData = {
                inspNo,
                inspSV,
                userKey,
                customerName,
                customerNo,
                imagePaths: uploadedPaths,
                location: 'SCM'
            };

            const saveResponse = await fetch(`${apiHost}/api/save-images-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(saveData)
            });

            const saveResult = await saveResponse.json();

            if (saveResult.success) {
                showAlert('success', 'อัพโหลดและบันทึกสำเร็จ!');

                const newImages = uploadedPaths.map((path, index) => ({
                    url: `${apiHost}${path}`,
                    path: path,
                    id: saveResult.data.ids[index],
                    uploaded: true
                }));

                setPreviewImages(prev => [
                    ...prev.filter(p => p.uploaded),
                    ...newImages
                ]);
                setSelectedFiles([]);
            } else {
                throw new Error(saveResult.error || 'บันทึกล้มเหลว');
            }

        } catch (error) {
            showAlert('error', 'เกิดข้อผิดพลาด: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* ======= เพิ่มส่วนนี้หลังจาก <Paper elevation={3}> =======*/}
            {/* ส่วนรูปปก */}
            <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    รูปปกเอกสาร
                </Typography>

                <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        {headerImage ? (
                            <Card sx={{
                                position: 'relative',
                                aspectRatio: '1/1',
                                overflow: 'hidden'
                            }}>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'white'
                                    }}
                                >
                                    <img
                                        src={headerImage.url}
                                        alt="รูปปก"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            width: 'auto',
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                    />
                                </Box>
                                <IconButton
                                    onClick={openDeleteHeaderDialog}
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        bgcolor: 'error.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'error.dark' },
                                        zIndex: 10
                                    }}
                                    size="small"
                                >
                                    <Delete fontSize="small" />
                                </IconButton>
                                <Chip
                                    icon={headerImage.uploaded ? <CheckCircle /> : null}
                                    label={headerImage.uploaded ? 'บันทึกแล้ว' : 'รอการบันทึก'}
                                    color={headerImage.uploaded ? 'success' : 'warning'}
                                    sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
                                />
                            </Card>
                        ) : (
                            <Box sx={{
                                aspectRatio: '1/1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed #ccc',
                                borderRadius: 2,
                                bgcolor: 'white'
                            }}>
                                <ImageIcon sx={{ fontSize: 60, color: '#ccc', mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                    ยังไม่มีรูปปก
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2}>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                                disabled={uploadingHeader || headerImage}
                                fullWidth
                            >
                                {headerImage ? 'เปลี่ยนรูปปก' : 'เลือกรูปปก'}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    hidden
                                    onChange={handleHeaderFileSelect}
                                />
                            </Button>

                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Save />}
                                onClick={handleUploadHeader}
                                disabled={uploadingHeader || !headerFile}
                                fullWidth
                            >
                                {uploadingHeader ? 'กำลังบันทึก...' : 'บันทึกรูปปก'}
                            </Button>

                            <Typography variant="caption" color="text.secondary">
                                💡 รองรับไฟล์ JPEG, PNG, WebP ขนาดไม่เกิน 10MB
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>

                {uploadingHeader && <LinearProgress sx={{ mt: 2 }} />}
            </Box>

            {/* ======= เพิ่ม Dialog สำหรับลบรูปปก (ก่อนปิด </Paper>) =======*/}

            {/* Delete Header Dialog */}
            <Dialog open={deleteHeaderDialog} onClose={closeDeleteHeaderDialog}>
                <DialogTitle>ยืนยันการลบรูปปก</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        คุณต้องการลบรูปปกนี้ใช่หรือไม่?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteHeaderDialog} color="primary">
                        ยกเลิก
                    </Button>
                    <Button onClick={confirmDeleteHeader} color="error" variant="contained" autoFocus>
                        ลบ
                    </Button>
                </DialogActions>
            </Dialog>



            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    จัดการรูปภาพ
                </Typography>
                {activeTab === 0 && (
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                            disabled={previewImages.length >= MAX_IMAGES || uploading}
                        >
                            เลือกรูปภาพ
                            <input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                multiple
                                hidden
                                onChange={handleFileSelect}
                            />
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Save />}
                            onClick={handleUploadAndSave}
                            disabled={uploading || (selectedFiles.length === 0 && previewImages.filter(p => p.uploaded).length === 0)}
                        >
                            อัพโหลดและบันทึก
                        </Button>
                    </Stack>
                )}
                {activeTab === 1 && deletedImages.length > 0 && (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<RestoreFromTrash />}
                        onClick={openRestoreAllDialog}
                    >
                        กู้คืนทั้งหมด ({deletedImages.length})
                    </Button>
                )}
            </Stack>

            {alert.show && (
                <Alert severity={alert.type} sx={{ mb: 3 }}>
                    {alert.message}
                </Alert>
            )}

            {uploading && <LinearProgress sx={{ mb: 3 }} />}

            <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ mb: 3 }}>
                <Tab
                    label={`รูปภาพปัจจุบัน (${previewImages.length}/${MAX_IMAGES})`}
                    icon={<ImageIcon />}
                    iconPosition="start"
                />
                <Tab
                    label={`รูปที่ลบแล้ว (${deletedImages.length})`}
                    icon={<RestoreFromTrash />}
                    iconPosition="start"
                />
            </Tabs>

            {activeTab === 0 && (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                            รูปภาพที่เลือก: {previewImages.length} / {MAX_IMAGES}
                            {selectedFiles.length > 0 && ` (รอการอัพโหลด: ${selectedFiles.length})`}
                        </Typography>
                    </Box>

                    <Grid container spacing={2}>
                        {previewImages.map((image, index) => (
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                                <Card
                                    sx={{
                                        border: image.uploaded ? '2px solid #4caf50' : '2px solid #ff9800',
                                    }}
                                >
                                    {/* ส่วนรูปภาพ */}
                                    <Box sx={{
                                        /*  aspectRatio: '1/1', */
                                        position: 'relative'
                                    }}>
                                        <Box
                                            component="img"
                                            src={image.url}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />

                                        {/* ปุ่มลบ */}
                                        <IconButton
                                            onClick={() => openDeleteDialog(index)}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                bgcolor: 'error.main',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'error.dark' },
                                                zIndex: 10
                                            }}
                                            size="small"
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>

                                        {/* Chip สถานะ */}
                                        <Chip
                                            icon={image.uploaded ? <CheckCircle /> : null}
                                            label={image.uploaded ? 'อัพโหลดแล้ว' : 'รอการอัพโหลด'}
                                            color={image.uploaded ? 'success' : 'warning'}
                                            size="small"
                                            sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
                                        />
                                    </Box>

                                    {/* ส่วน Description - อยู่ใต้รูปภาพ */}
                                    {image.uploaded && (
                                        <Box sx={{ p: 1.5, bgcolor: '#fafafa' }}>
                                            {savedDescriptions[image.id] && !editingDescription[image.id] ? (
                                                // แสดง description ที่บันทึกแล้ว (เปลี่ยนจาก imageDescriptions เป็น savedDescriptions)
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            mb: 1,
                                                            whiteSpace: 'pre-wrap',
                                                            minHeight: '40px'
                                                        }}
                                                    >
                                                        {imageDescriptions[image.id]}
                                                    </Typography>
                                                    <Button
                                                        fullWidth
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => setEditingDescription(prev => ({ ...prev, [image.id]: true }))}
                                                    >
                                                        แก้ไข
                                                    </Button>
                                                </Box>
                                            ) : (
                                                // ฟอร์มกรอก/แก้ไข
                                                <Box component="form" onSubmit={(e) => e.preventDefault()}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        multiline
                                                        rows={2}
                                                        placeholder="เพิ่มคำอธิบาย..."
                                                        value={imageDescriptions[image.id] || ''}
                                                        onChange={(e) => handleDescriptionChange(image.id, e.target.value)}
                                                        sx={{ mb: 1, bgcolor: 'white' }}
                                                    />
                                                    <Stack direction="row" spacing={1}>
                                                        <Button
                                                            fullWidth
                                                            size="small"
                                                            variant="contained"
                                                            type="button"
                                                            onClick={async () => {
                                                                await handleSaveDescription(image.id);
                                                                setEditingDescription(prev => ({ ...prev, [image.id]: false }));
                                                            }}
                                                        >
                                                            บันทึก
                                                        </Button>
                                                        <Button
                                                            fullWidth
                                                            size="small"
                                                            variant="outlined"
                                                            type="button"
                                                            onClick={() => {
                                                                // ถ้ายกเลิกและยังไม่เคยบันทึก ให้ล้างค่า
                                                                if (!savedDescriptions[image.id]) {
                                                                    setImageDescriptions(prev => {
                                                                        const newDesc = { ...prev };
                                                                        delete newDesc[image.id];
                                                                        return newDesc;
                                                                    });
                                                                }
                                                                setEditingDescription(prev => ({ ...prev, [image.id]: false }));
                                                            }}
                                                        >
                                                            ยกเลิก
                                                        </Button>
                                                    </Stack>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {previewImages.length === 0 && (
                        <Box sx={{
                            textAlign: 'center',
                            py: 8,
                            border: '2px dashed #ccc',
                            borderRadius: 2,
                            bgcolor: '#fafafa'
                        }}>
                            <ImageIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                ยังไม่มีรูปภาพ
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                คลิกปุ่ม "เลือกรูปภาพ" เพื่อเริ่มต้น
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ mt: 4, p: 2, bgcolor: '#e3f2fd', borderRadius: 2, borderLeft: '4px solid #2196f3' }}>
                        <Typography variant="body2" color="text.secondary">
                            💡 <strong>คำแนะนำ:</strong> อัพโหลดได้สูงสุด {MAX_IMAGES} รูปภาพ | รองรับไฟล์ JPEG, PNG, WebP | ขนาดไม่เกิน 10MB ต่อไฟล์
                        </Typography>
                    </Box>
                </>
            )}

            {activeTab === 1 && (
                <>
                    <Grid container spacing={2}>
                        {deletedImages.map((image, index) => (
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                                <Card
                                    sx={{
                                        /* aspectRatio: '1/1', */
                                        position: 'relative',
                                        border: '2px solid #757575',
                                        opacity: 0.7
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={image.url}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <IconButton
                                        onClick={() => openRestoreDialog(image)}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            bgcolor: 'success.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'success.dark' },
                                            zIndex: 10
                                        }}
                                        size="small"
                                    >
                                        <Restore fontSize="small" />
                                    </IconButton>
                                    <Chip
                                        label="ลบแล้ว"
                                        color="error"
                                        size="small"
                                        sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
                                    />
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {deletedImages.length === 0 && (
                        <Box sx={{
                            textAlign: 'center',
                            py: 8,
                            border: '2px dashed #ccc',
                            borderRadius: 2,
                            bgcolor: '#fafafa'
                        }}>
                            <RestoreFromTrash sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                ไม่มีรูปภาพที่ลบ
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                รูปภาพที่ลบจะแสดงที่นี่
                            </Typography>
                        </Box>
                    )}
                </>
            )}

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
                <DialogTitle>ยืนยันการลบรูปภาพ</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        คุณต้องการลบรูปภาพนี้ใช่หรือไม่? คุณสามารถกู้คืนได้ในแท็บ "รูปที่ลบแล้ว"
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="primary">
                        ยกเลิก
                    </Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
                        ลบ
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Restore Dialog */}
            <Dialog open={restoreDialog.open} onClose={closeRestoreDialog}>
                <DialogTitle>ยืนยันการกู้คืนรูปภาพ</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        คุณต้องการกู้คืนรูปภาพนี้ใช่หรือไม่?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeRestoreDialog} color="primary">
                        ยกเลิก
                    </Button>
                    <Button onClick={confirmRestore} color="success" variant="contained" autoFocus>
                        กู้คืน
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Restore All Dialog */}
            <Dialog open={restoreAllDialog} onClose={closeRestoreAllDialog}>
                <DialogTitle>ยืนยันการกู้คืนทั้งหมด</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        คุณต้องการกู้คืนรูปภาพทั้งหมด {deletedImages.length} รูปใช่หรือไม่?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeRestoreAllDialog} color="primary">
                        ยกเลิก
                    </Button>
                    <Button onClick={confirmRestoreAll} color="success" variant="contained" autoFocus>
                        กู้คืนทั้งหมด
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ScmImage;