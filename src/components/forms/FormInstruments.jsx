import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  TextField, Chip, Paper, Table, TableBody, TableCell, Alert,
  TableContainer, TableHead, TableRow, TablePagination, Grid, IconButton, Stack
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import axios from 'axios';
import SaveButton from '../button/SaveButton';
import dayjs from 'dayjs';

export default function FormInstruments({ data, keyName, userKey, inspNo, inspSV }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ทำให้เป็น array เสมอ
  const savedInstruments = Array.isArray(data) ? data : (data ? [data] : []);

  const apiHost = import.meta.env.VITE_API_HOST;
  const userBranch = (sessionStorage.getItem('usvt_branch') || '').replace(/^U/, '');

  const fetchOptions = async () => {
    try {
      const res = await axios.get(`${apiHost}/api/certificates`, {
        params: { branch: userBranch }
      });
      setOptions(res.data);
    } catch (error) {
      console.error("Error loading certificates:", error);
    }
  };

  useEffect(() => {
    if (open) fetchOptions();
  }, [open]);

  const handleSelect = (item) => {
    const exists = selected.find(sel => sel.lc_no === item.lc_no);
    if (exists) {
      setSelected(prev => prev.filter(sel => sel.lc_no !== item.lc_no));
    } else {
      setSelected(prev => [...prev, item]);
    }
  };

  const handleRemove = (lc_no) => {
    setSelected(prev => prev.filter(sel => sel.lc_no !== lc_no));
  };

  const isSelected = (lc_no) => selected.some(item => item.lc_no === lc_no);

  const filtered = options.filter((opt) => {
    const keyword = searchText.toLowerCase();
    return (
      (opt.lc_equipment_name || '').toLowerCase().includes(keyword) ||
      (opt.lc_no || '').toLowerCase().includes(keyword) ||
      (opt.lc_band || '').toLowerCase().includes(keyword) ||
      (opt.lc_model || '').toLowerCase().includes(keyword) ||
      (opt.lc_serial || '').toLowerCase().includes(keyword) ||
      (opt.lc_certificate || '').toLowerCase().includes(keyword) ||
      (opt.lc_tracable || '').toLowerCase().includes(keyword)
    );
  });

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paginatedRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Alert severity="secondary">ID: ISM (ใช้ในการตรวจสอบ) </Alert>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        {/* แสดงรายการที่เลือก (โชว์ทุกฟิลด์) */}
        <Box mb={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">
              รายการอุปกรณ์ที่บันทึกแล้ว ({savedInstruments.length})
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
              เพิ่มรายการ
            </Button>
          </Stack>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }} mb={2}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>ชื่ออุปกรณ์</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Model</TableCell>
                  <TableCell>Serial</TableCell>
                  <TableCell>Certificate</TableCell>
                  <TableCell>No</TableCell>
                  <TableCell>Tracable</TableCell>
                  <TableCell>อัปเดทล่าสุด</TableCell>
                  <TableCell>โดย</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedInstruments.map((row, idx) => (
                  <TableRow key={row.ins_id || idx} hover>
                    <TableCell align="center">{idx + 1}</TableCell>
                    <TableCell>{row.ins_equipment_name || '-'}</TableCell>
                    <TableCell>{row.ins_band || '-'}</TableCell>
                    <TableCell>{row.ins_model || '-'}</TableCell>
                    <TableCell>{row.ins_serial || '-'}</TableCell>
                    <TableCell>{row.ins_certificate || '-'}</TableCell>
                    <TableCell>{row.ins_no || '-'}</TableCell>
                    <TableCell>{row.ins_tracable || '-'}</TableCell>
                    <TableCell>
                      {row.updated_at
                        ? dayjs(row.updated_at).format('DD MMM YYYY HH:mm')
                        : row.created_at
                          ? dayjs(row.created_at).format('DD MMM YYYY HH:mm')
                          : '-'}
                    </TableCell>
                    <TableCell>
                      {[row.name, row.lastname].filter(Boolean).join(' ') || '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {selected.map((row, idx) => (
                  <TableRow key={row.lc_no || idx} hover>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleRemove(row.lc_no)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell>{row.lc_equipment_name || '-'}</TableCell>
                    <TableCell>{row.lc_band || '-'}</TableCell>
                    <TableCell>{row.lc_model || '-'}</TableCell>
                    <TableCell>{row.lc_serial || '-'}</TableCell>
                    <TableCell>{row.lc_no || '-'}</TableCell>
                    <TableCell>{row.lc_certificate || '-'}</TableCell>
                    <TableCell>{row.lc_tracable || '-'}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <hr />
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1} mt={1}>
            <Typography variant="subtitle1">
              รายการเพิ่มใหม่ ({selected.length})
            </Typography>
            {selected.length > 0 && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={() => setSelected([])}
              >
                ล้างทั้งหมด
              </Button>
            )}
          </Stack>
        </Box>

        <Grid item xs={12} sx={{ mt: 2 }} textAlign="center">
          <SaveButton />
          <Box sx={{ width: '75%', mx: 'auto', mt: 4 }}>
            <Alert severity="success">อัพเดทล่าสุดเมื่อ:  โดย: </Alert>
          </Box>
        </Grid>

        {/* Dialog: เลือกรายการทั้งหมด */}
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg">
          <DialogTitle>เลือกรายการอุปกรณ์ (เลือกแล้ว {selected.length})</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              variant="outlined"
              label="ค้นหาอุปกรณ์จากชื่อ, รุ่น, Serial ฯลฯ"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ my: 2 }}
            />

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ชื่ออุปกรณ์</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Serial</TableCell>
                    <TableCell>LC No</TableCell>
                    <TableCell>Certificate</TableCell>
                    <TableCell>Tracable</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows.map((row, idx) => (
                    <TableRow
                      key={row.lc_no || idx}
                      hover
                      onClick={() => handleSelect(row)}
                      selected={isSelected(row.lc_no)}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isSelected(row.lc_no) ? '#e3f2fd' : 'inherit'
                      }}
                    >
                      <TableCell>{row.lc_equipment_name}</TableCell>
                      <TableCell>{row.lc_band}</TableCell>
                      <TableCell>{row.lc_model}</TableCell>
                      <TableCell>{row.lc_serial}</TableCell>
                      <TableCell>{row.lc_no}</TableCell>
                      <TableCell>{row.lc_certificate}</TableCell>
                      <TableCell>{row.lc_tracable}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </TableContainer>

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button variant="contained" onClick={() => setOpen(false)}>
                ยืนยันการเลือก
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Paper>
    </>
  );
}
