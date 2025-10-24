// components/SendReceiveModal.jsx
import React, { useEffect, useState } from 'react';
import {
    Modal, Box, Stack, Typography, TextField,
    MenuItem, Button, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function SendReceiveModal({ open, onClose, row, onSuccess }) {
    const apiHost = import.meta.env.VITE_API_HOST;

    const [stationList, setStationList] = useState([]);
    const [selectedStation, setSelectedStation] = useState('');
    const [alert, setAlert] = useState({ open: false, msg: '', severity: 'success' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && row) {
            axios.get(`${apiHost}/api/list_station`)
                .then(res => setStationList(res.data))
                .catch(() => setStationList([]));
            setSelectedStation('');
        }
    }, [open, row]);

    const handleSend = () => {
        if (!selectedStation) return;

        setLoading(true);
        axios.post(`${apiHost}/api/send_station001`, {
            insp_id: row.insp_id,
            next_station: selectedStation,
            user_id: sessionStorage.getItem("usvt_user_key") || "unknown"
        }).then(() => {
            /* setAlert({ open: true, msg: `ส่ง ${row.insp_service_order} ไปยัง ${selectedStation} สำเร็จ`, severity: 'success' }); */
            Swal.fire({
                icon: 'success',
                title: `รหัสงาน: ${row.insp_no}`,
                text: `ส่ง ${row.insp_service_order} ไปยัง ${selectedStation} สำเร็จ`,
                confirmButtonText: 'ตกลง',
            });
            onClose();
            onSuccess?.(); // callback ไปยัง ListStation
        }).catch(err => {
            setAlert({ open: true, msg: err.response?.data?.error || 'เกิดข้อผิดพลาด', severity: 'error' });
        }).finally(() => setLoading(false));
    };

    return (
        <>
            <Modal open={open} onClose={onClose}>
                <Box sx={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    bgcolor: "background.paper", p: 4, borderRadius: 2,
                    boxShadow: 24, minWidth: 300
                }}>
                    <Stack spacing={2}>
                        <Typography variant="h6">Next Station</Typography>

                        <TextField
                            label="จาก (Station From)"
                            value={row?.insp_station_now || '-'}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                },
                            }}
                            fullWidth
                            sx={{ backgroundColor: '#f5f5f5' }}
                        />

                        <TextField
                            select
                            label="ส่งไปที่ (Station To)"
                            value={selectedStation}
                            onChange={(e) => setSelectedStation(e.target.value)}
                            fullWidth
                        >
                            {stationList.length === 0 ? (
                                <MenuItem disabled>ไม่พบข้อมูลสถานี</MenuItem>
                            ) : (
                                stationList.map((s) => (
                                    <MenuItem key={s.station_code} value={s.station_code}>
                                        {s.station_code}
                                    </MenuItem>
                                ))
                            )}
                        </TextField>

                        <Button
                            variant="contained"
                            onClick={handleSend}
                            disabled={!selectedStation || loading}
                        >
                            ส่ง
                        </Button>
                    </Stack>
                </Box>
            </Modal>

            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={() => setAlert(a => ({ ...a, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setAlert(a => ({ ...a, open: false }))}
                    severity={alert.severity}
                    variant="filled"
                >
                    {alert.msg}
                </Alert>
            </Snackbar>
        </>
    );
}
