import React, { useMemo, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Grid,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Button,
    Stack,
    Chip,
    Typography,
    Tooltip,
    IconButton,
} from "@mui/material";
import { AlertTriangle, Bug, Save, Upload, X, Network, Laptop, Server, ShieldAlert } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import axios from "axios";
import Swal from "sweetalert2";

dayjs.locale("th");

// ✅ ปรับให้เหมาะกับโปรเจกต์จริง
const API = import.meta.env.VITE_API_HOST; // e.g. https://api.example.com
const ENDPOINT = `${API}/api/it/issues`; // backend จะทำทีหลัง

const CATEGORIES = [
    { key: "software", label: "ซอฟต์แวร์/แอป", icon: <Bug size={16} /> },
    { key: "hardware", label: "ฮาร์ดแวร์/อุปกรณ์", icon: <Laptop size={16} /> },
    { key: "network", label: "เครือข่าย/อินเทอร์เน็ต", icon: <Network size={16} /> },
    { key: "server", label: "เซิร์ฟเวอร์/บริการกลาง", icon: <Server size={16} /> },
    { key: "security", label: "ความปลอดภัย", icon: <ShieldAlert size={16} /> },
];

const SEVERITIES = [
    { key: "low", label: "ต่ำ" },
    { key: "medium", label: "ปานกลาง" },
    { key: "high", label: "สูง" },
    { key: "critical", label: "วิกฤติ" },
];

const IMPACTS = [
    { key: "single", label: "กระทบผู้ใช้คนเดียว" },
    { key: "team", label: "กระทบทั้งทีม/แผนก" },
    { key: "branch", label: "กระทบทั้งสาขา" },
    { key: "company", label: "กระทบทั้งบริษัท" },
];

