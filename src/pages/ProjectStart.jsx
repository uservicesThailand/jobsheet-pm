import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Modal,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Backdrop,
    CircularProgress,
    Button,
    TextField,
    MenuItem,
    Breadcrumbs,
    Link,
    LinearProgress,
    Chip,
    InputAdornment
} from "@mui/material";
import { Plus, FolderOpen, Search } from 'lucide-react';
import InspectionPopup from "../components/InspectionPopup";
import LoadingMechanic from "../components/LoadingBackdrop";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    p: 4,
    borderRadius: 2,
    textAlign: "center",
    boxShadow: 24,
};
import { useNavigate } from "react-router-dom";

export default function ProjectStart() {
    const navigate = useNavigate();
    const [navigating, setNavigating] = useState(false);

    //import
    const apiHost = import.meta.env.VITE_API_HOST;

    if (!apiHost) {
        console.warn("API host is not defined. Please check your .env file.");
    }

    const userBranch = sessionStorage.getItem("usvt_branch") || "";

    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    /* -------เลือกวันที่ดรอปดาว---------- */
    const today = new Date();

    const [selectedMonth, setSelectedMonth] = useState(
        String(today.getMonth() + 1).padStart(2, '0')
    );
    const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));
    /* ----------------- */

    const [searchText, setSearchText] = useState("");
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("number");

    useEffect(() => {
        const fetchFilteredYearData = async () => {
            setLoading(true);
            try {
                const res = await axios.post(`${apiHost}/api/bc/data`, {
                    year: selectedYear,
                    month: selectedMonth,
                    branch: userBranch,
                });
                setData(res.data ?? []);
            } catch (err) {
                console.error("โหลดข้อมูลปีใหม่ไม่สำเร็จ:", err);
                setError("ไม่สามารถโหลดข้อมูลสำหรับปีนี้ได้");
            } finally {
                setLoading(false);
            }
        };
        fetchFilteredYearData();
    }, [selectedYear, selectedMonth]); // ✅ โหลดใหม่เมื่อเปลี่ยนปี

    useEffect(() => {
        setPage(0);
    }, [selectedMonth, selectedYear, searchText]);

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const sortData = (array, comparator) => {
        const stabilized = array.map((el, index) => [el, index]);
        stabilized.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilized.map((el) => el[0]);
    };

    const getComparator = (order, orderBy) => {
        return order === "desc"
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    };

    const descendingComparator = (a, b, orderBy) => {
        const valA = a[orderBy] ?? "";
        const valB = b[orderBy] ?? "";
        if (typeof valA === "number" && typeof valB === "number") return valB - valA;
        return valB.toString().localeCompare(valA.toString());
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => `${currentYear - i}`);

    /* const months = [
        { value: '01', label: 'มกราคม' },
        { value: '02', label: 'กุมภาพันธ์' },
        { value: '03', label: 'มีนาคม' },
        { value: '04', label: 'เมษายน' },
        { value: '05', label: 'พฤษภาคม' },
        { value: '06', label: 'มิถุนายน' },
        { value: '07', label: 'กรกฎาคม' },
        { value: '08', label: 'สิงหาคม' },
        { value: '09', label: 'กันยายน' },
        { value: '10', label: 'ตุลาคม' },
        { value: '11', label: 'พฤศจิกายน' },
        { value: '12', label: 'ธันวาคม' }
    ]; */

    const monthNames = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];

    const months = monthNames.map((name, index) => {
        const value = String(index + 1).padStart(2, '0');
        return { value, label: `${value} - ${name}` };
    });


    useEffect(() => {
        const filtered = data.filter((row) => {
            const keyword = searchText.toLowerCase();
            return (
                row.Name?.toLowerCase().includes(keyword) ||
                row.Ref_Sales_Quote_No?.toLowerCase().includes(keyword) ||
                row.No?.toLowerCase().includes(keyword)
            );
        });

        setFilteredData(filtered);
    }, [data, searchText, selectedMonth, selectedYear]);


    return (
        <Box sx={{ padding: 4 }}>
            <LoadingMechanic open={loading} message={'กำลังเรียกข้อมูลจาก BC ....'} />

            {error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <>
                    {/* Breadcrumbs */}
                    <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ mb: 2 }}>
                        <Link
                            underline="hover"
                            color="inherit"
                            component="button"
                            onClick={() => {
                                setNavigating(true);
                                setTimeout(() => navigate("/"), 300); // simulate navigation delay
                            }}
                        >
                            Dashboard
                        </Link>
                        <Typography color="primary">เริ่มต้นโครงการ</Typography>
                    </Breadcrumbs>
                    {navigating && <LinearProgress sx={{ mb: 2 }} />}

                    <Box mb={2} display="flex" justifyContent="space-between" flexWrap="wrap" gap={2}>
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
                            label="ค้นหา (ชื่อบริษัท / Sale Quote / Order)"
                            variant="outlined"
                            size="small"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            sx={{ width: 400 }}
                        />
                        <Box display="flex" gap={2}>
                            <TextField
                                select
                                label="เดือน"
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                size="small"
                                sx={{ minWidth: 120 }}
                            >

                                <MenuItem value="">ทั้งหมด</MenuItem>
                                {months.map((m) => (
                                    <MenuItem key={m.value} value={m.value}>
                                        {m.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="ปี"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                size="small"
                                sx={{ minWidth: 120 }}
                            >
                                {/* <MenuItem value="">ทั้งหมด</MenuItem> */}
                                {years.map((y) => (
                                    <MenuItem key={y} value={y}>{y}</MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Box>
                    {/* จำนวนทั้งหมด */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        พบทั้งหมด {filteredData.length} รายการ
                    </Typography>

                    <TableContainer
                        component={Paper}
                        sx={{
                            borderRadius: 2,
                            boxShadow: 3,
                            overflowX: 'auto',
                        }}
                    >
                        <Table
                            size="medium"
                            sx={{
                                '& th, & td': {
                                    fontSize: '0.95rem',
                                    p: 1, // ไม่มี padding ด้านใน
                                },
                            }}
                        >
                            <TableHead sx={{ backgroundColor: 'grey.100' }}>
                                <TableRow>
                                    {[
                                        { id: 'num', label: '#' },
                                        { id: 'Name', label: 'Customer Name' },
                                        { id: 'Ref_Sales_Quote_No', label: 'Sale Quote' },
                                        { id: 'No', label: 'Service Order' },
                                        { id: 'Priority', label: 'Priority' },
                                        { id: 'Service_Order_Type', label: 'Type' },
                                        { id: 'Order_Date', label: 'วันที่เอกสาร' },
                                        { id: 'action', label: 'Action', align: 'center' },
                                    ].map((column) => (
                                        <TableCell
                                            key={column.id}
                                            align={column.align || 'left'}
                                            sortDirection={orderBy === column.id ? order : false}
                                            sx={{
                                                fontWeight: 'bold',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            <TableSortLabel
                                                active={column.id !== 'action' && column.id !== 'num' && orderBy === column.id}
                                                direction={orderBy === column.id ? order : 'asc'}
                                                onClick={() =>
                                                    column.id !== 'action' &&
                                                    column.id !== 'num' &&
                                                    handleRequestSort(column.id)
                                                }
                                            >
                                                {column.label}
                                            </TableSortLabel>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {sortData(filteredData, getComparator(order, orderBy))
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => (
                                        <TableRow
                                            key={index}
                                            hover
                                            sx={{
                                                borderBottom: '1px solid #e0e0e0',
                                            }}
                                        >
                                            <TableCell>{filteredData.length - (page * rowsPerPage + index)}</TableCell>
                                            <TableCell>{row.Name}</TableCell>
                                            <TableCell>{row.Ref_Sales_Quote_No}</TableCell>
                                            <TableCell>{row.No}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.Priority || '-'}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor:
                                                            row.Priority === 'High'
                                                                ? '#d32f2f'
                                                                : row.Priority === 'Medium'
                                                                    ? '#ed6c02'
                                                                    : '#90a4ae',
                                                        color: '#fff',
                                                        fontWeight: 'bold',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>{row.Service_Order_Type}</TableCell>
                                            <TableCell>{row.Order_Date}</TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    variant="outlined"
                                                    size="medium"
                                                    onClick={() => {
                                                        setSelectedRow(row);
                                                        setPopupOpen(true);
                                                    }}
                                                    startIcon={<FolderOpen />}
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: 'medium',
                                                        px: 3,
                                                    }}
                                                >
                                                    Open
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        component="div"
                        count={filteredData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                    <InspectionPopup
                        open={popupOpen}
                        rowData={selectedRow}
                        onClose={async (didSave, inspNo) => { // ✅ เพิ่ม inspNo
                            setPopupOpen(false);
                            if (didSave && inspNo) {
                                navigate(`/inspection/${inspNo}?from=start`); // ✅ ไปหน้ารายละเอียด inspection
                            }
                            /* if (didSave) {
                                setLoading(true); // แสดง loading ขณะโหลดใหม่
                                try {
                                    const res = await axios.get(`${apiHost}/api/bc/data`);
                                    setData(res.data ?? []);
                                } catch (error) {
                                    console.error("Reload failed:", error);
                                    setError("ไม่สามารถโหลดข้อมูลล่าสุดได้");
                                } finally {
                                    setLoading(false);
                                }
                            } */
                        }}
                    />


                </>

            )}
        </Box>

    );
}
