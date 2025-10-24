import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import QRCode from "react-qr-code";
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print'; // ใช้ไอคอนพิมพ์ (optional)
import { CloseIcon } from 'yet-another-react-lightbox';
import './PrintPreviewPage.css'
import { X } from 'lucide-react'

export default function PrintPreviewPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const apiHost = import.meta.env.VITE_API_HOST;

    useEffect(() => {
        axios.get(`${apiHost}/api/inspection/${id}`)
            .then((res) => {
                setData(res.data); // ✅ แค่ setData
            })
            .catch((err) => console.error(err));
    }, [id]);

    useEffect(() => {
        if (data) {
            // ✅ รอ DOM อัพเดตให้เสร็จแล้วค่อย print
            const timer = setTimeout(() => {
                window.print();
            }, 300); // ปรับเวลาให้พอดี (200–500ms)

            return () => clearTimeout(timer);
        }
    }, [data]);


    if (!data) {
        return (
            <Box p={4}>
                <CircularProgress sx={{ m: 4 }} />
                <Typography>กำลังโหลดข้อมูล...</Typography>
            </Box>
        );
    }

    return (
        <>
            <Box id="print-area" p={4}>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        {/* ข้อมูล */}
                        <Box>
                            <Typography variant='h6'>{data.insp_customer_name || '-'}</Typography>
                            <Typography>Service Order: {data.insp_service_order || '-'}</Typography>
                            <Typography>Sales Quote: {data.insp_sale_quote || '-'}</Typography>
                            <Typography>Service Item: {data.insp_service_item || '-'}</Typography><br />

                            <Typography>Motor: {data.motor_name || '-'}</Typography>
                        </Box>

                        {/* QR Code */}
                        <Box
                            sx={{
                                p: 1,
                                bgcolor: 'white',
                                border: '1px dashed #ccc',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center', // ✅ กึ่งกลางแนวนอน
                                width: 'fit-content',
                            }}
                        >
                            <QRCode value={data.insp_no || 'ไม่มีรหัสลูกค้า'} size={100} />
                            <Typography variant="caption" sx={{ mt: 1, fontSize: '0.75rem' }}>
                                {data.insp_no}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mx: 4, mt: 4 }}>
                <Button
                    variant="outlined"
                    color="warning"
                    onClick={() => window.close()}
                    size="small"
                    sx={{ mr: 4 }}
                    startIcon={<X />}
                >
                    ปิดหน้านี้
                </Button>
                <Button
                    color="warning"
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={() => window.print()}
                    size="small"
                >
                    พิมพ์ QC Form
                </Button>
            </Box>
        </>
    );
}
