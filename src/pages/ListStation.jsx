// ✅ ปรับใหม่ทั้งหมด: เพิ่ม Search + Pagination + Sort + Scroll
import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import {
    Box,
    Breadcrumbs,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    MenuItem,
    Snackbar,
    Alert,
    Link,
    Button,
    Modal,
    Stack,
    Chip,
    TableSortLabel,
    Tabs, Tab,
    ButtonGroup,
    Tooltip,
    Grid,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    InputAdornment
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Tag, CheckCircle, Send, ArrowRightFromLine, Users, ClipboardList, Search } from "lucide-react";
import dayjs from "dayjs";
import ModalTimeline from "../components/ModalTimeline";
import { useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';
import SendReceiveModal from '../components/SendReceiveModal';
import { Input } from "postcss";
import { useTranslation } from "react-i18next";
import Swal from 'sweetalert2';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const configMap = {
    QA: {
        label: 'QA',
        stations: ['QA BLANK', 'QA Incoming', 'QA Final', 'QA Approve'],
        endpoint: '/api/StepQA',
    },
    ME: {
        label: 'ME',
        stations: ['ME', 'ME Final'],
        endpoint: '/api/StepME',
    },
    PLANNING: {
        label: 'Planning',
        stations: ['PLANNING'],
        endpoint: '/api/StepPlanning',
    },
    CS: {
        label: 'CS',
        stations: ['CS', 'CS Prove'],
        endpoint: '/api/StepCS',
    },
    QC: {
        label: 'QC',
        stations: ['QC Incoming', 'QC Final'],
        endpoint: '/api/StepQC',
    },
};

// ─── ช่วยแยกค่ามาใช้เรียง ──────────────────────────────────────────────
function getProcessedValue(row, field) {
    switch (field) {
        case 'motorName':
            return row.trp_motor_name || row.insp_motor_name || '';
        case 'customerName':
            return row.trp_customer_name || row.insp_customer_name || '';
        case 'saleQuote':
            return row.trp_sale_quote || row.insp_sale_quote || '';
        case 'insp_created_at':
            return row.insp_created_at || '';
        default:
            return row[field] ?? '';
    }
}
function valueForSort(row, orderBy) {
    const v = getProcessedValue(row, orderBy);
    if (orderBy === 'insp_created_at') {
        const ts = new Date(v).getTime();
        return Number.isFinite(ts) ? ts : 0;
    }
    if (typeof v === 'number') return v;
    const n = Number(v);
    if (!Number.isNaN(n) && v !== '') return n;
    return String(v).toLowerCase();
}
function descendingComparator(a, b, orderBy) {
    const valA = valueForSort(a, orderBy);
    const valB = valueForSort(b, orderBy);
    if (valB < valA) return -1;
    if (valB > valA) return 1;
    return 0;
}
function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}


// ─── เพิ่ม rank สถานะมาก่อนเสมอ ────────────────────────────────────────
function applySortFilter(data, comparator, query, rankFn) {
    const filtered = query
        ? data.filter(row =>
            Object.values(row).some(v =>
                String(v).toLowerCase().includes(query.toLowerCase())
            )
        )
        : data;

    return [...filtered].sort((a, b) => {
        const ra = rankFn ? rankFn(a) : 0;
        const rb = rankFn ? rankFn(b) : 0;
        if (ra !== rb) return ra - rb;        // เรียงตามสถานะก่อน
        const comp = comparator(a, b);        // แล้วค่อยเรียงตามคอลัมน์ที่เลือก
        if (comp !== 0) return comp;
        return 0;
    });
}

