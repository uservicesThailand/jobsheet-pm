// FullCalendar.jsx — Refactored: TH timezone via Luxon, MUI + MUI X Pickers, robust time handling
// Features
// - FullCalendar with Luxon timezone plugin (Asia/Bangkok)
// - Clean axios instance auto-attaching user_key (header + query/body)
// - Create/Edit via MUI Modal with Date & Time pickers
// - Time defaults safe (09:00) and displayed within slots
// - Events constructed as ISO with +07:00 offset (no drift)
// - Per-day completion bar, right-side list sorted by time
// - Error handling + loading states

import React, { useMemo, useRef, useState, useEffect, forwardRef } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import thLocale from "@fullcalendar/core/locales/th";
import luxonPlugin from "@fullcalendar/luxon3";
import { DateTime } from "luxon";
import { Plus, CheckCircle2, Circle, Trash2, CalendarDays, AlignJustify, Pen, SquarePen, FilePenLine, NotebookPen } from "lucide-react";
import {
    Box,
    Typography,
    Button,
    TextField,
    Paper,
    Divider,
    IconButton,
    LinearProgress,
    Stack,
    Modal,
    CircularProgress,
    Alert,
    Switch,
    FormControlLabel,
    InputAdornment
} from "@mui/material";
import Swal from "sweetalert2";

