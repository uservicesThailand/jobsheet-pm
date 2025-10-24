import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox,
  FormControlLabel, FormLabel, Radio, RadioGroup, Button, Grid, Paper, FormGroup,
  Backdrop, CircularProgress, Snackbar, Alert, Autocomplete
} from '@mui/material';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, List, ListItem, ListItemAvatar, ListItemText
} from '@mui/material';

import Swal from 'sweetalert2';
// เพิ่มด้านบน
import imageCompression from 'browser-image-compression';
import SaveIcon from '@mui/icons-material/Save';

/* Libary preview รูปภาพ */
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
/* Libary preview รูปภาพ */

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';


import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { RotateCcw, RotateCw, ImagePlus, Check, Users } from "lucide-react";
import 'dayjs/locale/th';
dayjs.locale('th');


export default function FormTestReport({ data, keyName, userKey, inspNo }) {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);

  const [formData, setFormData] = useState({});
  const apiHost = import.meta.env.VITE_API_HOST;
  const [files, setFiles] = useState([]);
  const images = uploadedImages.map((img) => `${apiHost}/img/${img}`);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(-1); // ✅ ไม่เปิดรูปทันที
  const [motorList, setMotorList] = useState([]);
  const [teamList, setTeamList] = useState([]);

  useEffect(() => {
    const fetchMotors = async () => {
      try {
        const res = await axios.get(`${apiHost}/api/motors`);
        setMotorList(res.data);
      } catch (err) {
        console.error('โหลดมอเตอร์ล้มเหลว:', err);
      }
    };

    const fetchTeams = async () => {
      try {
        const branch = sessionStorage.getItem("usvt_branch") || "";
        const res = await axios.get(`${apiHost}/api/teams`, {
          params: { branch }
        });
        setTeamList(res.data);
      } catch (err) {
        console.error('โหลดรายชื่อทีมล้มเหลว:', err);
      }
    };

    fetchMotors();
    fetchTeams();
  }, []);

  const handleOpenTeamDialog = async () => {
    const branch = sessionStorage.getItem("usvt_branch") || "";
    try {
      const res = await axios.get(`${apiHost}/api/teams/members`, { params: { branch } });
      setTeamMembers(res.data);
      setTeamDialogOpen(true);
    } catch (err) {
      console.error("โหลดสมาชิกทีมล้มเหลว", err);
      Swal.fire("ผิดพลาด", "ไม่สามารถโหลดข้อมูลทีมได้", "error");
    }
  };

  /*  const reloadInspectionData = async () => {
     try {
       const res = await axios.get(`${apiHost}/api/inspection/${inspNo}`);
       setFormData(prev => ({
         ...prev,
         stationNow: res.data?.insp_station_now || ''
       }));
     } catch (err) {
       console.error('โหลด station ใหม่ไม่สำเร็จ', err);
     }
   }; */

  /* 
    const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => {
      const newFiles = acceptedFiles.map(file =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      return [...prev, ...newFiles].slice(0, 5); // จำกัดรวมไม่เกิน 5
    });
  }, []);
  */

  const reloadUploadedImages = async () => {
    try {
      const res = await axios.get(`${apiHost}/api/forms/${keyName}/${formData.id}`);
      const imageNames = (res.data?.trp_img_name || '').split(',').filter(Boolean);
      setUploadedImages(imageNames);
    } catch (err) {
      console.error('โหลดรูปใหม่ล้มเหลว:', err);
    }
  };

  const handleDeleteImage = async (filename) => {
    const confirm = await Swal.fire({
      title: 'ลบรูปนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${apiHost}/api/upload`, {
          data: { filename, inspNo },
        });

        // ลบจาก state
        setUploadedImages((prev) => prev.filter((img) => img !== filename));
      } catch (err) {
        Swal.fire('ล้มเหลว', 'ไม่สามารถลบรูปได้', 'error');
        console.error("Delete image error:", err);
      }
    }
  };

  // 🔧 1. Helper สร้างชื่อไฟล์อัปโหลด
  const generateUploadFileName = (fileName, inspNo, uploadDate) => {
    const cleanName = fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const prefixToRemove = `${inspNo}-${uploadDate}-`;
    const cleanedOriginal = cleanName.startsWith(prefixToRemove)
      ? cleanName.slice(prefixToRemove.length)
      : cleanName;
    return `${inspNo}-${uploadDate}-${cleanedOriginal}`.replace(/\.(png|jpeg|gif)$/i, '.jpg');
  };

  // 🔁 2. onDrop ฟังก์ชันใหม่ (ใช้ useCallback)
  const onDrop = useCallback((acceptedFiles) => {
    const uploadDate = dayjs().format("YYMMDD");

    const newFiles = [];
    const duplicateWarnings = [];

    for (const file of acceptedFiles) {
      const generatedName = generateUploadFileName(file.name, inspNo, uploadDate);

      // เช็คกับไฟล์ที่เคยอัปโหลดแล้ว
      if (uploadedImages.includes(generatedName)) {
        duplicateWarnings.push(file.name);
        continue;
      }

      newFiles.push(Object.assign(file, { preview: URL.createObjectURL(file) }));
    }

    if (duplicateWarnings.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'มีไฟล์ซ้ำ',
        html: `ไฟล์ต่อไปนี้มีอยู่แล้ว:<br>${duplicateWarnings.join('<br>')}`,
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, [uploadedImages, inspNo]);

  // ⬆️ 3. compressAndUpload ฟังก์ชันใหม่
  const compressAndUpload = async () => {
    const uploadDate = dayjs().format("YYMMDD");
    const errorMessages = [];

    for (const file of files) {
      const newFileName = generateUploadFileName(file.name, inspNo, uploadDate);

      // เช็คชื่อซ้ำอีกรอบก่อนอัปโหลด
      if (uploadedImages.includes(newFileName)) {
        errorMessages.push(`ไฟล์ซ้ำ: ${file.name}`);
        continue;
      }

      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });

        const formData = new FormData();
        formData.append("file", compressed, newFileName);
        formData.append("inspNo", inspNo);

        await axios.post(`${apiHost}/api/upload`, formData);
      } catch (err) {
        if (err.response?.status === 409) {
          errorMessages.push(`ชื่อไฟล์ซ้ำที่เซิร์ฟเวอร์: ${file.name}`);
        } else {
          errorMessages.push(`อัปโหลดล้มเหลว: ${file.name}`);
        }
      }
    }

    if (errorMessages.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'อัปโหลดบางไฟล์ไม่สำเร็จ',
        html: errorMessages.join('<br>'),
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        stationNow: data.insp_station_now || '',
        dateUpdated: data.updated_at || '-',
        byUser: data.updated_by_name || data.created_by_name || '-',
        motorCode: data.trp_motor_code || data.insp_motor_code || '',
        serviceOrder: data.insp_service_order || '',
        serviceItem: data.insp_service_item || data.trp_service_item || '',
        id: inspNo || '',
        projectNo: data.trp_project_no || data.insp_sale_quote || '',
        cusNo: data.trp_customer_no || data.insp_customer_no || '',
        soId: data.trp_so_id || data.insp_sale_quote || '',
        customer: data.insp_customer_name || '', // <-- ดึงจาก props ถ้ามี
        erpMat: data.trp_erp_mat || '',
        jobNo: data.trp_job_no || '',
        tagNo: data.trp_tag_no || '',
        prqNo: data.trp_prq_no || '',
        team: data.trp_team || '',
        attention: data.trp_attention || '',
        location: data.trp_location || '',
        serviceType: data.trp_service_type || data.insp_service_type || '',
        urgency: data.trp_urgency || '',
        approveDate: data.trp_approve_date || '',
        incomingDate: data.trp_incoming_date || '',
        finalDate: data.trp_final_date || '',
        reportDate: data.trp_report_date || data.insp_document_date || '',
        direction: data.trp_direction || '',
        note: data.trp_note || '',
        userKey: userKey || '',
        stationTo: 'QA'

      });
      const imageNames = (data.trp_img_name || '').split(',').filter(Boolean);
      setUploadedImages(imageNames);
    }
  }, [data]);

  const handleCancelClick = async () => {
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

  const resetForm = () => {
    if (!data) return;

    setFormData({
      stationNow: data.insp_station_now || '',
      motorCode: data.trp_motor_code || data.insp_motor_code || '',
      serviceOrder: data.insp_service_order || '',
      serviceItem: data.insp_service_item || data.trp_service_item || '',
      id: inspNo || '',
      projectNo: data.trp_project_no || data.insp_sale_quote || '',
      cusNo: data.trp_customer_no || data.insp_customer_no || '',
      soId: data.trp_so_id || data.insp_sale_quote || '',
      customer: data.insp_customer_name || '',
      erpMat: data.trp_erp_mat || '',
      jobNo: data.trp_job_no || '',
      tagNo: data.trp_tag_no || '',
      prqNo: data.trp_prq_no || '',
      team: data.trp_team || '',
      attention: data.trp_attention || '',
      location: data.trp_location || '',
      serviceType: data.trp_service_type || data.insp_service_type || '',
      urgency: data.trp_urgency || '',
      approveDate: data.trp_approve_date || '',
      incomingDate: data.trp_incoming_date || '',
      finalDate: data.trp_final_date || '',
      reportDate: data.trp_report_date || data.insp_document_date || '',
      direction: data.trp_direction || '',
      note: data.trp_note || '',
      userKey: userKey || '',
      stationTo: 'QA'
    });

    setFiles([]); // ล้างรูปที่เลือกไว้
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleChangeMotor = (event) => {
    const motorCode = event.target.value;
    const selectedMotor = motorList.find(motor => motor.motor_code === motorCode);

    setFormData(prev => ({
      ...prev,
      motorCode,
      motorName: selectedMotor?.motor_name || '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        userKey,
        ...(formData.stationNow === 'Start' ? { stationTo: formData.stationTo } : { stationTo: undefined })
      };
      await axios.post(`${apiHost}/api/forms/${keyName}/${formData.id}`, payload);

      // 🔽 อัปโหลดรูปถ้ามี
      if (files.length > 0) {
        await compressAndUpload();
        await reloadUploadedImages(); // เมื่ออัพโหลดเสร็จให้เรียกใช้เลย

      }

      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        showConfirmButton: false,
        timer: 1200
      }).then(() => {
        window.location.reload(); // ✅ Reload หน้าใหม่หลังบันทึก
      });

    } catch (err) {
      console.error("Save error:", err);
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: 'กรุณาลองใหม่อีกครั้ง',
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 1, sm: 1 }, maxWidth: '1200px', mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        {/* <Typography variant="body2" color="text.secondary">Inspection ID: {inspId}</Typography> */}
        <Grid container spacing={2}>
          {data && (
            (data.trp_motor_code === "BLANK") ||
            (data.trp_motor_code == null && data.insp_motor_code === "BLANK")
          ) &&
            (
              <>
                <Grid container size={{ xs: 12, sm: 12 }} sx={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Typography variant='h6' color='error'>
                    **กรุณาเลือกประเภทมอเตอร์ :
                  </Typography>
                  <Autocomplete
                    options={motorList}
                    getOptionLabel={(option) => option.motor_name || ''}
                    value={motorList.find(m => m.motor_code === formData.motorCode) || null}
                    onChange={(event, newValue) => {
                      handleChangeMotor({
                        target: {
                          name: 'motor',
                          value: newValue?.motor_code || '',
                        },
                      });
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="เลือก Motor" variant="outlined" />
                    )}
                    sx={{ width: '50%', mx: 'auto' }}
                    isOptionEqualToValue={(option, value) => option.motor_code === value.motor_code}
                  />
                </Grid>
              </>
            )
          }

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              variant="standard"
              fullWidth
              label="ID:"
              name="id"
              value={formData.id || ''}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{ backgroundColor: '#f5f5f5' }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              variant="standard"
              fullWidth
              label="Service Order:"
              value={formData.serviceOrder || ''}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{ backgroundColor: '#f5f5f5' }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              variant="standard"
              fullWidth
              label="Service Item:"
              name="serviceItem"
              value={formData.serviceItem || ''}
              onChange={handleChange}
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
              sx={{ backgroundColor: '#f5f5f5' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="serviceType-label">Service Type:</InputLabel>
              <Select
                labelId="serviceType-label"
                id="serviceType"
                name="serviceType"
                value={formData.serviceType || ''}
                label="Service Type"
                onChange={handleChange}
              >
                <MenuItem value="" disabled>-- กรุณาเลือก --</MenuItem>
                <MenuItem value="SHOP">Shop</MenuItem>
                <MenuItem value="ADD">Addition</MenuItem>
                <MenuItem value="CLAIM">Claim</MenuItem>
                <MenuItem value="SITE">On site</MenuItem>
                <MenuItem value="SITE2SHOP">Site to shop</MenuItem>
                <MenuItem value="TRADE">Trade</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {[
            { name: 'cusNo', label: 'Customer No:', width: 4 },
            { name: 'customer', label: 'Customer:', width: 8 },
            { name: 'projectNo', label: 'Project No:', width: 4 },
            { name: 'soId', label: 'SO ID:', width: 4 },
            { name: 'erpMat', label: 'ERP MAT:', width: 4 },
            { name: 'jobNo', label: 'Job No:', width: 4 },
            { name: 'tagNo', label: 'Tag No:', width: 12 },
            { name: 'prqNo', label: 'PRQ No:', width: 4 },
            { name: 'attention', label: 'Attention:', width: 4 },
            { name: 'location', label: 'Location:', width: 4 },
          ].map((field) => (
            <Grid key={field.name} size={{ xs: 12, sm: field.width, md: (field.width / 2) }}>
              <TextField
                variant="standard"
                fullWidth
                label={field.label}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
              />
            </Grid>
          ))}

          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth variant="standard">
              <InputLabel id="team-label">ทีม</InputLabel>
              <Select
                labelId="team-label"
                name="team"
                value={formData.team || ''}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>-- กรุณาเลือกทีม --</MenuItem>
                {teamList.map((team) => (
                  <MenuItem key={team.team_id} value={team.team_name}>
                    {team.team_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 1 }}>
              <Button size="small" variant="outlined" onClick={handleOpenTeamDialog}>
                ดูทีมทั้งหมด
              </Button>
            </Box>
          </Grid>
          <Dialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)} fullWidth>
            <DialogTitle>เลือกทีมจากรายการ</DialogTitle>
            <DialogContent dividers>
              {Array.from(new Set(teamMembers.map(m => m.team_name))).map(team => (
                <Box key={team} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline' }}>
                    <Typography variant="h6" mr={3} gutterBottom color="warning">
                      <Users size={20} /> {team}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, team }));
                        setTeamDialogOpen(false);
                      }}
                      startIcon={<Check size={20} />}
                    >
                      เลือก
                    </Button>
                  </Box>

                  <List dense>
                    {teamMembers.filter(m => m.team_name === team).map((member, idx) => (
                      <ListItem key={idx}>
                        <ListItemAvatar>
                          <Avatar src={`${apiHost}/img/${member.user_photo}`} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${member.name} ${member.lastname}`}
                          secondary={`ตำแหน่ง: ${member.tm_role}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTeamDialogOpen(false)}>ปิด</Button>
            </DialogActions>
          </Dialog>


        </Grid>

        {/* --- แยกส่วนใหม่: ใช้ Box หรือ Paper ใหม่ --- */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            รายละเอียดเพิ่มเติม
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                วันที่
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Approve Date:', name: 'approveDate' },
                  { label: 'Incoming Date:', name: 'incomingDate' },
                  { label: 'Final Date:', name: 'finalDate' },
                  { label: 'Report Date:', name: 'reportDate' },
                ].map((field) => (
                  <Grid key={field.name}>
                    <DatePicker
                      format="DD/MM/YYYY"
                      label={field.label}
                      value={formData[field.name] ? dayjs(formData[field.name]) : null}
                      onChange={(newValue) => {
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: newValue ? newValue.format('YYYY-MM-DD') : '',
                        }));
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </LocalizationProvider>
        </Box>


        <Box mb={5}>
          <Grid container spacing={2}>
            {/* Direction */}
            <Grid>
              <FormControl component="fieldset" sx={{ mt: 2 }}>
                <FormLabel>Direction</FormLabel>
                <RadioGroup
                  name="direction"
                  value={formData.direction || ''}
                  onChange={handleChange}
                >
                  <FormControlLabel
                    value="CW"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <RotateCw size={30} style={{ color: '#ff9800' }} />
                        CW
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="CCW"
                    control={<Radio />}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <RotateCcw size={30} style={{ color: '#ff9800' }} />
                        CCW
                      </Box>
                    }
                  />
                  <FormControlLabel value="NA" control={<Radio />} label="N/A" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        <Box>
          {/* Note */}
          <Grid>
            <TextField
              fullWidth
              multiline
              minRows={4}
              name="note"
              label="Note (อื่น ๆ):"
              value={formData.note || ''}
              onChange={handleChange}
            />
          </Grid>
        </Box>
        {uploadedImages.length > 0 && (
          <>
            <Box sx={{ mt: 5 }}>
              <Typography variant="h6">รูปที่อัพโหลดแล้ว</Typography>
            </Box>

            <Box
              sx={{
                mt: 2,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              {uploadedImages.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setPhotoIndex(index)}
                  sx={{
                    cursor: 'zoom-in',
                    position: 'relative',
                    width: 120,
                    height: 120,
                    borderRadius: 2,
                    boxShadow: 1,
                    overflow: 'hidden',
                    bgcolor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1,
                  }}
                >
                  <img
                    src={`${apiHost}/img/${img}`}
                    alt={`uploaded-${index}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(img);
                    }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'white',
                      boxShadow: 1,
                      '&:hover': { backgroundColor: '#eee' },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Lightbox
              open={photoIndex >= 0}
              close={() => setPhotoIndex(-1)}
              index={photoIndex}
              slides={uploadedImages.map((img) => ({ src: `${apiHost}/img/${img}` }))}
              plugins={[Counter]}
            />
          </>
        )}

        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Paper
            variant="outlined"
            {...getRootProps()}
            sx={{
              p: 4,
              borderStyle: 'dashed',
              borderRadius: 2, // ขอบกลม
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? '#f0f0f0' : 'transparent',
              transition: 'background-color 0.3s',
              borderColor: '#3f51b5', // สีกรม
            }}
          >
            <input {...getInputProps()} />

            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'ปล่อยไฟล์ตรงนี้' : 'ลากรูปภาพมาวาง หรือคลิกเพื่อเลือก'}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              รองรับไฟล์ .jpg, .png, .gif ขนาดไม่เกิน 5MB
            </Typography>

            <Box>
              <Button variant="contained" color="primary" startIcon={<ImagePlus />}>
                เลือกรูปภาพ
              </Button>
            </Box>
          </Paper>

          {files.length > 0 && (
            <>
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6">Preview before upload</Typography>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2, // ระยะห่างระหว่างกล่องรูป
                }}
              >
                {files.map((file, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      width: '30%',
                      borderRadius: 2,
                      boxShadow: 1,
                      overflow: 'hidden',
                      bgcolor: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1,
                    }}
                  >
                    <img
                      src={file.preview}
                      alt={`preview-${index}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        setFiles((prev) => prev.filter((_, i) => i !== index))
                      }
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'white',
                        boxShadow: 1,
                        '&:hover': { backgroundColor: '#eee' },
                      }}
                    >
                      ×
                    </IconButton>
                  </Box>

                ))}

              </Box>
            </>
          )}

          {formData.stationNow === 'Start' && (
            <Grid container spacing={2} sx={{ mt: 4 }}>
              <Box sx={{ width: '50%', mx: 'auto' }}>
                <FormControl fullWidth>
                  <InputLabel id="station-label">เลือก Station ส่งต่อ</InputLabel>
                  <Select
                    labelId="station-label"
                    name="stationTo" // ✅ ให้สอดคล้องกับ key ใน formData
                    value={formData.stationTo || ''}
                    label="Station"
                    onChange={handleChange} // ✅ ใช้ handler กลางได้เลย
                  >
                    <MenuItem value="" disabled>-- กรุณาเลือก --</MenuItem>
                    <MenuItem value="QA BLANK">ส่ง QA</MenuItem>
                    <MenuItem value="ME">ส่ง ME</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          )}

        </Box>
        {/* ปุ่มอยู่นอก container */}
        <Box textAlign="center" mt={4}>
          {/* <Button
            variant="outlined"
            onClick={handleCancelClick}
            sx={{
              borderColor: '#9e9e9e',
              color: '#9e9e9e',
              px: 4,
              py: 1.5,
              mr: 2,
              '&:hover': {
                borderColor: '#757575',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            ยกเลิกการแก้ไข
          </Button> */}
          <Button
            type="submit"
            variant="contained"
            color="warning"
            size="large"
            startIcon={<SaveIcon />}
          >
            บันทึกและส่งต่อ
          </Button>
          <Box sx={{ width: '75%', mx: 'auto', mt: 4 }}>
            <Alert severity="success">อัพเดทล่าสุดเมื่อ: {formData.dateUpdated} โดย: {formData.byUser}</Alert>
          </Box>
        </Box>
      </Paper>
      <>
        {/* Backdrop loading */}
        <Backdrop open={loading} sx={{ color: '#fff', zIndex: 1300 }}>
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* Snackbar alert */}
        {/* <Snackbar
          open={alert.open}
          autoHideDuration={4000}
          onClose={() => setAlert({ ...alert, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} sx={{ width: '100%' }}>
            {alert.message}
          </Alert>
        </Snackbar> */}
      </>
    </Box>
  );
}
