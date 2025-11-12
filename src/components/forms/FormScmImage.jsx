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
    RestoreFromTrash,
    CameraAlt,
    Close,
    PhotoCamera,
    FlipCameraAndroid,
    ZoomIn, NavigateBefore, NavigateNext
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

    // ======= เพิ่ม State สำหรับ Camera =======
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [facingMode, setFacingMode] = useState('environment'); // 'user' = หน้า, 'environment' = หลัง
    const [cameraMode, setCameraMode] = useState('gallery'); // 'gallery' or 'header'
    const [cameraSupported, setCameraSupported] = useState(true);
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    // ======= เพิ่ม State สำหรับ Image Viewer =======
    const [imageViewer, setImageViewer] = useState({
        open: false,
        currentIndex: 0,
        images: []
    });

    // ======= ฟังก์ชันเปิด Image Viewer =======
    const openImageViewer = (index, imageList) => {
        setImageViewer({
            open: true,
            currentIndex: index,
            images: imageList
        });
    };

    const closeImageViewer = () => {
        setImageViewer({
            open: false,
            currentIndex: 0,
            images: []
        });
    };

    const goToPrevious = () => {
        setImageViewer(prev => ({
            ...prev,
            currentIndex: prev.currentIndex > 0 ? prev.currentIndex - 1 : prev.images.length - 1
        }));
    };

    const goToNext = () => {
        setImageViewer(prev => ({
            ...prev,
            currentIndex: prev.currentIndex < prev.images.length - 1 ? prev.currentIndex + 1 : 0
        }));
    };

    // ======= Handle Keyboard Navigation =======
    React.useEffect(() => {
        const handleKeyPress = (e) => {
            if (!imageViewer.open) return;

            if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            } else if (e.key === 'Escape') {
                closeImageViewer();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [imageViewer.open]);

    // ======= ตรวจสอบว่า Browser รองรับกล้องหรือไม่ =======
    React.useEffect(() => {
        const checkCameraSupport = () => {
            const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            setCameraSupported(isSupported);

            if (!isSupported) {
                console.warn('Camera API not supported');
            }
        };

        checkCameraSupport();
    }, []);

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

    // ======= Cleanup camera stream when component unmounts =======
    React.useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

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

    // ======= ฟังก์ชันสำหรับ Camera =======
    const openCamera = async (mode = 'gallery') => {
        setCameraMode(mode);

        // ตรวจสอบว่า Browser รองรับ Camera API หรือไม่
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showAlert('error', '⚠️ Browser ของคุณไม่รองรับการใช้กล้อง หรือกรุณาใช้ HTTPS');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });
            setCameraStream(stream);
            setCameraOpen(true);

            // รอให้ video element พร้อม
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (error) {
            console.error('Camera error:', error);

            let errorMessage = 'ไม่สามารถเปิดกล้องได้';

            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = '🚫 กรุณาอนุญาตให้เข้าถึงกล้องในการตั้งค่า Browser';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage = '📷 ไม่พบกล้องในอุปกรณ์ของคุณ';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage = '⚠️ กล้องกำลังถูกใช้งานโดยแอปอื่น';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = '⚙️ การตั้งค่ากล้องไม่รองรับ';
            } else if (error.name === 'SecurityError') {
                errorMessage = '🔒 กรุณาใช้ HTTPS หรือ localhost';
            }

            showAlert('error', errorMessage);
        }
    };

    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setCameraOpen(false);
        setCapturedImage(null);
    };

    const switchCamera = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showAlert('error', 'Browser ไม่รองรับการสลับกล้อง');
            return;
        }

        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newFacingMode);

        // หยุด stream เดิม
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: newFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error('Switch camera error:', error);
            showAlert('error', 'ไม่สามารถสลับกล้องได้ - อาจมีเพียงกล้องเดียวในอุปกรณ์');

            // พยายามเปิดกล้องเดิมคืน
            setFacingMode(facingMode === 'user' ? 'environment' : 'user');
        }
    };

    const capturePhoto = async () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            canvas.toBlob(async (blob) => {
                // สร้าง File object จาก Blob
                const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });

                // แก้ไข orientation
                const fixedFile = await fixImageOrientation(file);
                const url = URL.createObjectURL(fixedFile);

                setCapturedImage(url);

                if (cameraMode === 'header') {
                    setHeaderFile(fixedFile);
                    setHeaderImage({
                        url: url,
                        uploaded: false
                    });
                } else {
                    // ตรวจสอบจำนวนรูปสูงสุด
                    if (previewImages.length >= MAX_IMAGES) {
                        showAlert('error', `สามารถอัพโหลดได้สูงสุด ${MAX_IMAGES} รูป`);
                        return;
                    }

                    const newPreview = {
                        url: url,
                        file: fixedFile,
                        uploaded: false
                    };

                    setPreviewImages(prev => [...prev, newPreview]);
                    setSelectedFiles(prev => [...prev, fixedFile]);
                }

                showAlert('success', 'ถ่ายรูปสำเร็จ!');
                closeCamera();
            }, 'image/jpeg', 0.9);
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
    };

    // ======= ฟังก์ชันแก้ไข EXIF Orientation =======
    const fixImageOrientation = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    // สร้าง canvas ตามขนาดจริงของรูป
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // ตั้งค่าขนาด canvas ตามรูปต้นฉบับ
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // วาดรูปลง canvas (จะแก้ orientation อัตโนมัติ)
                    ctx.drawImage(img, 0, 0);

                    // แปลง canvas เป็น Blob
                    canvas.toBlob((blob) => {
                        // สร้าง File ใหม่จาก Blob
                        const newFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });
                        resolve(newFile);
                    }, file.type, 0.95); // คุณภาพ 95%
                };

                img.src = e.target.result;
            };

            reader.readAsDataURL(file);
        });
    };

    // ======= เพิ่มฟังก์ชันใหม่สำหรับรูปปก (เพิ่มก่อน handleUploadAndSave) =======
    const handleHeaderFileSelect = async (e) => {
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

        // แก้ไข orientation ก่อนแสดงและบันทึก
        const fixedFile = await fixImageOrientation(file);

        setHeaderFile(fixedFile);
        setHeaderImage({
            url: URL.createObjectURL(fixedFile),
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

    const handleFileSelect = async (e) => {
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

            // แก้ไข orientation สำหรับแต่ละไฟล์
            const fixedFile = await fixImageOrientation(file);
            validFiles.push(fixedFile);
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
            {/* ======= ส่วนรูปปก =======*/}
            <Box sx={{ mb: 4, p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
                    รูปปกเอกสาร
                </Typography>

                <Grid container spacing={3} alignItems="flex-start">
                    <Grid size={{ xs: 12, md: 6 }}>
                        {headerImage ? (
                            <Card sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'pointer'
                            }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'white',
                                        minHeight: '200px',
                                        position: 'relative'
                                    }}
                                >
                                    <img
                                        src={headerImage.url}
                                        alt="รูปปก"
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                    />
                                    {/* เพิ่ม Zoom Icon */}
                                    {/* <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 8,
                                            right: 8,
                                            bgcolor: 'rgba(0,0,0,0.6)',
                                            borderRadius: '50%',
                                            p: 0.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <ZoomIn sx={{ color: 'white', fontSize: 20 }} />
                                    </Box> */}
                                </Box>
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation(); // ป้องกันไม่ให้เปิด viewer
                                        openDeleteHeaderDialog;
                                    }}
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
                                minHeight: '200px',
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

                            {cameraSupported && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<CameraAlt />}
                                    onClick={() => openCamera('header')}
                                    disabled={uploadingHeader || headerImage}
                                    fullWidth
                                >
                                    ถ่ายรูปปก
                                </Button>
                            )}

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
                                {!cameraSupported && <><br />⚠️ Browser ไม่รองรับกล้อง (ต้องใช้ HTTPS)</>}
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>
                {uploadingHeader && <LinearProgress sx={{ mt: 2 }} />}
            </Box>

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
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={2}>
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
                            {cameraSupported && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<CameraAlt />}
                                    onClick={() => openCamera('gallery')}
                                    disabled={previewImages.length >= MAX_IMAGES || uploading}
                                >
                                    ถ่ายรูป
                                </Button>
                            )}
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
                    </Grid>
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
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                <Card
                                    sx={{
                                        border: image.uploaded ? '2px solid #4caf50' : '2px solid #ff9800',
                                    }}
                                >
                                    {/* ส่วนรูปภาพ (แก้ไข) */}
                                    <Box sx={{
                                        position: 'relative',
                                        bgcolor: '#f5f5f5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '200px',
                                        cursor: 'pointer' // เพิ่มบรรทัดนี้
                                    }}
                                        onClick={() => openImageViewer(index, previewImages)} // เพิ่มบรรทัดนี้
                                    >
                                        <Box
                                            component="img"
                                            src={image.url}
                                            sx={{
                                                width: '100%',
                                                height: 'auto',
                                                display: 'block'
                                            }}
                                        />

                                        {/* เพิ่ม Zoom Icon */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 8,
                                                right: 8,
                                                bgcolor: 'rgba(0,0,0,0.6)',
                                                borderRadius: '50%',
                                                p: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <ZoomIn sx={{ color: 'white', fontSize: 20 }} />
                                        </Box>

                                        {/* ปุ่มลบ (แก้ไข) */}
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation(); // ป้องกันไม่ให้เปิด viewer
                                                openDeleteDialog(index);
                                            }}
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
                                                // แสดง description ที่บันทึกแล้ว
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
                                คลิกปุ่ม "เลือกรูปภาพ" หรือ "ถ่ายรูป" เพื่อเริ่มต้น
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
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                <Card
                                    sx={{
                                        position: 'relative',
                                        border: '2px solid #757575',
                                        opacity: 0.7
                                    }}
                                >
                                    <Box sx={{
                                        position: 'relative',
                                        bgcolor: '#f5f5f5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '200px'
                                    }}>
                                        <Box
                                            component="img"
                                            src={image.url}
                                            sx={{
                                                width: '100%',
                                                height: 'auto',
                                                display: 'block'
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 8,
                                                right: 52, // เว้นพื้นที่ปุ่ม restore
                                                bgcolor: 'rgba(0,0,0,0.6)',
                                                borderRadius: '50%',
                                                p: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <ZoomIn sx={{ color: 'white', fontSize: 20 }} />
                                        </Box>
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation(); // ป้องกันไม่ให้เปิด viewer
                                                openRestoreDialog(image);
                                            }}
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
                                    </Box>
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
            {/* ======= เพิ่ม Image Viewer Dialog ======= */}
            <Dialog
                open={imageViewer.open}
                onClose={closeImageViewer}
                maxWidth={false}
                fullScreen
                sx={{
                    '& .MuiDialog-paper': {
                        bgcolor: 'rgba(0,0,0,0.95)'
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'rgba(0,0,0,0.8)',
                    color: '#fff',
                    py: 1
                }}>
                    <Typography variant="h6">
                        รูปที่ {imageViewer.currentIndex + 1} / {imageViewer.images.length}
                    </Typography>
                    <IconButton onClick={closeImageViewer} sx={{ color: '#fff' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{
                    p: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* ปุ่มซ้าย */}
                    {imageViewer.images.length > 1 && (
                        <IconButton
                            onClick={goToPrevious}
                            sx={{
                                position: 'absolute',
                                left: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.3)'
                                },
                                width: 56,
                                height: 56,
                                zIndex: 10
                            }}
                        >
                            <NavigateBefore sx={{ fontSize: 40 }} />
                        </IconButton>
                    )}

                    {/* รูปภาพ */}
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2
                        }}
                    >
                        <img
                            src={imageViewer.images[imageViewer.currentIndex]?.url}
                            alt={`รูปที่ ${imageViewer.currentIndex + 1}`}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                userSelect: 'none'
                            }}
                        />
                    </Box>

                    {/* ปุ่มขวา */}
                    {imageViewer.images.length > 1 && (
                        <IconButton
                            onClick={goToNext}
                            sx={{
                                position: 'absolute',
                                right: 16,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.3)'
                                },
                                width: 56,
                                height: 56,
                                zIndex: 10
                            }}
                        >
                            <NavigateNext sx={{ fontSize: 40 }} />
                        </IconButton>
                    )}

                    {/* แสดง Description ถ้ามี */}
                    {imageViewer.images[imageViewer.currentIndex]?.id &&
                        imageDescriptions[imageViewer.images[imageViewer.currentIndex].id] && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    bgcolor: 'rgba(0,0,0,0.7)',
                                    color: '#fff',
                                    p: 2,
                                    zIndex: 10
                                }}
                            >
                                <Typography variant="body1">
                                    {imageDescriptions[imageViewer.images[imageViewer.currentIndex].id]}
                                </Typography>
                            </Box>
                        )}

                    {/* คำแนะนำการใช้งาน */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 70,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            fontSize: '0.875rem',
                            zIndex: 10
                        }}
                    >
                        กด ← → เพื่อเลื่อนดูรูป | ESC เพื่อปิด
                    </Box>
                </DialogContent>
            </Dialog>


            {/* ======= Camera Dialog ======= */}
            <Dialog
                open={cameraOpen}
                onClose={closeCamera}
                maxWidth="md"
                fullWidth
                fullScreen
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: '#000',
                    color: '#fff'
                }}>
                    <Typography variant="h6">
                        {cameraMode === 'header' ? 'ถ่ายรูปปก' : 'ถ่ายรูปภาพ'}
                    </Typography>
                    <IconButton onClick={closeCamera} sx={{ color: '#fff' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#000', position: 'relative' }}>
                    {!capturedImage ? (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            <Box sx={{
                                position: 'absolute',
                                bottom: 20,
                                left: 0,
                                right: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 2
                            }}>
                                <IconButton
                                    onClick={switchCamera}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                    }}
                                >
                                    <FlipCameraAndroid />
                                </IconButton>
                                <IconButton
                                    onClick={capturePhoto}
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                    }}
                                >
                                    <PhotoCamera sx={{ fontSize: 40 }} />
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <>
                            <img
                                src={capturedImage}
                                alt="Captured"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                            <Box sx={{
                                position: 'absolute',
                                bottom: 20,
                                left: 0,
                                right: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 2
                            }}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={retakePhoto}
                                    startIcon={<Close />}
                                >
                                    ถ่ายใหม่
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={closeCamera}
                                    startIcon={<CheckCircle />}
                                >
                                    ใช้รูปนี้
                                </Button>
                            </Box>
                        </>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </DialogContent>
            </Dialog>

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