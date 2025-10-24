import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Box, Button, Typography } from "@mui/material";

export default function QRCodeScanner({ onScanSuccess, onClose }) {
    const scannerRef = useRef(null);
    const isRunningRef = useRef(false);

    useEffect(() => {
        const qrElementId = "qr-reader";

        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode(qrElementId);
        }

        const scanner = scannerRef.current;

        const startScanner = async () => {
            try {
                if (!isRunningRef.current) {
                    await scanner.start(
                        { facingMode: "environment" },
                        { fps: 10, qrbox: { width: 250, height: 250 } },
                        async (decodedText) => {
                            if (isRunningRef.current) {
                                isRunningRef.current = false;

                                try {
                                    await scanner.stop(); // หยุดกล้องก่อน
                                } catch (err) {
                                    console.error("Failed to stop scanner", err);
                                }

                                onScanSuccess(decodedText); // ส่งข้อมูลไปข้างนอก
                                onClose(); // ปิด modal
                            }
                        },
                        (errorMessage) => {
                            // Ignore scan errors
                        }
                    );
                    isRunningRef.current = true;
                }
            } catch (error) {
                console.error("Error starting QR scanner:", error);
            }
        };

        const readerContainer = document.getElementById(qrElementId);
        if (readerContainer) {
            readerContainer.innerHTML = "";
        }

        setTimeout(startScanner, 100);

        return () => {
            if (isRunningRef.current && scannerRef.current) {
                scannerRef.current
                    .stop()
                    .catch((e) => console.warn("Error stopping scanner:", e));
                isRunningRef.current = false;
            }
        };
    }, []);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={{ p: 3 }}
        >
            <Typography variant="h6" mb={2}>
                กรุณาสแกน QR Code
            </Typography>
            <Box
                id="qr-reader"
                sx={{
                    width: 300,
                    maxWidth: "100%",
                    border: "1px solid #ccc",
                    borderRadius: 2,
                }}
            />
            <Button
                variant="outlined"
                color="error"
                onClick={onClose}
                sx={{ mt: 2 }}
            >
                ปิด
            </Button>
        </Box>
    );
}