// MUI X Date/Time pickers
import {
    LocalizationProvider,
    DatePicker as MuiDatePicker,
    TimePicker as MuiTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/th";
import { useTheme, useMediaQuery } from "@mui/material";

const TH_TZ = "Asia/Bangkok";
const apiHost = import.meta.env.VITE_API_HOST;

// ---------- Helpers (timezone-safe via Luxon) ----------
const fmtDateKey = (dateLike) => {
    if (!dateLike) return "";
    const dt = typeof dateLike === "string"
        ? DateTime.fromISO(dateLike, { zone: TH_TZ })
        : DateTime.fromJSDate(dateLike, { zone: TH_TZ });
    if (!dt.isValid) return "";
    return dt.toFormat("yyyy-LL-dd"); // YYYY-MM-DD
};

const fmtHHmmFromISO = (isoLike) => {
    const dt = DateTime.fromISO(String(isoLike), { zone: TH_TZ });
    return dt.isValid ? dt.toFormat("HH:mm") : "";
};

const fmtFullDateTH = (dateLike) => {
    const dt = dateLike instanceof Date
        ? DateTime.fromJSDate(dateLike, { zone: TH_TZ })
        : DateTime.fromISO(String(dateLike), { zone: TH_TZ });
    if (!dt.isValid) return "";
    // Full Thai date (e.g., วันอังคารที่ 13 สิงหาคม 2025)
    return dt.setLocale("th").toLocaleString({ weekday: "long", day: "2-digit", month: "long", year: "numeric" });
};

const buildISOInTH = (dateKey /* YYYY-MM-DD */, hhmm /* HH:mm */) => {
    const t = (hhmm || "00:00").slice(0, 5);
    const dt = DateTime.fromISO(`${dateKey}T${t}`, { zone: TH_TZ });
    return dt.isValid ? dt.toISO() : `${dateKey}T${t}:00+07:00`;
};

const toHHmmss = (t) => {
    if (!t) return "00:00:00";
    return /^\d{2}:\d{2}$/.test(t) ? `${t}:00` : t;
};

// ---------- user_key helpers ----------
const getUserKey = () =>
    sessionStorage.getItem("usvt_user_key") || localStorage.getItem("usvt_user_key") || "";

// ✅ Axios w/ user_key everywhere
const ax = axios.create({ baseURL: apiHost });
ax.interceptors.request.use((config) => {
    const k = getUserKey();
    config.headers = { ...(config.headers || {}) };
    if (k) config.headers["X-User-Key"] = k;
    const method = (config.method || "get").toLowerCase();
    if (method === "get" || method === "delete") {
        config.params = { ...(config.params || {}), user_key: k };
    } else {
        const payload = config.data && typeof config.data === "object" ? config.data : {};
        config.data = { user_key: k, ...payload };
    }
    return config;
});

// ---------- map API -> FullCalendar Event ----------
// API row shape assumed: { id, title, note, date: 'YYYY-MM-DD', time: 'HH:mm[:ss]', status }
const normalizeTimeHHmm = (raw) => {
    if (!raw) return "09:00";
    const hhmm = String(raw).slice(0, 5);
    return (raw === "00:00" || raw === "00:00:00") ? "09:00" : hhmm;
};

const mapApiToEvent = (row) => {
    const isAllDay = row.allDay === 1 || row.allDay === true || !row.time; // ✅ เงื่อนไข all-day
    const dateKey = row.date || fmtDateKey(new Date());
    const hhmm = normalizeTimeHHmm(row.time);

    return {
        id: String(row.id),
        title: row.title,
        start: isAllDay ? `${dateKey}` : buildISOInTH(dateKey, hhmm), // ✅ all-day ใช้ date-only
        allDay: isAllDay, // ✅ ให้ FC รู้
        extendedProps: {
            done: row.status === "done",
            note: row.note || "",
            dateKey,
            hhmm: isAllDay ? "" : hhmm,
        },
    };
};


// ---------- UI Component ----------
export default function FullCalendarPage() {
    const calendarRef = useRef(null);

    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));   // <600px
    const isMdDown = useMediaQuery(theme.breakpoints.down("md")); // <900px
    // ---------------- State
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [newTaskTitle, setNewTaskTitle] = useState("");

    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // form: รองรับ create/edit
    const [form, setForm] = useState({
        mode: "create",
        id: "",
        date: fmtDateKey(new Date()),
        time: "09:00",
        title: "",
        note: "",
        allDay: false,
    });

    // ---------------- Load from API
    useEffect(() => {
        const load = async () => {
            const k = getUserKey();
            if (!k) {
                setLoading(false);
                setError("ไม่พบ user_key (กรุณาเข้าสู่ระบบใหม่)");
                return;
            }
            try {
                const res = await ax.get(`/api/todolist`);
                const list = Array.isArray(res.data) ? res.data : [];
                setEvents(list.map(mapApiToEvent));
            } catch (e) {
                console.error(e);
                setError(e?.response?.data?.error || "โหลดรายการไม่สำเร็จ");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ---------------- Helpers (per-day)
    const selectedKey = useMemo(() => fmtDateKey(selectedDate), [selectedDate]);
    const dayTodos = useMemo(
        () => events.filter((e) => fmtDateKey(e.start) === selectedKey),
        [events, selectedKey]
    );
    const dayTodosSorted = useMemo(
        () => [...dayTodos].sort((a, b) => new Date(a.start) - new Date(b.start)),
        [dayTodos]
    );

    function percentFor(dateObj) {
        const key = fmtDateKey(dateObj);
        const items = events.filter((e) => fmtDateKey(e.start) === key);
        if (!items.length) return 0;
        const done = items.filter((e) => e.extendedProps?.done).length;
        return Math.round((done / items.length) * 100);
    }

    function cryptoRandomId() {
        const bytes = new Uint8Array(8);
        if (window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
        else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
        return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }

    // ---------------- CRUD
    async function addTask(date, title) {
        if (!title?.trim()) return;
        const k = getUserKey();
        if (!k) {
            setError("ไม่พบ user_key (กรุณาเข้าสู่ระบบใหม่)");
            return;
        }
        try {
            const dateKey = fmtDateKey(date);
            const res = await ax.post(`/api/todolist`, {
                title: title.trim(),
                note: "",
                date: dateKey,
                time: "09:00:00",
            });
            const created = res.data || {
                id: cryptoRandomId(),
                title: title.trim(),
                note: "",
                date: dateKey,
                time: "09:00",
                status: "pending",
            };
            setEvents((prev) => [...prev, mapApiToEvent(created)]);
            setNewTaskTitle("");
        } catch (e) {
            console.error(e);
            setError(e?.response?.data?.error || "เพิ่มงานไม่สำเร็จ");
        }
    }

    async function toggleDone(id) {
        const ev = events.find((e) => e.id === id);
        if (!ev) return;
        const nextStatus = ev.extendedProps?.done ? "pending" : "done";
        try {
            await ax.patch(`/api/todolist/${id}/status`, { status: nextStatus });
            setEvents((prev) =>
                prev.map((e) =>
                    e.id === id ? { ...e, extendedProps: { ...e.extendedProps, done: nextStatus === "done" } } : e
                )
            );
        } catch (e) {
            console.error(e);
            setError(e?.response?.data?.error || "อัปเดตสถานะไม่สำเร็จ");
        }
    }

    async function deleteTask(id) {
        try {
            await ax.delete(`/api/todolist/${id}`);
            setEvents((prev) => prev.filter((e) => e.id !== id));
        } catch (e) {
            console.error(e);
            setError(e?.response?.data?.error || "ลบไม่สำเร็จ");
        }
    }

    // ---------------- Calendar handlers
    function onDateClick(arg) {
        setSelectedDate(arg.date);
    }

    const handleOpenCreate = (selectionInfo) => {
        const startISO = selectionInfo?.startStr || selectionInfo?.start;
        const dateKey = fmtDateKey(startISO);
        const t0 = fmtHHmmFromISO(startISO);
        const t = (!t0 || t0 === "00:00") ? "09:00" : t0;

        setForm({
            mode: "create",
            id: "",
            date: dateKey,
            time: t,
            title: "",
            note: "",
            allDay: false,
        });

        setError("");
        setOpen(true);
    };

    const handleOpenEdit = (clickInfo) => {
        const ev = clickInfo.event;
        const startISO = ev.startStr || ev.start;
        const t0 = fmtHHmmFromISO(startISO);
        setForm({
            mode: "edit",
            id: String(ev.id),
            date: fmtDateKey(startISO),
            time: ev.allDay ? "" : (!t0 || t0 === "00:00" ? "09:00" : t0),
            title: ev.title || "",
            note: ev.extendedProps?.note || "",
            allDay: !!ev.allDay, //  boolean
        });
        setError("");
        setOpen(true);
    };

    function renderEventContent(eventInfo) {
        const done = eventInfo.event.extendedProps?.done;
        return (
            <Stack direction="row" spacing={1} alignItems="center">
                {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                <Typography
                    variant="body2"
                    sx={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}
                >
                    {eventInfo.timeText ? `${eventInfo.timeText} ` : ""}
                    {eventInfo.event.title}
                </Typography>
            </Stack>
        );
    }

    function dayCellDidMount(arg) {
        const pct = percentFor(arg.date);
        const bar = document.createElement("div");
        bar.style.marginTop = "2px";
        const fill = document.createElement("div");
        fill.style.height = "4px";
        fill.style.width = pct + "%";
        fill.style.background = pct === 100 ? "#4caf50" : pct >= 50 ? "#ff9800" : "#e0e0e0";
        fill.style.borderRadius = "4px";
        bar.appendChild(fill);
        arg.el.querySelector(".fc-daygrid-day-top")?.appendChild(bar);
    }

    function gotoToday() {
        calendarRef.current?.getApi().today();
        setSelectedDate(new Date());
    }

    // ให้ initialView สลับตามจอ (listWeek บนจอเล็ก, dayGridMonth บนจอใหญ่)
    // ใช้ key ช่วย remount เพื่อให้ initialView ถูกนำไปใช้เมื่อ breakpoint เปลี่ยน
    const fcKey = useMemo(() => {
        return isXs ? "fc-xs" : isMdDown ? "fc-md" : "fc-lg";
    }, [isXs, isMdDown]);

    const headerToolbar = useMemo(() => {
        if (isXs) {
            // มือถือ: ปุ่มน้อยสุด
            return {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth",
            };
        }
        if (isMdDown) {
            // แท็บเล็ต: เอา 2 มุมมอง
            return {
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,listWeek",
            };
        }
        // เดสก์ท็อป: เต็ม
        return {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,listWeek",
        };
    }, [isXs, isMdDown]);

    // ปุ่มข้อความ (ถ้าอยากบังคับเอง; แต่ locale="th" ก็โอเคอยู่แล้ว)
    const buttonText = useMemo(
        () => ({
            today: "วันนี้",
            month: "เดือน",
            week: "สัปดาห์",
            day: "วัน",
            list: "รายการ",
        }),
        []
    );
    // ---------------- Form handlers

    // ✅ ลากแล้วปล่อย (ย้ายวัน/เวลา หรือย้ายเข้า/ออก allDay)
    async function onEventDrop(info) {
        const ev = info.event;

        // วันที่ใหม่
        const newDate = fmtDateKey(ev.startStr || ev.start);

        // คงค่าเดิม
        const keepAllDay = !!ev.allDay;
        const keepTitle = ev.title;
        const keepNote = ev.extendedProps?.note || "";
        const hhmm = keepAllDay
            ? null
            : (() => {
                const t0 = ev.extendedProps?.hhmm || fmtHHmmFromISO(ev.startStr || ev.start);
                return (!t0 || t0 === "00:00") ? "09:00" : t0;
            })();

        const body = {
            title: keepTitle,
            note: keepNote,
            date: newDate,
            time: keepAllDay ? null : toHHmmss(hhmm),
            allDay: keepAllDay ? 1 : 0,
        };

        try {
            await ax.put(`/api/todolist/${ev.id}`, body);

            // อัปเดต state
            setEvents((prev) =>
                prev.map((e) =>
                    e.id === String(ev.id)
                        ? {
                            ...e,
                            start: keepAllDay
                                ? `${newDate}`
                                : buildISOInTH(newDate, (hhmm || "").slice(0, 5)),
                            allDay: keepAllDay,
                            extendedProps: {
                                ...(e.extendedProps || {}),
                                note: keepNote,
                                dateKey: newDate,
                                hhmm: keepAllDay ? "" : (hhmm || "").slice(0, 5),
                            },
                        }
                        : e
                )
            );

            // ✅ แจ้งเตือนสำเร็จด้วย Swal
            Swal.fire({
                icon: "success",
                title: "เปลี่ยนวันที่เรียบร้อยแล้ว",
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            console.error("eventDrop failed:", err);
            info.revert();
            setError(err?.response?.data?.error || "ย้ายวันไม่สำเร็จ");

            Swal.fire({
                icon: "error",
                title: "ย้ายวันไม่สำเร็จ",
                text: err?.response?.data?.error || "",
            });
        }
    }

    const handleClose = () => {
        if (saving) return;
        setOpen(false);
    };
    const handleSave = async () => {
        if (!form.title.trim()) {
            setError("กรุณากรอก Title");
            return;
        }
        setSaving(true);
        setError("");

        const userKey = getUserKey();
        if (!userKey) {
            setSaving(false);
            setError("ไม่พบ user_key (กรุณาเข้าสู่ระบบใหม่)");
            return;
        }

        try {
            if (form.mode === "create") {
                // 🔹 ส่งค่าไปแบ็กเอนด์ให้สอดคล้อง
                const body = {
                    title: form.title,
                    note: form.note,
                    date: form.date,
                    time: form.allDay ? null : toHHmmss(form.time),
                    allDay: form.allDay ? 1 : 0,
                };
                const res = await ax.post(`/api/todolist`, body);

                // ใช้ข้อมูลตอบกลับ ถ้าไม่มีก็ fallback จากฟอร์ม
                const created = res?.data || {
                    id: cryptoRandomId(),
                    title: form.title,
                    note: form.note,
                    date: form.date,
                    time: form.allDay ? null : form.time,
                    status: "pending",
                    allDay: form.allDay ? 1 : 0,
                };

                setEvents((prev) => [...prev, mapApiToEvent(created)]);
            } else {
                // 🔹 PUT: ส่งค่าที่แปลงแล้ว
                const body = {
                    title: form.title,
                    note: form.note,
                    date: form.date,
                    time: form.allDay ? null : toHHmmss(form.time),
                    allDay: form.allDay ? 1 : 0,
                };
                await ax.put(`/api/todolist/${form.id}`, body);

                // 🔹 อัปเดต state ทันทีจากค่าฟอร์ม (แก้บัคต้องกดรีโหลด)
                const isAllDay = !!form.allDay;
                const newStart = isAllDay
                    ? `${form.date}` // all-day ใช้ date-only
                    : buildISOInTH(form.date, form.time.slice(0, 5));

                setEvents((prev) =>
                    prev.map((e) =>
                        e.id === String(form.id)
                            ? {
                                ...e,
                                title: form.title,
                                start: newStart,
                                allDay: isAllDay,
                                extendedProps: {
                                    ...(e.extendedProps || {}),
                                    note: form.note || "",
                                    dateKey: form.date,
                                    hhmm: isAllDay ? "" : form.time.slice(0, 5),
                                },
                            }
                            : e
                    )
                );
            }

            setOpen(false);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.error || "บันทึกไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    };

    // ---------------- JSX
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                    <CalendarDays />
                    <Typography variant="h5" fontWeight={600}>
                        TO DO LIST
                    </Typography>
                    {/* <Button variant="outlined" onClick={gotoToday}>Today</Button> */}
                </Stack>

                {loading && <LinearProgress sx={{ mb: 2 }} />}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
                    {/* Calendar */}
                    <Paper sx={{ flex: 2, p: 2 }}>
                        <FullCalendar
                            editable
                            longPressDelay={300}
                            eventDrop={onEventDrop}
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, luxonPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={headerToolbar}
                            height={740}
                            selectable
                            selectMirror
                            select={handleOpenCreate}
                            dayMaxEvents={3}
                            events={events}
                            eventClick={handleOpenEdit}
                            eventContent={renderEventContent}
                            dateClick={onDateClick}
                            dayCellDidMount={dayCellDidMount}
                            nowIndicator
                            firstDay={1}
                            // ✅ Use IANA timezone directly
                            timeZone={TH_TZ}
                            locales={[thLocale]}
                            locale="th"
                            slotMinTime="06:00:00"
                            slotMaxTime="22:00:00"
                            defaultTimedEventDuration="01:00"
                            eventTimeFormat={{ hour: "2-digit", minute: "2-digit", meridiem: false }}
                        />
                    </Paper>

                    {/* Modal: Create / Edit */}
                    <Modal open={open} onClose={handleClose} aria-labelledby="edit-modal-title" keepMounted>
                        <Box sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "background.paper",
                            boxShadow: 24,
                            p: 3,
                            borderRadius: 2,
                            minWidth: 380,
                            width: 420,
                            maxWidth: "95vw",
                        }}>
                            <Typography id="edit-modal-title" variant="h6" fontWeight={700}>
                                {form.mode === "edit" ? (
                                    <>
                                        <FilePenLine style={{ verticalAlign: "middle", marginRight: 4 }} />
                                        แก้ไขงาน
                                    </>
                                ) : (
                                    <>
                                        <SquarePen style={{ verticalAlign: "middle", marginRight: 4 }} />
                                        สร้างงานใหม่
                                    </>
                                )}
                                {" — "}
                                {form.date} {(!form.allDay && (form.time || "09:00")) && `(${form.time || "09:00"})`}
                            </Typography>


                            <Stack spacing={2} sx={{ mt: 2 }}>
                                {error && <Alert severity="error">{error}</Alert>}

                                <MuiDatePicker
                                    label="วันที่"
                                    value={dayjs(form.date)}
                                    onChange={(v) => {
                                        const dk = v ? v.format("YYYY-MM-DD") : form.date;
                                        setForm((prev) => ({ ...prev, date: dk }));
                                    }}
                                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                                />

                                <MuiTimePicker
                                    label="เวลา"
                                    value={
                                        form.allDay
                                            ? null
                                            : dayjs(`${form.date} ${form.time || "09:00"}`, "YYYY-MM-DD HH:mm")
                                    }
                                    onChange={(v) => {
                                        if (form.allDay) return; // all-day ก็ไม่อัปเดตเวลา
                                        const t = v ? v.format("HH:mm") : form.time;
                                        setForm((prev) => ({ ...prev, time: t }));
                                    }}
                                    disabled={form.allDay}
                                    minutesStep={5}
                                    ampm={false}
                                    slotProps={{
                                        textField: { size: "small" }
                                        ,
                                        actionBar: {
                                            actions: ["accept"], // แสดงเฉพาะปุ่ม OK
                                        },
                                    }}
                                />

                                <TextField
                                    slotProps={
                                        {
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Pen size={18} />
                                                    </InputAdornment>
                                                ),
                                            }
                                        }
                                    }
                                    label="Title"
                                    name="title"
                                    value={form.title}
                                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                    fullWidth
                                    size="small"
                                    autoFocus
                                />
                                <TextField
                                    slotProps={
                                        {
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <AlignJustify size={18} />
                                                    </InputAdornment>
                                                ),
                                            }
                                        }
                                    }
                                    label="Note"
                                    name="note"
                                    value={form.note}
                                    onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                                    fullWidth
                                    size="small"
                                    multiline
                                    minRows={2}
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!form.allDay}
                                            onChange={(e) => {
                                                const on = e.target.checked;
                                                setForm((p) => ({
                                                    ...p,
                                                    allDay: on,
                                                    // ถ้าเปิด all-day ล้างเวลาออกเพื่อไม่ให้โชว์
                                                    // ถ้าปิด all-day แล้วเวลาไม่มี ให้ตั้ง 09:00
                                                    time: on ? "" : (p.time || "09:00"),
                                                }));
                                            }}
                                        />
                                    }
                                    label="ทั้งวัน (ไม่ระบุเวลา)"
                                />


                                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 1 }}>
                                    <Button onClick={handleClose} disabled={saving} variant="text">
                                        ยกเลิก
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        variant="contained"
                                        disabled={saving}
                                        startIcon={saving ? <CircularProgress size={18} /> : null}
                                    >
                                        {saving ? "กำลังบันทึก..." : "บันทึก"}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>
                    </Modal>

                    {/* Right panel */}
                    <Paper sx={{ flex: 1, p: 2, height: "fit-content" }}>
                        <Typography variant="subtitle2">Selected day</Typography>
                        <Typography variant="h6">{fmtFullDateTH(selectedDate)}</Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {percentFor(selectedDate)}% complete
                        </Typography>
                        <LinearProgress variant="determinate" value={percentFor(selectedDate)} sx={{ mb: 2 }} />

                        <Stack direction="row" spacing={1} mb={2}>
                            <TextField
                                slotProps={
                                    {
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <NotebookPen size={18} />
                                                </InputAdornment>
                                            ),
                                        }
                                    }
                                }
                                size="small"
                                fullWidth
                                placeholder="Add a task…"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") addTask(selectedDate, newTaskTitle);
                                }}
                            />
                            <Button variant="contained" onClick={() => addTask(selectedDate, newTaskTitle)} startIcon={<Plus size={16} />}>
                                Add
                            </Button>
                        </Stack>
                        <Divider />

                        <Stack spacing={1} mt={2}>
                            {dayTodosSorted.length === 0 && (
                                <Typography variant="body2" color="secondary">
                                    No tasks for this day yet.
                                </Typography>
                            )}

                            {dayTodosSorted.map((task) => (
                                <Stack
                                    key={task.id}
                                    direction="row"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    sx={{ p: 1, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
                                >
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                        sx={{ cursor: "pointer" }}
                                        onClick={() =>
                                            setOpen(true) ||
                                            setForm({
                                                mode: "edit",
                                                id: String(task.id),
                                                date: fmtDateKey(task.start),
                                                time: (() => {
                                                    const t0 = fmtHHmmFromISO(task.start);
                                                    return task.allDay ? "" : (!t0 || t0 === "00:00" ? "09:00" : t0);
                                                })(), title: task.title,
                                                note: task.extendedProps?.note || "",
                                                allDay: !!task.allDay,
                                            })
                                        }
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleDone(task.id);
                                            }}
                                        >
                                            {task.extendedProps?.done ? <CheckCircle2 /> : <Circle />}
                                        </IconButton>

                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    textDecoration: task.extendedProps?.done ? "line-through" : "none",
                                                    opacity: task.extendedProps?.done ? 0.6 : 1,
                                                }}
                                            >
                                                {!task.allDay && (
                                                    <strong style={{ marginRight: 6 }}>{fmtHHmmFromISO(task.start)}</strong>
                                                )}
                                                {task.title}
                                            </Typography>
                                            {task.extendedProps?.note && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {task.extendedProps.note}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Stack>

                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteTask(task.id);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </IconButton>
                                </Stack>
                            ))}
                        </Stack>
                    </Paper>
                </Stack>
            </Box>
        </LocalizationProvider>
    );
}
