import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import dayjs from "dayjs";

import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    IconButton,
    Backdrop,
    CircularProgress,
    Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { ImagePlus } from "lucide-react";

import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";

/**
 * ฟอร์มอัปโหลดรูปภาพอย่างเดียว
 * - โหลดรายการรูปเดิมจาก /api/forms/:keyName/:inspNo (field: trp_img_name = "a.jpg,b.jpg")
 * - ลาก/เลือกไฟล์ -> พรีวิว -> กดอัปโหลด -> บีบอัด + ส่งขึ้นเซิร์ฟเวอร์ /api/upload
 * - กันชื่อซ้ำด้วยรูปแบบ: `${inspNo}-${YYMMDD}-${originalName}.jpg`
 * - แสดงรูปที่มี พร้อมลบ + เปิดดู (lightbox)
 *
 * Props:
 * - inspNo   : string (รหัสงาน/inspection)
 * - keyName  : string (เช่น "form_test_report")
 * - apiHost? : string (ถ้าไม่ส่งมา จะอ่านจาก import.meta.env.VITE_API_HOST)
 */
export default function FormPhotoBefore({ inspNo, keyName, apiHost: apiHostProp }) {
    const apiHost = apiHostProp || "http://192.168.112.49:5000";

    const [loading, setLoading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]); // ชื่อไฟล์ที่อยู่บนเซิร์ฟเวอร์
    const [files, setFiles] = useState([]); // ไฟล์ที่ผู้ใช้เพิ่งเลือก (พรีวิว)
    const [photoIndex, setPhotoIndex] = useState(-1);

    // -------- helpers --------
    const generateUploadFileName = (fileName, inspNo, uploadDate) => {
        const cleanName = fileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
        const prefixToRemove = `${inspNo}-${uploadDate}-`;
        const cleanedOriginal = cleanName.startsWith(prefixToRemove)
            ? cleanName.slice(prefixToRemove.length)
            : cleanName;
        return `${inspNo}-${uploadDate}-${cleanedOriginal}`.replace(/\.(png|jpeg|gif)$/i, ".jpg");
    };

    const slides = useMemo(
        () => uploadedImages.map((img) => ({ src: `${apiHost}/img/${img}` })),
        [uploadedImages, apiHost]
    );

    // -------- load existing images --------
    const reloadUploadedImages = useCallback(async () => {
        try {
            const res = await axios.get(`${apiHost}/api/forms/${keyName}/${inspNo}`);
            const names = (res.data?.trp_img_name || "").split(",").filter(Boolean);
            setUploadedImages(names);
        } catch (err) {
            console.error("โหลดรายการรูปไม่สำเร็จ:", err);
        }
    }, [apiHost, keyName, inspNo]);

    useEffect(() => {
        if (inspNo && keyName) reloadUploadedImages();
    }, [inspNo, keyName, reloadUploadedImages]);

    // -------- dropzone --------
    const onDrop = useCallback(
        (acceptedFiles) => {
            const uploadDate = dayjs().format("YYMMDD");
            const newFiles = [];
            const dup = [];

            for (const file of acceptedFiles) {
                const nameOnServer = generateUploadFileName(file.name, inspNo, uploadDate);
                if (uploadedImages.includes(nameOnServer)) {
                    dup.push(file.name);
                    continue;
                }
                newFiles.push(Object.assign(file, { preview: URL.createObjectURL(file) }));
            }

            if (dup.length) {
                alert(`ไฟล์ซ้ำ (ข้ามอัตโนมัติ):\n- ${dup.join("\n- ")}`);
            }

            setFiles((prev) => [...prev, ...newFiles]);
        },
        [inspNo, uploadedImages]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "image/*": [] },
        onDrop,
    });

    // -------- upload --------
    const compressAndUpload = async () => {
        if (!files.length) return;
        setLoading(true);
        const uploadDate = dayjs().format("YYMMDD");
        const errors = [];

        for (const file of files) {
            const newName = generateUploadFileName(file.name, inspNo, uploadDate);

            if (uploadedImages.includes(newName)) {
                errors.push(`ไฟล์ซ้ำบนเซิร์ฟเวอร์: ${file.name}`);
                continue;
            }

            try {
                const compressed = await imageCompression(file, {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1280,
                    useWebWorker: true,
                });

                const form = new FormData();
                form.append("file", compressed, newName);
                form.append("inspNo", inspNo);

                await axios.post(`${apiHost}/api/upload`, form);
            } catch (err) {
                console.error("อัปโหลดล้มเหลว:", err);
                errors.push(`อัปโหลดล้มเหลว: ${file.name}`);
            }
        }

        await reloadUploadedImages();
        setFiles([]);

        setLoading(false);

        if (errors.length) {
            alert(errors.join("\n"));
        }
    };

    // -------- delete image on server --------
    const handleDeleteImage = async (filename) => {
        const ok = confirm(`ลบรูปนี้หรือไม่?\n${filename}`);
        if (!ok) return;

        try {
            await axios.delete(`${apiHost}/api/upload`, { data: { filename, inspNo } });
            setUploadedImages((prev) => prev.filter((n) => n !== filename));
        } catch (err) {
            console.error("ลบรูปไม่สำเร็จ:", err);
            alert("ลบรูปไม่สำเร็จ");
        }
    };

    return (
        <Box sx={{ p: 2, maxWidth: 1200, mx: "auto" }}>
            {/* โซนลาก-วาง / เลือกไฟล์ */}
            <Paper
                variant="outlined"
                {...getRootProps()}
                sx={{
                    p: 4,
                    borderStyle: "dashed",
                    borderRadius: 2,
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: isDragActive ? "#f7f7f7" : "transparent",
                    transition: "background-color 0.2s",
                }}
            >
                <input {...getInputProps()} />
                <Typography variant="h6" gutterBottom>
                    {isDragActive ? "ปล่อยไฟล์ตรงนี้" : "ลากรูปมาวาง หรือคลิกเพื่อเลือก"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    รองรับ .jpg .png .gif (บีบอัดอัตโนมัติ สูงสุด ~0.5MB/รูป)
                </Typography>
                <Button variant="contained" startIcon={<ImagePlus />}>
                    เลือกรูปภาพ
                </Button>
            </Paper>

            {/* พรีวิวไฟล์ใหม่ */}
            {files.length > 0 && (
                <>
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6">พรีวิวก่อนอัปโหลด</Typography>
                    </Box>
                    <Box
                        sx={{
                            mt: 2,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 2,
                        }}
                    >
                        {files.map((file, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    position: "relative",
                                    width: { xs: "48%", sm: "30%", md: "22%" },
                                    aspectRatio: "1 / 1",
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    overflow: "hidden",
                                    bgcolor: "#fff",
                                    p: 1,
                                }}
                            >
                                <img
                                    src={file.preview}
                                    alt={`preview-${idx}`}
                                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                                    sx={{
                                        position: "absolute",
                                        top: 4,
                                        right: 4,
                                        backgroundColor: "white",
                                        boxShadow: 1,
                                        "&:hover": { backgroundColor: "#eee" },
                                    }}
                                    aria-label="remove-preview"
                                >
                                    ×
                                </IconButton>
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ textAlign: "center", mt: 2 }}>
                        <Button variant="contained" onClick={compressAndUpload}>
                            อัปโหลดรูปที่เลือก
                        </Button>
                    </Box>
                </>
            )}

            {/* รูปที่อยู่บนเซิร์ฟเวอร์ */}
            <Box sx={{ mt: 5 }}>
                <Typography variant="h6">รูปที่อัปโหลดแล้ว</Typography>
                {uploadedImages.length === 0 ? (
                    <Alert sx={{ mt: 2 }} severity="info">
                        ยังไม่มีรูปในงานนี้
                    </Alert>
                ) : (
                    <Box
                        sx={{
                            mt: 2,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 2,
                        }}
                    >
                        {uploadedImages.map((img, index) => (
                            <Box
                                key={img}
                                onClick={() => setPhotoIndex(index)}
                                sx={{
                                    cursor: "zoom-in",
                                    position: "relative",
                                    width: { xs: "48%", sm: "18%", md: "14%" },
                                    aspectRatio: "1 / 1",
                                    borderRadius: 2,
                                    boxShadow: 1,
                                    overflow: "hidden",
                                    bgcolor: "#fff",
                                    p: 1,
                                }}
                            >
                                <img
                                    src={`${apiHost}/img/${img}`}
                                    alt={img}
                                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteImage(img);
                                    }}
                                    sx={{
                                        position: "absolute",
                                        top: 4,
                                        right: 4,
                                        backgroundColor: "white",
                                        boxShadow: 1,
                                        "&:hover": { backgroundColor: "#eee" },
                                    }}
                                    aria-label="delete-image"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Lightbox */}
            <Lightbox
                open={photoIndex >= 0}
                close={() => setPhotoIndex(-1)}
                index={photoIndex}
                slides={slides}
                plugins={[Counter]}
            />

            {/* Loading */}
            <Backdrop open={loading} sx={{ color: "#fff", zIndex: 1300 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
}
