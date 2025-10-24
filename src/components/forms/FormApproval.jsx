// FormApproval.jsx
import * as React from "react";
import {
  Box, Card, CardContent, CardHeader, Divider, Grid, Stack,
  TextField, Button, Typography, Tooltip
} from "@mui/material";
import { Save as SaveIcon, Upload as UploadIcon, Eraser } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import axios from "axios";
import SaveButton from "../button/SaveButton";
import Swal from "sweetalert2";

dayjs.locale("th");

/** ───────────────────── SignatureBox (Canvas) ───────────────────── */
function SignatureBox({ value, onChange, height = 120, apiHost }) {
  const canvasRef = React.useRef(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  React.useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#111"; ctx.lineWidth = 2;
    if (value) {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      // ประกอบ URL ให้เหมาะกับรูปแบบที่รับมา
      const isData = typeof value === 'string' && value.startsWith('data:image/');
      const isAbs = typeof value === 'string' && /^https?:\/\//.test(value);
      const isPath = typeof value === 'string' && value.startsWith('/uploads/');
      const isFile = typeof value === 'string' && !isData && !isAbs && !isPath;
      const src =
        isData ? value
          : isAbs ? value
            : isPath ? `${apiHost}${value}`
              : isFile ? `${apiHost}/uploads/signatures/${value}`
                : value;
      img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height);
      img.src = src;
    }
  }, [value]);

  const getPos = (e) => {
    const c = canvasRef.current; const rect = c.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x, y };
  };
  const start = (e) => { setIsDrawing(true); const { x, y } = getPos(e); const ctx = canvasRef.current.getContext("2d"); ctx.beginPath(); ctx.moveTo(x, y); };
  const move = (e) => { if (!isDrawing) return; const { x, y } = getPos(e); const ctx = canvasRef.current.getContext("2d"); ctx.lineTo(x, y); ctx.stroke(); };
  const end = () => { if (!isDrawing) return; setIsDrawing(false); onChange?.(canvasRef.current.toDataURL("image/png")); };
  const onClear = () => { const c = canvasRef.current; const ctx = c.getContext("2d"); ctx.clearRect(0, 0, c.width, c.height); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); onChange?.(""); };
  const onUpload = (e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => onChange?.(r.result); r.readAsDataURL(f); };

  return (
    <Stack spacing={1}>
      <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 2, bgcolor: "#fff", overflow: "hidden", touchAction: "none" }}>
        <canvas
          ref={canvasRef} width={800} height={height} style={{ width: "100%", height }}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
      </Box>
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" startIcon={<Eraser size={16} />} onClick={onClear}>ล้างลายเซ็น</Button>
        {/* <Button size="small" variant="outlined" component="label" startIcon={<UploadIcon size={16} />}>
          อัปโหลดภาพ
          <input type="file" accept="image/*" hidden onChange={onUpload} />
        </Button> */}
      </Stack>
    </Stack>
  );
}

/** ───────────────────── Helper: normalize data จาก DB → state ───────────────────── */
const normalizeApproval = (src = {}) => {
  const pick = (a, b) => (a ?? b ?? null);
  const normDate = (v) => {
    if (!v) return null;
    const d = dayjs(v); return d.isValid() ? d.toISOString() : null;
  };
  return {
    incoming_name: pick(src.incoming_name, src.elec_incoming_name),
    incoming_date: normDate(pick(src.incoming_date, src.elec_incoming_date)),
    incoming_sign: pick(src.incoming_sign, src.incoming_sign_url),

    final_name: pick(src.final_name, src.elec_final_name),
    final_date: normDate(pick(src.final_date, src.elec_final_date)),
    final_sign: pick(src.final_sign, src.final_sign_url),

    mech_name: pick(src.mech_name, src.mechanical_name),
    mech_date: normDate(pick(src.mech_date, src.mechanical_date)),
    mech_sign: pick(src.mech_sign, src.mech_sign_url),

    approve_name: pick(src.approve_name, src.approved_name),
    approve_date: normDate(pick(src.approve_date, src.approved_date)),
    approve_sign: pick(src.approve_sign, src.approve_sign_url),
  };
};

