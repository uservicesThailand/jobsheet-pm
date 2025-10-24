import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Paper, Grid, TextField, Select, MenuItem, Backdrop, CircularProgress, FormControl, InputLabel, Button } from '@mui/material';
import Swal from 'sweetalert2';
import SaveButton from '../button/SaveButton';
import dayjs from 'dayjs';
import 'dayjs/locale/th'; // สำหรับ locale ภาษาไทย
dayjs.locale('th');

export default function FormMotorNameplate({ data, keyName, userKey, inspNo, inspSV }) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    frame: '',
    type: '',
    manufacture: '',
    model: '',
    ser_no: '',
    power: '',
    power_unit: 'kW',
    speed: '',
    speed_unit: 'RPM',
    insulation_class: '',
    design: '',
    voltage: '',
    current: '',
    frequency: '',
    temp_rise_class: '',
    duty: '',
    cos_phi: '',
    ip: '',
    sf: '',
    note: '',
    created_at: '-',
    updated_by: '',
    created_date: ''
  });



  // ⭐ handleChange (ใช้ได้ทั้ง TextField และ Select)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  // 2) useEffect: ใช้ data?.xxx ทุกตัว และต่อชื่อแบบปลอดภัย
  useEffect(() => {
    if (data) {
      const formatDate = (val) => {
        if (!val) return '';
        return dayjs(val).isValid()
          ? dayjs(val).format('DD MMM YYYY HH:mm') // ✅ เช่น "27 ส.ค. 2568 10:45"
          : val;
      };
      setFormData((prev) => ({
        ...prev,
        id: data?.mnp_id ?? '',
        frame: data?.fmn_frame ?? '',
        type: data?.fmn_type ?? '',
        manufacture: data?.fmn_manufacture ?? '',
        model: data?.fmn_model ?? '',
        ser_no: data?.fmn_ser_no ?? '',
        power: data?.fmn_power ?? '',
        power_unit: data?.fmn_power_unit ?? 'kW',
        speed: data?.fmn_speed ?? '',
        speed_unit: data?.fmn_speed_unit ?? 'RPM',
        insulation_class: data?.fmn_insulation_class ?? '',
        design: data?.fmn_design ?? '',
        voltage: data?.fmn_voltage ?? '',
        current: data?.fmn_current ?? '',
        frequency: data?.fmn_frequency ?? '',
        temp_rise_class: data?.fmn_temp_rise_class ?? '',
        duty: data?.fmn_duty ?? '',
        cos_phi: data?.fmn_cos_phi ?? '',
        ip: data?.fmn_ip ?? '',
        sf: data?.fmn_sf ?? '',
        note: data?.fmn_note ?? '',
        created_at: [data?.name, data?.lastname].filter(Boolean).join(' ') || '-',
        updated_by: [data?.name, data?.lastname].filter(Boolean).join(' ') || '',
        created_date: formatDate(data?.created_at),
      }));
    }
  }, [data]);

  // แทนที่ handleSubmit เดิมทั้งฟังก์ชัน
  const handleSubmit = async (e) => {
    e.preventDefault();
    /* console.log('data:' + data);
       console.log('keyName:' + keyName);
       console.log('userKey:' + userKey);
       console.log('inspNo:' + inspNo); */
    try {
      /* setLoading(true); */

      const apiHost = import.meta.env.VITE_API_HOST;
      const url = `${apiHost}/api/forms/FormMotorNameplate/${inspNo}`;

      // map กลับเป็นคอลัมน์ fmn_* ตามตาราง
      const payload = {
        insp_sv: inspSV || null,
        fmn_frame: formData.frame || null,
        fmn_type: formData.type || null,
        fmn_manufacture: formData.manufacture || null,
        fmn_model: formData.model || null,
        fmn_ser_no: formData.ser_no || null,
        fmn_power: formData.power || null,
        fmn_power_unit: formData.power_unit || null,
        fmn_speed: formData.speed || null,
        fmn_speed_unit: formData.speed_unit || null,
        fmn_insulation_class: formData.insulation_class || null,
        fmn_design: formData.design || null,
        fmn_voltage: formData.voltage || null,
        fmn_current: formData.current || null,
        fmn_frequency: formData.frequency || null,
        fmn_temp_rise_class: formData.temp_rise_class || null,
        fmn_duty: formData.duty || null,
        fmn_cos_phi: formData.cos_phi || null,
        fmn_ip: formData.ip || null,
        fmn_sf: formData.sf || null,
        fmn_note: formData.note || null,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // สมมติ backend ใช้ header user_key -> withUserId(req)
          'user_key': userKey || '',
          'sv': inspSV || '',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Save failed');

      await Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: `สร้างรายการสำเร็จ (หมายเลขอ้างอิงฟอร์ม: MTNP${json.mnp_id})`,
      }).then(() => {
        window.location.reload(); // รีโหลดหน้าเว็บ
      });

    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: err.message || String(err),
      });
    } finally {
      setLoading(false);
    }
  };


  const handleCancelClick = async () => {
    const apiHost = import.meta.env.VITE_API_HOST;

    const confirm = await Swal.fire({
      title: 'ยกเลิกการแก้ไขหรือไม่?',
      text: 'ข้อมูลที่คุณแก้ไขจะไม่ถูกบันทึก',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ยกเลิกการแก้ไข',
      cancelButtonText: 'ไม่, กลับไปแก้ไข',
    });

    if (confirm.isConfirmed) {
      resetForm(); // 👉 เรียกฟังก์ชันที่รีเซตฟอร์มจริง ๆ
    }
  };

  return (
    <>
      {/* Backdrop loading */}
      {/* <Backdrop open={loading} sx={{ color: '#fff', zIndex: 1300 }}>
        <CircularProgress color="inherit" />
      </Backdrop> */}

      <Box component="form" sx={{ p: { xs: 1, sm: 1 }, maxWidth: '1200px', mx: 'auto' }} onSubmit={handleSubmit}>
        <Alert severity="secondary">ID: MTNP{formData.id} (ใช้ในการตรวจสอบ) {/* - API เชื่อมต่อ : /api/forms/FormMotorNameplate/:inspNo */}</Alert>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Frame :" variant="standard" name="frame" value={formData.frame} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Type :" variant="standard" name="type" value={formData.type} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Manufacture :" variant="standard" name="manufacture" value={formData.manufacture} onChange={handleChange} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Model :" variant="standard" name="model" value={formData.model} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Ser.No. :" variant="standard" name="ser_no" value={formData.ser_no} onChange={handleChange} />
            </Grid>

            <Grid size={{ xs: 6, sm: 2 }}>
              <TextField fullWidth label="Power :" type="number" variant="standard" name="power" value={formData.power} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Select name="power_unit" value={formData.power_unit} onChange={handleChange} fullWidth>
                <MenuItem value="kW">kW</MenuItem>
                <MenuItem value="HP">HP</MenuItem>
                <MenuItem value="Nm">Nm</MenuItem>
                <MenuItem value="W">W</MenuItem>
              </Select>
            </Grid>

            <Grid size={{ xs: 6, sm: 2 }}>
              <TextField fullWidth type="number" label="Speed :" variant="standard" name="speed" value={formData.speed} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Select name="speed_unit" value={formData.speed_unit} onChange={handleChange} fullWidth>
                <MenuItem value="RPM">RPM</MenuItem>
                <MenuItem value="Pole">Pole</MenuItem>
              </Select>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Insulation Class :" variant="standard" name="insulation_class" value={formData.insulation_class} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Design :" variant="standard" name="design" value={formData.design} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth type="number" label="Voltage : V." helperText="Ex. 0.00"
                variant="standard" name="voltage" value={formData.voltage} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth type="number" label="Current : A." variant="standard" name="current" value={formData.current} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth type="number" label="Frequency : Hz." variant="standard" name="frequency" value={formData.frequency} onChange={handleChange} />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Temp.Rise Class :" variant="standard" name="temp_rise_class" value={formData.temp_rise_class} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Duty :" variant="standard" name="duty" value={formData.duty} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Cos.φ :" variant="standard" name="cos_phi" value={formData.cos_phi} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="IP :" variant="standard" name="ip" value={formData.ip} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="SF :" variant="standard" name="sf" value={formData.sf} onChange={handleChange} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Note (อื่นๆ):" multiline rows={4} name="note" value={formData.note} onChange={handleChange} />
            </Grid>
          </Grid>

          <Box textAlign="center" mt={4}>
            <SaveButton />
            <Box sx={{ width: '75%', mx: 'auto', mt: 4 }}>
              <Alert severity="success">อัพเดทล่าสุดเมื่อ: {formData.created_date} โดย: {formData.created_at} </Alert>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
