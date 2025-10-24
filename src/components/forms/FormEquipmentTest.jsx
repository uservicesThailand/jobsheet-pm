import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, MenuItem, RadioGroup, FormControlLabel, Radio, FormControl, Grid, Button, Alert
} from '@mui/material';
import SaveButton from '../button/SaveButton';
export default function FormEquipmentTest({ data, keyName, userKey, inspNo }) {
  const renderTextField = () => (
    <TextField
      variant="outlined"
      size="small"
      defaultValue="-"
      sx={{
        width: '100%',  // ใช้กับ cell กว้างพอเท่านั้น
        minWidth: 50,
        '& input': {
          fontSize: '0.875rem',
          py: 1,
        }
      }}
    />
  );

  return (
    <Paper sx={{ p: 2 }}>
      {/* TEMPERATURE SENSOR (Stator) */}
      <Typography variant="subtitle1" sx={{ mt: 2, bgcolor: '#B3E5FC', px: 2, py: 1 }} align='center'>TEMPERATURE SENSOR (Stator)</Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} align="center">#</TableCell>
              <TableCell align="center" colSpan={2}>Incoming</TableCell>
              <TableCell align="center" colSpan={2}>Final</TableCell>
              <TableCell rowSpan={2} align="center">Type</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center">Cnnt. No.</TableCell>
              <TableCell align="center">Resistance (Ω)</TableCell>
              <TableCell align="center">Cnnt. No.</TableCell>
              <TableCell align="center">Resistance (Ω)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell align="center">1</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>
                <TextField select size="small" fullWidth defaultValue="ตัว">
                  <MenuItem value="ตัว">ตัว</MenuItem>
                </TextField>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center">2</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell rowSpan={5}>
                <TextField
                  multiline
                  rows={5}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center">3</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>

            </TableRow>
            <TableRow>
              <TableCell align="center">4</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>

            </TableRow>
            <TableRow>
              <TableCell align="center">5</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>

            </TableRow>
            <TableRow>
              <TableCell align="center">6</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>

            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* TEMPERATURE SENSOR (Bearing) */}
      <Typography variant="subtitle1" sx={{ mt: 2, bgcolor: '#B3E5FC', px: 2, py: 1 }} align='center'>TEMPERATURE SENSOR (Bearing)</Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell colSpan={2} align='center'>Location</TableCell>
              <TableCell align="center" colSpan={2}>DE</TableCell>
              <TableCell align="center" colSpan={2}>NDE</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Incoming - Cnnt. No. */}
            <TableRow>
              <TableCell rowSpan={2}>Incoming</TableCell>
              <TableCell>Resistance<br />(Ω)</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>
                <TextField select size="small" fullWidth defaultValue="ตัว">
                  <MenuItem value="ตัว">ตัว</MenuItem>
                </TextField>
              </TableCell>
            </TableRow>

            {/* Incoming - Resistance */}
            <TableRow>
              <TableCell>Cnnt. No.</TableCell>
              <TableCell colSpan={2}>{renderTextField()}</TableCell>
              <TableCell colSpan={2}>{renderTextField()}</TableCell>
              <TableCell rowSpan={3}>
                <TextField
                  multiline
                  rows={4}
                />
              </TableCell>
            </TableRow>

            {/* Final - Cnnt. No. */}
            <TableRow>
              <TableCell rowSpan={2}>Final</TableCell>
              <TableCell>Resistance<br />(Ω)</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
            </TableRow>

            {/* Final - Resistance */}
            <TableRow>
              <TableCell>Cnnt. No.</TableCell>
              <TableCell colSpan={2}>{renderTextField()}</TableCell>
              <TableCell colSpan={2}>{renderTextField()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* HEATER */}
      <Typography variant="subtitle1" sx={{ mt: 2, bgcolor: '#B3E5FC', px: 2, py: 1 }} align='center'>HEATER</Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell colSpan={2}>Unit No.</TableCell>
              <TableCell colSpan={2} align="center">1</TableCell>
              <TableCell colSpan={2} align="center">2</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Incoming */}
            <TableRow>
              <TableCell rowSpan={2}>Incoming</TableCell>
              <TableCell>Cnnt. No.</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Resistance<br />(Ω)</TableCell>
              <TableCell colSpan={2}>{renderTextField()}</TableCell>
              <TableCell colSpan={2}>{renderTextField()}</TableCell>
            </TableRow>

            {/* Final */}
            <TableRow>
              <TableCell rowSpan={2}>Final</TableCell>
              <TableCell>Cnnt. No.</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Resistance<br />(Ω)</TableCell>
              <TableCell colSpan={2}>{renderTextField()}</TableCell>
              <TableCell colSpan={2}>{renderTextField()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* DIODE OR RECTIFIER STATUS */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Incoming</TableCell>
              <TableCell>Final</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <TableRow>
              <TableCell rowSpan={2}>DIODE OR RECTIFIER STATUS</TableCell>

              <TableCell>
                <FormControl>
                  <RadioGroup row>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FormControlLabel value="Good" control={<Radio />} label="Good" />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FormControlLabel value="Ground" control={<Radio />} label="Fall" />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FormControlLabel value="N/A" control={<Radio />} label="N/A" />
                    </Box>
                  </RadioGroup>
                </FormControl>
              </TableCell>

              <TableCell>
                <FormControl>
                  <RadioGroup row>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FormControlLabel value="Good" control={<Radio />} label="Good" />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FormControlLabel value="Ground" control={<Radio />} label="Fall" />
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FormControlLabel value="N/A" control={<Radio />} label="N/A" />
                    </Box>
                  </RadioGroup>
                </FormControl>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* TEMPERATURE SENSOR (Stator) */}
      <Typography variant="subtitle1" sx={{ mt: 2, bgcolor: '#B3E5FC', px: 2, py: 1 }} align='center'>POLARIZATION INDEX</Typography>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell rowSpan={3} align="center">Time (min.)</TableCell>
              <TableCell align="center" colSpan={4}>
                Volt DC (Vdc.) AT
                {renderTextField()}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" colSpan={4}>Insulation Resistance (Phase - Earth)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center" colSpan={2}>Incoming</TableCell>
              <TableCell align="center" colSpan={2}>Final</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell align="center">{"°C ->"}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center">1</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center">2</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center">3</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>

            </TableRow>
            <TableRow>
              <TableCell align="center">4</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>

            </TableRow>
            <TableRow>
              <TableCell align="center">5</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell align="center">6</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
              <TableCell>{renderTextField()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Grid size={{ xs: 12, sm: 6 }} mt={3} align={'center'}>
        <img src="/img/eq-test1.png" alt="eq-test1" width={600} />
        <img src="/img/eq-test2.png" alt="eq-test2" width={600} />
        <img src="/img/eq-test3.png" alt="eq-test3" width={600} />
        <img src="/img/eq-test4.png" alt="eq-test4" width={600} />
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
  );
}