export default function ReportIssue() {
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "software",
        severity: "medium",
        impact: "single",
        branch: sessionStorage.getItem("usvt_branch") || "",
        location: "",
        insp_no: "", // ผูกกับ jobsheet ถ้ามี
        device: "", // รุ่น/ทรัพย์สิน/asset tag
        os: "",
        browser: "",
        network_type: "",
        happened_at: dayjs().format("YYYY-MM-DDTHH:mm"),
        expected: "",
        actual: "",
        repro_steps: "",
        contact_name: sessionStorage.getItem("usvt_user_name") || "",
        contact_phone: sessionStorage.getItem("usvt_user_phone") || "",
        contact_email: sessionStorage.getItem("usvt_user_email") || "",
        user_key: sessionStorage.getItem("usvt_user_key") || "",
    });

    const canSubmit = useMemo(() => {
        return (
            form.title.trim().length >= 6 &&
            form.description.trim().length >= 10 &&
            !!form.severity &&
            !!form.category
        );
    }, [form]);

    const onChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

    const onFileChange = (e) => {
        const list = Array.from(e.target.files || []);
        setFiles(list);
    };

    const removeFileAt = (idx) => setFiles((arr) => arr.filter((_, i) => i !== idx));

    const handleSubmit = async () => {
        if (!canSubmit) {
            Swal.fire({ icon: "warning", title: "กรอกข้อมูลยังไม่ครบ", text: "กรุณาใส่หัวข้ออย่างน้อย 6 ตัวอักษร และคำอธิบายไม่น้อยกว่า 10 ตัวอักษร" });
            return;
        }

        try {
            setLoading(true);

            // ✅ เตรียม payload เบื้องต้น (ไฟล์ไว้ต่อทีหลัง)
            const payload = { ...form, attachments_count: files.length, source: "web" };

            // 
            // ▶️ หมายเหตุ: ตอนยังไม่มี backend ให้คอมเมนต์บรรทัด axios.post แล้ว mock แทน
            // const res = await axios.post(ENDPOINT, payload, { headers: { "X-User-Key": form.user_key || "unknown" } });
            // const data = res.data;

            // MOCK SUCCESS: จำลองเลข ticket
            const data = { success: true, issue_id: Math.floor(Math.random() * 900000 + 100000), message: "mock" };

            if (data?.success) {
                await Swal.fire({ icon: "success", title: "บันทึกคำร้องเรียบร้อย", html: `หมายเลขเหตุขัดข้อง: <b>#${data.issue_id}</b>` });
                // เคลียร์ฟอร์ม
                setForm((s) => ({
                    ...s,
                    title: "",
                    description: "",
                    expected: "",
                    actual: "",
                    repro_steps: "",
                }));
                setFiles([]);
            } else {
                throw new Error(data?.error || "บันทึกไม่สำเร็จ");
            }
        } catch (err) {
            // ❗ ถ้า backend ส่ง error: ใช้ Swal แล้วคงหน้าไว้ ไม่ปิดฟอร์ม
            Swal.fire({
                icon: "error",
                title: "บันทึกไม่สำเร็จ",
                text: err?.response?.data?.error || err?.message || "เกิดข้อผิดพลาดไม่ทราบสาเหตุ",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={2}>
            <Card variant="outlined" className="shadow-lg">
                <CardHeader
                    title={
                        <Stack direction="row" spacing={1} alignItems="center">
                            <AlertTriangle size={20} />
                            <Typography variant="h6">แจ้งอาการระบบมีปัญหา</Typography>
                        </Stack>
                    }
                    subheader="บันทึกเหตุขัดข้องเพื่อให้ทีมงานตรวจสอบและแก้ไขได้เร็วขึ้น"
                />
                <Divider />
                <CardContent>
                    <Grid container spacing={2}>
                        {/* ซ้าย */}
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Stack spacing={2}>
                                <TextField
                                    label="หัวข้อปัญหา"
                                    value={form.title}
                                    onChange={onChange("title")}
                                    placeholder="เช่น เปิด Jobsheet ไม่ได้, แอปค้าง, พิมพ์ใบงานไม่ออก"
                                    required
                                    fullWidth
                                />

                                <TextField
                                    label="รายละเอียดอาการ"
                                    value={form.description}
                                    onChange={onChange("description")}
                                    placeholder="เล่าให้ละเอียด: เกิดตอนกี่โมง กดปุ่มไหนแล้วขึ้นข้อความว่าอะไร เกิดซ้ำได้ยังไง"
                                    multiline
                                    minRows={5}
                                    fullWidth
                                    required
                                />

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    <FormControl fullWidth>
                                        <InputLabel>หมวดหมู่</InputLabel>
                                        <Select label="หมวดหมู่" value={form.category} onChange={onChange("category")}>
                                            {CATEGORIES.map((c) => (
                                                <MenuItem key={c.key} value={c.key}>
                                                    <Stack direction="row" spacing={1} alignItems="center">{c.icon}<span>{c.label}</span></Stack>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth>
                                        <InputLabel>ความรุนแรง</InputLabel>
                                        <Select label="ความรุนแรง" value={form.severity} onChange={onChange("severity")}>
                                            {SEVERITIES.map((s) => (
                                                <MenuItem key={s.key} value={s.key}>{s.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Stack>

                                <FormControl fullWidth>
                                    <InputLabel>ผลกระทบ</InputLabel>
                                    <Select label="ผลกระทบ" value={form.impact} onChange={onChange("impact")}>
                                        {IMPACTS.map((i) => (
                                            <MenuItem key={i.key} value={i.key}>{i.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    <TextField label="หมายเลขใบงาน (insp_no)" value={form.insp_no} onChange={onChange("insp_no")} fullWidth />
                                    <TextField label="สาขา" value={form.branch} onChange={onChange("branch")} fullWidth />
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    <TextField label="อุปกรณ์/ทรัพย์สิน (เช่น Asset Tag)" value={form.device} onChange={onChange("device")} fullWidth />
                                    <TextField label="ระบบปฏิบัติการ" value={form.os} onChange={onChange("os")} fullWidth />
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    <TextField label="เบราว์เซอร์/แอปเวอร์ชัน" value={form.browser} onChange={onChange("browser")} fullWidth />
                                    <TextField label="ชนิดเครือข่าย (LAN/Wi‑Fi/4G)" value={form.network_type} onChange={onChange("network_type")} fullWidth />
                                </Stack>

                                <TextField
                                    type="datetime-local"
                                    label="เกิดเหตุเมื่อ"
                                    value={form.happened_at}
                                    onChange={onChange("happened_at")}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />

                                <TextField label="คาดหวังให้เกิดอะไร (Expected)" value={form.expected} onChange={onChange("expected")} fullWidth />
                                <TextField label="ผลลัพธ์ที่เกิดจริง (Actual)" value={form.actual} onChange={onChange("actual")} fullWidth />
                                <TextField label="ขั้นตอนทำให้เกิด (Repro Steps)" value={form.repro_steps} onChange={onChange("repro_steps")} fullWidth multiline minRows={3} />

                                {/* แนบไฟล์ภาพ/วิดีโอ/เอกสาร */}
                                <Stack spacing={1}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Button component="label" variant="outlined" startIcon={<Upload size={16} />}>
                                            แนบไฟล์ประกอบ
                                            <input type="file" hidden multiple onChange={onFileChange} />
                                        </Button>
                                        {files.length > 0 && <Typography variant="body2">{files.length} ไฟล์</Typography>}
                                    </Stack>
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {files.map((f, i) => (
                                            <Chip key={i} label={f.name} onDelete={() => removeFileAt(i)} />
                                        ))}
                                    </Stack>
                                </Stack>
                            </Stack>
                        </Grid>

                        {/* ขวา */}
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Stack spacing={2}>
                                <Card variant="outlined">
                                    <CardHeader title="ข้อมูลติดต่อผู้แจ้ง" />
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <TextField label="ชื่อผู้ติดต่อ" value={form.contact_name} onChange={onChange("contact_name")} fullWidth />
                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                                <TextField label="เบอร์โทร" value={form.contact_phone} onChange={onChange("contact_phone")} fullWidth />
                                                <TextField type="email" label="อีเมล" value={form.contact_email} onChange={onChange("contact_email")} fullWidth />
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                <Card variant="outlined">
                                    <CardHeader title="พรีวิวข้อมูลที่จะส่ง" />
                                    <CardContent>
                                        <Box component="pre" sx={{ p: 2, bgcolor: "background.default", borderRadius: 2, maxHeight: 260, overflow: "auto", fontSize: 12 }}>
                                            {JSON.stringify({ ...form, attachments_count: files.length }, null, 2)}
                                        </Box>
                                    </CardContent>
                                </Card>

                                <Stack direction="row" spacing={1}>
                                    <Button disabled={!canSubmit || loading} startIcon={<Save size={16} />} variant="contained" onClick={handleSubmit}>
                                        ส่งคำร้อง
                                    </Button>
                                    <Tooltip title="ล้างฟอร์ม">
                                        <IconButton onClick={() => { setForm((s) => ({ ...s, title: "", description: "", expected: "", actual: "", repro_steps: "" })); setFiles([]); }}>
                                            <X />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>

                                {!canSubmit && (
                                    <Typography variant="caption" color="text.secondary">
                                        * ต้องมีหัวข้ออย่างน้อย 6 ตัวอักษร และรายละเอียดอย่างน้อย 10 ตัวอักษร
                                    </Typography>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
}
