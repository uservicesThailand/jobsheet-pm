import React, { useEffect, useState } from "react";
import {
    Box,
    Modal,
    Typography,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
    Snackbar,
    Alert,
    IconButton,
    Divider,
    Backdrop,
    Chip,
    Fade
} from "@mui/material";

import axios from "axios";
import { X, FileSliders } from "lucide-react";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    p: 3,
    borderRadius: 2,
    boxShadow: 24,
    width: 450,
    maxWidth: "90%",
};

export default function InspectionPopup({ open, onClose, rowData }) {
    const apiHost = import.meta.env.VITE_API_HOST;
    const [motorOptions, setMotorOptions] = useState([]);
    const [selectedMotor, setSelectedMotor] = useState("");
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });

    useEffect(() => {
        if (open) {
            setSelectedMotor("BLANK");
            axios.get(`${apiHost}/api/motors`)
                .then(res => setMotorOptions(res.data))
                .catch(() => {
                    setAlert({ open: true, severity: "error", message: "โหลดข้อมูลมอเตอร์ไม่สำเร็จ" });
                });
        }
    }, [open]);

    const handleSave = async () => {
        if (!selectedMotor || !rowData) return;
        const userKey = sessionStorage.getItem("usvt_user_key");

        setLoading(true);
        try {
            const res = await axios.post(`${apiHost}/api/inspection`, {
                cusNo: rowData?.Customer_No || "",
                branch: rowData?.USVT_ResponsibilityCenter || "",
                name: rowData?.Name || "",
                priority: rowData?.Priority || "",
                sale_quote: rowData?.Ref_Sales_Quote_No || "",
                service_order: rowData?.No || "",
                service_type: rowData?.Service_Order_Type || "",
                service_item: rowData?.Service_Item_No || "",
                document_date: rowData?.Order_Date || "",
                motor_code: selectedMotor,
                user_id: userKey
            });

            const inspNo = res.data?.insp_no;

            if (!inspNo) throw new Error("insp_no not found");


            setAlert({
                open: true,
                severity: "success",
                message: `บันทึกสำเร็จ: ${inspNo}`, // ✅ ใช้ insp_no ตรงนี้

/*                 message: `บันทึกสำเร็จ: ${rowData?.Ref_Sales_Quote_No || ""} / ${rowData?.No || ""}`,
 */            });

            setTimeout(() => {
                setLoading(false);
                onClose(true, inspNo); // ✅ ส่งออกไปให้ parent
            }, 1000);

        } catch {
            setAlert({
                open: true,
                severity: "error",
                message: "เกิดข้อผิดพลาดในการบันทึก",
            });
            setLoading(false);
        }
    };

    return (
        <>
            <Modal
                open={open}
                onClose={() => onClose(false)}
                closeAfterTransition
                slots={{ backdrop: Backdrop }} // ย้ำ: ใช้ backdrop จาก MUI
                slotProps={{
                    backdrop: {
                        timeout: 300,
                    },
                }}
            >
                <Fade in={open} timeout={300}>
                    <Box sx={modalStyle}>
                        {/* Header */}
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                            sx={{
                                borderRadius: 1,
                            }}
                        >

                            <Box display="flex" alignItems="center" gap={1}>
                                <FileSliders />
                                <Typography variant="h6">Start Inspection</Typography>
                            </Box>

                            <IconButton size="small" onClick={() => onClose(false)}>
                                <X />
                            </IconButton>
                        </Box>

                        <Divider sx={{ mb: 2, backgroundColor: 'grey.300' }} />

                        {/* Content Section */}
                        <Box display="flex" flexDirection="column" gap={1.5}>
                            <Box>
                                <Typography variant="subtitle2">Customer:</Typography>
                                <Typography variant="body2" color="primary">
                                    {rowData?.Customer_No + " - " + rowData?.Name || "-"}
                                </Typography>
                            </Box>

                            {/* Row: Service Order + Sales Quote */}
                            <Box display="flex" flexWrap="wrap" columnGap={2} rowGap={1}>
                                <Box>
                                    <Typography variant="subtitle2">Service Order:</Typography>
                                    <Box display="flex" alignItems="center">
                                        <Typography
                                            variant="body2"
                                            sx={{ color: 'warning.main', fontWeight: 'medium' }}
                                        >
                                            {rowData?.No || "-"}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2">Sales Quote:</Typography>
                                    <Typography variant="body2">{rowData?.Ref_Sales_Quote_No || "-"}</Typography>
                                </Box>
                            </Box>

                            {/* Row: Service Item + Priority */}
                            <Box display="flex" flexWrap="wrap" columnGap={5} rowGap={1}>
                                <Box>
                                    <Typography variant="subtitle2">Service Item:</Typography>
                                    <Typography variant="body2">{rowData?.Service_Item_No || "-"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2">Priority:</Typography>
                                    <Chip
                                        label={rowData?.Priority || "-"}
                                        size="small"
                                        sx={{
                                            backgroundColor:
                                                rowData?.Priority === 'High'
                                                    ? '#d32f2f'
                                                    : rowData?.Priority === 'Meduim'
                                                        ? '#ed6c02'
                                                        : '#cfd8dc',
                                            color: '#fff',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* Row: Service Type + Date */}
                            <Box display="flex" flexWrap="wrap" columnGap={5} rowGap={1}>
                                <Box>
                                    <Typography variant="subtitle2">Service Type:</Typography>
                                    <Typography variant="body2">{rowData?.Service_Order_Type || "-"}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2">วันที่เอกสาร:</Typography>
                                    <Typography variant="body2">{rowData?.Order_Date || "-"}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Motor Selector & Save Button */}
                        <Box mt={3} display="flex" flexDirection="column" gap={2}>
                            <TextField
                                fullWidth
                                select
                                label="เลือก Motor"
                                value={selectedMotor}
                                onChange={(e) => setSelectedMotor(e.target.value)}
                            >
                                {motorOptions.map((motor) => (
                                    <MenuItem key={motor.motor_code} value={motor.motor_code}>
                                        {motor.motor_name}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleSave}
                                disabled={loading || !selectedMotor}
                            >
                                {/* <NotebookPen /> */}  Start
                            </Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>


            {/*  Backdrop Loading */}
            <Backdrop
                sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={() => setAlert({ ...alert, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}

            >
                <Alert
                    severity={alert.severity}
                    onClose={() => setAlert({ ...alert, open: false })}
                    sx={{ width: "100%" }}
                    variant="filled"
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </>
    );
}