export default function FormApproval({
  data,            // ← ก้อนจาก DB (endpoint GET)
  defaultValues,   // (สำรอง)
  onSaved,         // callback หลังบันทึกสำเร็จ (resData) (ถ้ามี)
  apiHost = import.meta.env.VITE_API_HOST,
  apiMode = "approval", // "approval" | "lines"
  userKey,         // ← ผู้บันทึก (จะส่งใน header)
  inspNo,          // ← map เป็น insp_no ทั้งใน URL และ payload
  inspSV,          // ← ถ้าต้องการส่งประกอบ (เช่นบันทึกสายบริการ)
}) {
  const [saving, setSaving] = React.useState(false);
  const [f, setF] = React.useState({
    incoming_name: "", incoming_date: null, incoming_sign: "",
    final_name: "", final_date: null, final_sign: "",
    mech_name: "", mech_date: null, mech_sign: "",
    approve_name: "", approve_date: null, approve_sign: "",
    ...(normalizeApproval(defaultValues)),
  });

  // hydrate เมื่อ data/defaultValues เปลี่ยน
  React.useEffect(() => {
    const merged = normalizeApproval(data || defaultValues || {});
    setF((p) => ({ ...p, ...merged }));
  }, [data, defaultValues]);

  const bind = (key) => ({
    value: f[key] ?? "",
    onChange: (e) => setF((p) => ({ ...p, [key]: e.target.value })),
  });

  const bindDate = (key) => ({
    value: f[key] ? dayjs(f[key]) : null,
    onChange: (v) => setF((p) => ({ ...p, [key]: v ? v.toISOString() : null })),
    slotProps: { textField: { size: "small", fullWidth: true } },
    format: "DD/MM/YYYY",
  });

  const buildApprovalPayload = () => ({
    insp_no: inspNo ?? null,
    ...(inspSV ? { insp_sv: inspSV } : {}),   // ✅ map ลงคอลัมน์ insp_sv
    incoming_name: f.incoming_name,
    incoming_date: f.incoming_date,           // ISO string ที่คุณเซ็ตจาก DatePicker
    incoming_sign: f.incoming_sign,           // base64 หรือ URL

    final_name: f.final_name,
    final_date: f.final_date,
    final_sign: f.final_sign,

    mech_name: f.mech_name,
    mech_date: f.mech_date,
    mech_sign: f.mech_sign,

    approve_name: f.approve_name,
    approve_date: f.approve_date,
    approve_sign: f.approve_sign,
  });


  // สำหรับโหมด normalized (form_sign_line): แปลงเป็น array ของบทบาท
  const buildLinesPayload = () => {
    const lines = [];
    const push = (role, name, date, sign) => lines.push({
      insp_no: inspNo ?? null,
      sig_role: role,
      sig_name: name || null,
      sig_signed_at: date || null,
      sig_image_base64: sign || null,   // ให้ backend รับ base64 แล้วแปลงเป็นไฟล์/URL
      ...(inspSV ? { insp_sv: inspSV } : {}),
    });
    push("elec_incoming", f.incoming_name, f.incoming_date, f.incoming_sign);
    push("elec_final", f.final_name, f.final_date, f.final_sign);
    push("mech_inspected", f.mech_name, f.mech_date, f.mech_sign);
    push("elec_approved", f.approve_name, f.approve_date, f.approve_sign);
    return { insp_no: inspNo ?? null, lines };
  };
  // 2) ยิง POST ไป backend
  const doPost = async () => {
    const url = `${apiHost}/api/forms/FormApproval/${encodeURIComponent(inspNo)}`;
    const headers = {
      "Content-Type": "application/json",
      "user_key": userKey ?? "",      // ✅ ผู้บันทึก
      "X-User-Key": userKey ?? "",    // (สำรอง ให้เข้ากับ backend เดิม)
    };
    const payload = buildApprovalPayload();
    const res = await axios.post(url, payload, { headers });
    return res.data; // คาดหวังให้ backend คืนก้อนล่าสุดกลับมา (โครงเดียวกับ GET)
  };


  const onSubmit = async (e) => {
    e?.preventDefault();
    if (!inspNo) { alert("ขาด inspNo"); return; }
    if (!userKey) { alert("ขาด userKey"); return; }

    setSaving(true);
    try {
      const resData = await doPost();

      if (resData) {
        // hydrate ฟอร์มให้แก้ต่อได้ (ถ้าต้องการ)
        const normalized = normalizeApproval(resData);
        setF((p) => ({ ...p, ...normalized }));

        // แจ้ง parent ว่าบันทึกเสร็จ (ถ้ามี)
        onSaved?.(resData);

        // ✅ แจ้งสำเร็จด้วย SweetAlert แล้วค่อยรีเฟรชเมื่อกด OK
        await Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: `สร้างรายการสำเร็จ`,/* (หมายเลขอ้างอิง: ${resData.form_ref ?? resData.approval_no ?? inspNo}) */
          confirmButtonText: 'OK'
        });

        // รีเฟรชหน้า 1 รอบ
        window.location.reload();
        return; // กันโค้ดด้านล่างรันต่อ (เผื่อมีอะไรตามมา)
      }
    } catch (e) {
      console.error("POST FormApproval error:", e);

      // แจ้ง error ด้วย SweetAlert ให้สอดคล้องกับ success
      await Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: e?.response?.data?.error || 'เกิดข้อผิดพลาดระหว่างบันทึก',
        confirmButtonText: 'ปิด'
      });
    } finally {
      setSaving(false);
    }

  };


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <Box component="form" onSubmit={onSubmit}>   {/* ⬅️ ห่อเป็นฟอร์ม */}
          <CardHeader
            sx={{ pb: 0, "& .MuiCardHeader-title": { fontWeight: 700, color: "primary.main" } }}
          />
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }} color="warning">
              ELECTRICAL TESTED BY
            </Typography>
            <Grid container spacing={2}>
              {/* Incoming */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardHeader title="Incoming" sx={{ py: 1.5, "& .MuiCardHeader-title": { fontSize: 16, fontWeight: 700 } }} />
                  <CardContent sx={{ pt: 0 }}>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12 }}>
                        <TextField variant="standard" {...bind("incoming_name")} size="small" fullWidth label="ชื่อผู้ตรวจสอบ" />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <DatePicker label="วันที่" {...bindDate("incoming_date")} />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <SignatureBox apiHost={apiHost} value={f.incoming_sign} onChange={(v) => setF((p) => ({ ...p, incoming_sign: v }))} />                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Final */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardHeader title="Final" sx={{ py: 1.5, "& .MuiCardHeader-title": { fontSize: 16, fontWeight: 700 } }} />
                  <CardContent sx={{ pt: 0 }}>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12 }}>
                        <TextField variant="standard" {...bind("final_name")} size="small" fullWidth label="ชื่อผู้ตรวจสอบ" />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <DatePicker label="วันที่" {...bindDate("final_date")} />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <SignatureBox apiHost={apiHost} value={f.final_sign} onChange={(v) => setF((p) => ({ ...p, final_sign: v }))} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              {/* MECHANICAL */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }} color="warning">
                  MECHANICAL INSPECTED BY
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField variant="standard" {...bind("mech_name")} size="small" fullWidth label="ชื่อผู้ตรวจสอบ" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <DatePicker label="วันที่" {...bindDate("mech_date")} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <SignatureBox apiHost={apiHost} value={f.mech_sign} onChange={(v) => setF((p) => ({ ...p, mech_sign: v }))} />
                  </Grid>
                </Grid>
              </Grid>

              {/* APPROVED */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }} color="warning">
                  ELECTRICAL APPROVED BY
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField variant="standard" {...bind("approve_name")} size="small" fullWidth label="ชื่อผู้อนุมัติ" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <DatePicker label="วันที่" {...bindDate("approve_date")} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <SignatureBox apiHost={apiHost} value={f.approve_sign} onChange={(v) => setF((p) => ({ ...p, approve_sign: v }))} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }} justifyContent="flex-end">
              <Tooltip title="บันทึก">
                <span>
                  <SaveButton
                    startIcon={<SaveIcon size={16} />}
                    disabled={saving}
                    loading={saving}
                  />
                </span>
              </Tooltip>
            </Stack>
          </CardContent>
        </Box>
      </Card>
    </LocalizationProvider>
  );
}