export default function ListStation() {
    const query = useQuery();
    const stationKey = (query.get("List") || "QA").toUpperCase();
    const config = configMap[stationKey] || configMap.QA;

    const { stations: stationMap, endpoint: endpointPath, label: stationLabel } = config;
    const apiHost = import.meta.env.VITE_API_HOST;
    const apiEndpoint = `${apiHost}${endpointPath}`;


    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('insp_created_at');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openPopup, setOpenPopup] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [stations, setStations] = useState([]);
    const [stationFrom, setStationFrom] = useState("");

    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertSeverity, setAlertSeverity] = useState("success");
    const [selectedStationList, setSelectedStationList] = useState('');
    const [selectedId, setSelectedId] = useState(null);

    const tableRef = useRef(null);
    /* ---------------------- เก็บทีมสมาชิก */
    const [teamDetails, setTeamDetails] = useState([]);
    const [teamDialogOpen, setTeamDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const branch = sessionStorage.getItem('usvt_branch') || '';




    const fetchTeamDetails = async () => {
        try {
            const res = await axios.get(`${apiHost}/api/teams/members`, {
                params: { branch }
            });
            setTeamDetails(res.data);
        } catch (err) {
            console.error('โหลดข้อมูลทีมล้มเหลว:', err);
        }
    };

    useEffect(() => {
        fetchTeamDetails();
    }, []);
    /* ----------------- */
    useEffect(() => {
        setLoading(true);
        axios.get(apiEndpoint, { params: { branch } })
            .then(res => setData(res.data))
            .catch(err => console.error(`Fetch ${stationKey} error:`, err))
            .finally(() => setLoading(false));
    }, [apiEndpoint, branch]);

    const handleGoDashboard = () => {
        setLoading(true);
        // simulate delay หรือรอจน navigate สำเร็จ
        setTimeout(() => {
            navigate('/');
        }, 500); // หรือเปลี่ยนเป็น await หากต้องการ handle async จริง
    };


    const [tabValue, setTabValue] = useState(0);
    const selectedStation = stationMap[tabValue];
    // ✅ คีย์สถานีที่เลือก ใช้เทียบ now/prev
    const targetKey = selectedStation.toLowerCase().replace(/\s+/g, '');

    // ✅ จัดอันดับสถานะ: 0 = ยังไม่รับ (อยู่สถานีนี้และยังไม่ accept)
    // 1 = ส่งออกไปแล้ว (prev = สถานีนี้), 2 = อื่น ๆ
    const statusRank = (row) => {
        const now = (row.insp_station_now || '').toLowerCase().replace(/\s+/g, '');
        const prev = (row.insp_station_prev || '').toLowerCase().replace(/\s+/g, '');
        const accepted = Number(row.insp_station_accept) || 0;

        if (now === targetKey && accepted === 0) return 0; // ยังไม่รับ → บนสุด
        if (prev === targetKey) return 1;                  // ส่งออก → ลำดับถัดมา
        return 2;                                          // ที่เหลือ
    };

    const tabFilteredData = useMemo(() => {
        const filtered = data.filter(d => {
            const now = d.insp_station_now?.toLowerCase().replace(/\s+/g, '');
            const prev = d.insp_station_prev?.toLowerCase().replace(/\s+/g, '');
            return now === targetKey || prev === targetKey;
        });
        // ✅ ส่ง statusRank เข้าไป เพื่อจัดลำดับสถานะก่อน
        return applySortFilter(filtered, getComparator(order, orderBy), searchQuery, statusRank);
    }, [data, order, orderBy, searchQuery, tabValue, targetKey]);



    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleOpenPopup = (row) => {
        setStationFrom(row.insp_station_now);
        setSelectedRow(row);
        setSelectedStationList('');
        axios.get(`${apiHost}/api/list_station`).then(res => setStations(res.data));
        setOpenPopup(true);
    };



    const handleReciveStation = (row) => {
        axios.post(`${apiHost}/api/accept_station`, {
            insp_id: row.insp_id,
            user_id: sessionStorage.getItem("usvt_user_key") || "unknown"
        }).then(() => {

            /*  setAlertSeverity("success");
             setAlertMessage(`รับงาน ${row.insp_service_order || 'SV'} สำเร็จ`);
             setAlertOpen(true); */
            // ✅ ส่ง branch ไปด้วย

            axios.get(apiEndpoint, { params: { branch } })
                .then(res => setData(res.data))
                .catch(err => console.error(`Fetch after accept error:`, err));

            return Swal.fire({
                icon: 'success',
                title: `รหัสงาน: ${row.insp_no}`,
                text: `รับงาน ${row.insp_service_order || 'SV'} สำเร็จ`,
                confirmButtonText: 'ตกลง',
                showDenyButton: true,
                denyButtonText: 'ดูข้อมูล',
                reverseButtons: true,
                allowOutsideClick: false,
            })
        })
            .then((result) => {
                if (result?.isDenied) {
                    navigate(`/inspection/${row.insp_no}?from=${stationLabel}`);
                    // TODO: คุณลิ้งก์ไปหน้า detail เองที่นี่
                    // e.g. navigate(`/job/${row.insp_id}`)
                }
            }).catch((err) => {
                console.error("Error accepting station:", err);
                /* setAlertSeverity("error");
                setAlertMessage(err.response?.data?.error || "เกิดข้อผิดพลาดขณะรับงาน");
                setAlertOpen(true); */
            });
    }

    const [timelineOpen, setTimelineOpen] = useState(false);

    const handleOpenTimeline = (inspID) => {
        setSelectedId(inspID);
        setTimelineOpen(true);
    };
    const stationCounts = stationMap.map(st => {
        const target = st.toLowerCase().replace(/\s+/g, '');
        const nowCount = data.filter(d => d.insp_station_now?.toLowerCase().replace(/\s+/g, '') === target).length;
        const prevCount = data.filter(d => d.insp_station_prev?.toLowerCase().replace(/\s+/g, '') === target).length;
        return { now: nowCount, prev: prevCount };
    });


    const filteredData = useMemo(
        () => applySortFilter(data, getComparator(order, orderBy), searchQuery),
        [data, order, orderBy, searchQuery]
    );

    const tabVisibleRows = useMemo(
        () => tabFilteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [tabFilteredData, page, rowsPerPage]
    );

    return (
        <Box p={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, pt: 3 }}>
                <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight={600}>
                    ย้อนกลับ
                </Typography>
            </Box>
            <Box p={2}>
                <Breadcrumbs separator="›">
                    <Link underline="hover" color="inherit" component="button" onClick={handleGoDashboard}>
                        Dashboard
                    </Link>
                    <Typography color="primary">{stationLabel} List</Typography>
                </Breadcrumbs>
                {loading && <LinearProgress sx={{ mb: 1 }} />}

                <Typography variant="h6" gutterBottom mt={2}><ClipboardList /> รายการ {stationLabel}</Typography>
                <TextField
                    slotProps={
                        {
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} />
                                    </InputAdornment>
                                ),
                            }
                        }
                    }
                    label="ค้นหา..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth sx={{ mb: 2 }}
                />
            </Box>
            <Tabs
                value={tabValue}
                onChange={(e, newValue) => {
                    setTabValue(newValue);
                    setPage(0);
                }}
                indicatorColor="primary"
                textColor="primary"
                sx={{ mb: 2 }}
            >
                {stationMap.map((label, index) => (
                    <Tab
                        key={label}
                        label={`${label} (${stationCounts[index].now})`}
                    />
                ))}
            </Tabs>
            <TableContainer ref={tableRef} component={Paper}>
                <Table >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel active={orderBy === 'motorName'} direction={order} onClick={(e) => handleRequestSort(e, 'motorName')}>
                                    {t("table.motor")}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center">
                                <TableSortLabel active={orderBy === 'insp_service_order'} direction={order} onClick={(e) => handleRequestSort(e, 'insp_service_order')}>
                                    {t("table.serviceId")}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel active={orderBy === 'saleQuote'} direction={order} onClick={(e) => handleRequestSort(e, 'saleQuote')}>
                                    {t("table.projectNo")}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center">{t("table.team")}</TableCell>
                            <TableCell>{t("table.tagNo")}</TableCell>
                            <TableCell> {t("table.power")}</TableCell>
                            <TableCell>
                                <TableSortLabel active={orderBy === 'customerName'} direction={order} onClick={(e) => handleRequestSort(e, 'customerName')}>
                                    {t("table.customer")}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center">{t("table.prev")}</TableCell>
                            <TableCell align="center">{t("table.next")}</TableCell>
                            <TableCell>
                                <TableSortLabel active={orderBy === 'insp_created_at'} direction={order} onClick={(e) => handleRequestSort(e, 'insp_created_at')}>
                                    {t("table.createdAt")}
                                </TableSortLabel>
                            </TableCell>
                            {/* <TableCell>สถานะ</TableCell> */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tabVisibleRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center" sx={{ py: 3, fontWeight: 'bold', color: 'secondary' }}>
                                    {t("table.noResultFound")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            tabVisibleRows.map((row) => {
                                const motorName = row.trp_motor_name || row.insp_motor_name || '-';
                                const serviceOrder = row.insp_service_order || '-';
                                const saleQuote = row.trp_sale_quote || row.insp_sale_quote || '-';
                                const customerName = row.trp_customer_name || row.insp_customer_name || '-';
                                const tagNo = row.trp_tag_no || '-';
                                const team = row.trp_team || '-';
                                return (
                                    <TableRow
                                        key={row.insp_id}
                                        hover
                                        sx={{
                                            borderLeft: row.insp_urgent == 1 ? '6px solid red' : 'none',
                                            backgroundColor: row.insp_urgent == 1 ? '#f8d2d2ff' : 'inherit',
                                        }}
                                    >
                                        <TableCell
                                            sx={{
                                                maxWidth: '20px',
                                                width: '20px',
                                                wordBreak: 'break-word',
                                                whiteSpace: 'normal',
                                                lineHeight: 1.2,
                                                fontSize: '0.75rem',
                                            }}
                                        >
                                            {motorName}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                color="primary"
                                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', fontWeight: 'medium' }}
                                                onClick={() => navigate(`/inspection/${row.insp_no}?from=${stationLabel}`)}
                                            >
                                                {serviceOrder}
                                            </Button>
                                        </TableCell>
                                        <TableCell>{saleQuote}</TableCell>
                                        <TableCell align="center">
                                            {team !== '-' ? (
                                                <Chip
                                                    label={team}
                                                    sx={{
                                                        bgcolor: teamDetails.find(t => t.team_name === team)?.team_color || 'gray',
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold'
                                                    }}
                                                    onClick={() => {
                                                        setSelectedTeam(team);
                                                        setTeamDialogOpen(true);
                                                    }}
                                                />
                                            ) : (
                                                '-'
                                            )}
                                        </TableCell>
                                        <TableCell>{tagNo}</TableCell>
                                        <TableCell>{'รอเชื่อม'}</TableCell>
                                        <TableCell>{customerName}</TableCell>
                                        <TableCell align="center">
                                            {row.insp_station_now === selectedStation && row.insp_station_accept == 0 && (
                                                <Chip
                                                    onClick={() => handleOpenTimeline(row.insp_id)}
                                                    label={`${row.insp_station_prev}`}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            {row.insp_station_prev === selectedStation && (
                                                <Chip
                                                    onClick={() => handleOpenTimeline(row.insp_id)}
                                                    label={row.insp_station_now || '-'}
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 'medium' }}
                                                />
                                            )}
                                            {row.insp_station_now === selectedStation && (
                                                <ButtonGroup variant="outlined" aria-label="Basic button group">
                                                    {row.insp_station_accept == 0 && (
                                                        <Button color="success" onClick={() => handleReciveStation(row)} startIcon={<CheckCircle size={18} />}>รับ</Button>
                                                    )}
                                                    <Tooltip title="ต้องรับก่อนถึงจะส่งได้" disableHoverListener={row.insp_station_accept !== 0}>
                                                        <span>
                                                            <Button
                                                                disabled={row.insp_station_accept == 0}
                                                                onClick={() => handleOpenPopup(row)}
                                                                variant="contained"
                                                                color="primary"
                                                                startIcon={<Send size={18} />}
                                                            >
                                                                ส่ง
                                                            </Button>
                                                        </span>
                                                    </Tooltip>
                                                </ButtonGroup>
                                            )}
                                        </TableCell>
                                        <TableCell>{dayjs(row.insp_created_at).format("DD/MM/YYYY HH:mm") + ' น.'}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* ฝั่งปุ่ม Station History (ซ่อนใน Chip แล้ว) */}
            <Grid textAlign={{ xs: 'left', sm: 'right' }}>
                <ModalTimeline
                    open={timelineOpen}
                    onClose={() => setTimelineOpen(false)}
                    inspID={selectedId}
                />
            </Grid>
            <TablePagination
                component="div"
                count={tabFilteredData.length}
                page={page}
                onPageChange={(e, newPage) => {
                    setPage(newPage);
                    if (tableRef.current) tableRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 20]}
            />

            {/* <Snackbar open={alertOpen} autoHideDuration={3000} onClose={() => setAlertOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} variant="filled">{alertMessage}</Alert>
            </Snackbar> */}

            <SendReceiveModal
                open={openPopup}
                onClose={() => setOpenPopup(false)}
                row={selectedRow}
                onSuccess={() => {
                    const branch = sessionStorage.getItem('usvt_branch') || '';
                    // โหลดข้อมูลใหม่เฉพาะบางแถว หรือทั้ง list
                    axios.get(apiEndpoint, { params: { branch } }).then(res => setData(res.data));
                }}
            />

            <Dialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)} fullWidth>
                <DialogTitle component="div">
                    <Typography color="warning" variant="h6" component="h2"><Users /> {selectedTeam}</Typography>
                </DialogTitle>
                <DialogContent dividers>
                    {teamDetails
                        .filter(m => m.team_name === selectedTeam)
                        .map((member, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar src={
                                    member.user_photo
                                        ? `${apiHost}/img/${member.user_photo}`
                                        : 'logo2.png'
                                }
                                    sx={{ mr: 2 }} />
                                <Box>
                                    <Typography>{member.name} {member.lastname}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        ตำแหน่ง: {member.tm_role}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    {teamDetails.filter(m => m.team_name === selectedTeam).length === 0 && (
                        <Typography color="text.secondary">ไม่พบสมาชิกในทีมนี้</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTeamDialogOpen(false)}>ปิด</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );

}