import React from 'react';
import {
  Box, Paper, Grid, Typography, FormControl, Input, InputAdornment, FormHelperText, MenuItem, InputLabel, Select,
  Table, TableContainer, TableHead, TableRow, TableCell, TableBody, TextField, useMediaQuery,
  Radio, RadioGroup, FormLabel, FormControlLabel, Alert, Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaveButton from "../button/SaveButton";

export default function FormStaticTest({ data, keyName, userKey, inspNo }) {
  const [resistanceUnit, setResistanceUnit] = React.useState("Ω");
  const [inductanceUnit, setInductanceUnit] = React.useState("mH");
  const [resistanceFinalUnit, setResistanceFinalUnit] = React.useState("Ω");
  const [inductanceFinalUnit, setInductanceFinalUnit] = React.useState("H");
  const [insulationIncomingUnit, setInsulationIncomingUnit] = React.useState("MΩ");
  const [insulationFinalUnit, setInsulationFinalUnit] = React.useState("MΩ");

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const SectionWrapper = ({ children }) => (
    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</Grid>
  );

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 1, sm: 1 }, maxWidth: '100%', mx: 'auto' }}>
      <Alert severity="info">รอเชื่อมต่อและสร้าง API</Alert>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Resistance & Inductance (Incoming) */}
          <Grid size={{ sm: 12, md: 6 }}>

            <Grid size={{ sm: 12, md: 6 }}>
              <FormControl variant="standard" sx={{ m: 1, mt: 3, width: '25ch' }}>
                <Input type='number' endAdornment={<InputAdornment position="end">°C</InputAdornment>} />
                <FormHelperText>Ambient Temperature ; Incoming :</FormHelperText>
              </FormControl>
            </Grid>

            <Grid size={{ sm: 12, md: 6 }}>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel>เลือกวงจร</InputLabel>
                <Select label="เลือกวงจร" value={'-'}>
                  <MenuItem value='-'>-</MenuItem>
                  <MenuItem value='A'>A</MenuItem>
                  <MenuItem value='Delta'>Delta</MenuItem>
                  <MenuItem value='Star'>Star</MenuItem>
                  <MenuItem value='3Line'>3 เส้น</MenuItem>
                  <MenuItem value='Star-Delta'>Star-Delta</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8cbd0' }}>
                    <TableCell align="center" colSpan={2}><b>Resistance (Incoming)</b></TableCell>
                    <TableCell align="center" colSpan={2}><b>Inductance Test (Incoming)</b></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><b>Marking</b></TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span><b>Values</b></span>
                        <Select value={resistanceUnit} onChange={(e) => setResistanceUnit(e.target.value)} size="small">
                          <MenuItem value="Ω">Ω</MenuItem>
                          <MenuItem value="mΩ">mΩ</MenuItem>
                          <MenuItem value="MΩ">MΩ</MenuItem>
                          <MenuItem value="μΩ">μΩ</MenuItem>
                          <MenuItem value="GΩ">GΩ</MenuItem>
                        </Select>
                      </Box>
                    </TableCell>
                    <TableCell><b>Marking</b></TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span><b>Values</b></span>
                        <Select value={inductanceUnit} onChange={(e) => setInductanceUnit(e.target.value)} size="small">
                          <MenuItem value="mH">mH</MenuItem>
                          <MenuItem value="H">H</MenuItem>
                          <MenuItem value="MH">MH</MenuItem>
                          <MenuItem value="μH">μH</MenuItem>
                        </Select>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {["U1-U2", "V1-V2", "W1-W2"].map((mark, i) => (
                    <TableRow key={i}>
                      <TableCell><TextField defaultValue={mark} fullWidth /></TableCell>
                      <TableCell><TextField defaultValue="5.0" fullWidth /></TableCell>
                      <TableCell><TextField fullWidth /></TableCell>
                      <TableCell><TextField fullWidth /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Resistance & Inductance (Final) */}
          <Grid size={{ sm: 12, md: 6 }}>
            <Grid size={{ sm: 12, md: 6 }}>
              <FormControl variant="standard" sx={{ m: 1, mt: 3, width: '25ch' }}>
                <Input type='number' endAdornment={<InputAdornment position="end">°C</InputAdornment>} />
                <FormHelperText>Ambient Temperature ; Final :</FormHelperText>
              </FormControl>
            </Grid>
            <Grid size={{ sm: 12, md: 6 }}>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel>เลือกวงจร</InputLabel>
                <Select label="เลือกวงจร" value={'-'}>
                  <MenuItem value='-'>-</MenuItem>
                  <MenuItem value='A'>A</MenuItem>
                  <MenuItem value='Delta'>Delta</MenuItem>
                  <MenuItem value='Star'>Star</MenuItem>
                  <MenuItem value='3Line'>3 เส้น</MenuItem>
                  <MenuItem value='Star-Delta'>Star-Delta</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#b6f7b6' }}>
                    <TableCell align="center" colSpan={2}><b>Resistance (Final)</b></TableCell>
                    <TableCell align="center" colSpan={2}><b>Inductance Test (Final)</b></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><b>Marking</b></TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span><b>Values</b></span>
                        <Select value={resistanceUnit} onChange={(e) => setResistanceUnit(e.target.value)} size="small">
                          <MenuItem value="Ω">Ω</MenuItem>
                          <MenuItem value="mΩ">mΩ</MenuItem>
                          <MenuItem value="MΩ">MΩ</MenuItem>
                          <MenuItem value="μΩ">μΩ</MenuItem>
                          <MenuItem value="GΩ">GΩ</MenuItem>
                        </Select>
                      </Box>
                    </TableCell>
                    <TableCell><b>Marking</b></TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span><b>Values</b></span>
                        <Select value={inductanceFinalUnit} onChange={(e) => setInductanceFinalUnit(e.target.value)} size="small">
                          <MenuItem value="mH">mH</MenuItem>
                          <MenuItem value="H">H</MenuItem>
                          <MenuItem value="MH">MH</MenuItem>
                          <MenuItem value="μH">μH</MenuItem>
                        </Select>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><TextField fullWidth /></TableCell>
                      <TableCell><TextField fullWidth /></TableCell>
                      <TableCell><TextField fullWidth /></TableCell>
                      <TableCell><TextField fullWidth /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Insulation (Incoming) */}
          <Grid size={{ sm: 12, md: 6 }}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8cbd0' }}>
                    <TableCell colSpan={5} align='center'><b>Insulation(Incoming)</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Volt(Vdc.)</b></TableCell>
                    <TableCell><b>Marking</b></TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span><b>At 1 min.</b></span>
                        <Select value={resistanceUnit} onChange={(e) => setResistanceUnit(e.target.value)} size="small">
                          <MenuItem value="Ω">Ω</MenuItem>
                          <MenuItem value="mΩ">mΩ</MenuItem>
                          <MenuItem value="MΩ">MΩ</MenuItem>
                          <MenuItem value="μΩ">μΩ</MenuItem>
                          <MenuItem value="GΩ">GΩ</MenuItem>
                        </Select>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span><b>At 10 min.</b></span>
                        <Select value={resistanceUnit} onChange={(e) => setResistanceUnit(e.target.value)} size="small">
                          <MenuItem value="Ω">Ω</MenuItem>
                          <MenuItem value="mΩ">mΩ</MenuItem>
                          <MenuItem value="MΩ">MΩ</MenuItem>
                          <MenuItem value="μΩ">μΩ</MenuItem>
                          <MenuItem value="GΩ">GΩ</MenuItem>
                        </Select>
                      </Box>
                    </TableCell>
                    <TableCell>PI</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell rowSpan={4}>
                      <TextField defaultValue="500" fullWidth multiline rows={4} />
                    </TableCell>
                    <TableCell>
                      <TextField defaultValue="U1-V1" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <TextField defaultValue="U1-W1" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <TextField defaultValue="V1-W1" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <TextField defaultValue="Phase - Earth" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={2}><b>Min. Insulation Recommend</b></TableCell>
                    <TableCell colSpan={3}>
                      <TextField defaultValue=">100 MΩ" fullWidth />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Insulation (Final) */}
          <Grid size={{ sm: 12, md: 6 }}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#b6f7b6' }}>
                    <TableCell colSpan={5} align='center'>Insulation(Final)</TableCell>
                  </TableRow>
                </TableHead>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Volt(Vdc.)</b></TableCell>
                    <TableCell><b>Marking</b></TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span><b>At 1 min.</b></span>
                        <Select value={resistanceUnit} onChange={(e) => setResistanceUnit(e.target.value)} size="small">
                          <MenuItem value="Ω">Ω</MenuItem>
                          <MenuItem value="mΩ">mΩ</MenuItem>
                          <MenuItem value="MΩ">MΩ</MenuItem>
                          <MenuItem value="μΩ">μΩ</MenuItem>
                          <MenuItem value="GΩ">GΩ</MenuItem>
                        </Select>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <span><b>At 10 min.</b></span>
                        <Select value={resistanceUnit} onChange={(e) => setResistanceUnit(e.target.value)} size="small">
                          <MenuItem value="Ω">Ω</MenuItem>
                          <MenuItem value="mΩ">mΩ</MenuItem>
                          <MenuItem value="MΩ">MΩ</MenuItem>
                          <MenuItem value="μΩ">μΩ</MenuItem>
                          <MenuItem value="GΩ">GΩ</MenuItem>
                        </Select>
                      </Box>
                    </TableCell>
                    <TableCell>PI</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell rowSpan={4}>
                      <TextField defaultValue="500" fullWidth multiline rows={4} />
                    </TableCell>
                    <TableCell>
                      <TextField defaultValue="U1-V1" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    {/* Volt cell ข้ามแล้ว */}
                    <TableCell>
                      <TextField defaultValue="U1-W1" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <TextField defaultValue="V1-W1" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <TextField defaultValue="Phase - Earth" fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={2}><b>Polarization Index Recommend</b></TableCell>
                    <TableCell colSpan={3}>
                      <TextField defaultValue="2-5" fullWidth />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

          </Grid>

          {/* ทดสอบคลื่นไฟ */}
          <Grid size={{ sm: 12, md: 12 }}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#b6d8f7ff' }}>
                    <TableCell colSpan={1} align='center'>Volt(kVdc.)</TableCell>
                    <TableCell colSpan={2} align='center'>SURGE COMPARISON TEST WAVE FORM</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  <TableRow>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      Incoming
                    </TableCell>
                    <TableCell>
                      <FormControl>
                        <RadioGroup>
                          <Box display="flex" alignItems="center" gap={1}>
                            <FormControlLabel value="N/A" control={<Radio />} label="N/A" />
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            <FormControlLabel value="Good" control={<Radio />} label="Good" />
                            <img src="/img/sc01.png" style={{ width: 50 }} alt="Good" />
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            <FormControlLabel value="Ground" control={<Radio />} label="Ground" />
                            <img src="/img/sc02.png" style={{ width: 50 }} alt="Ground" />
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            <FormControlLabel value="Short turn" control={<Radio />} label="Short turn" />
                            <img src="/img/sc03.png" style={{ width: 50 }} alt="Short turn" />
                          </Box>

                          <Box display="flex" alignItems="center" gap={1}>
                            <FormControlLabel value="Short Phase" control={<Radio />} label="Short Phase" />
                            <img src="/img/sc04.png" style={{ width: 50 }} alt="Short Phase" />
                          </Box>
                        </RadioGroup>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <TextField fullWidth />
                    </TableCell>
                    <TableCell>
                      Final
                    </TableCell>
                    <TableCell>
                      <FormControl>
                        <RadioGroup>
                          <RadioGroup>
                            <Box display="flex" alignItems="center" gap={1}>
                              <FormControlLabel value="N/A" control={<Radio />} label="N/A" />
                            </Box>

                            <Box display="flex" alignItems="center" gap={1}>
                              <FormControlLabel value="Good" control={<Radio />} label="Good" />
                              <img src="/img/sc01.png" style={{ width: 50 }} alt="Good" />
                            </Box>

                            <Box display="flex" alignItems="center" gap={1}>
                              <FormControlLabel value="Ground" control={<Radio />} label="Ground" />
                              <img src="/img/sc02.png" style={{ width: 50 }} alt="Ground" />
                            </Box>

                            <Box display="flex" alignItems="center" gap={1}>
                              <FormControlLabel value="Short turn" control={<Radio />} label="Short turn" />
                              <img src="/img/sc03.png" style={{ width: 50 }} alt="Short turn" />
                            </Box>

                            <Box display="flex" alignItems="center" gap={1}>
                              <FormControlLabel value="Short Phase" control={<Radio />} label="Short Phase" />
                              <img src="/img/sc04.png" style={{ width: 50 }} alt="Short Phase" />
                            </Box>
                          </RadioGroup>
                        </RadioGroup>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

          </Grid>
        </Grid>
        <Grid size={12} mt={3}>
          <TextField
            fullWidth
            label="Note (อื่นๆ):"
            multiline
            rows={4}
          />
        </Grid>
        <Box textAlign="center" mt={4}>
          <SaveButton />
          <Box sx={{ width: '75%', mx: 'auto', mt: 4 }}>
            <Alert severity="success">อัพเดทล่าสุดเมื่อ:  โดย: </Alert>
          </Box>
        </Box>
      </Paper>
    </Box >
  );
}