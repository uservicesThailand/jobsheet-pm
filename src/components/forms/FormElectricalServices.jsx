import React from 'react';
import {
  Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, TextareaAutosize, Select, FormControl, InputLabel, MenuItem
} from '@mui/material';
import Swal from 'sweetalert2';

export default function FormElectricalServices({ data, keyName }) {

  return (
    <TableContainer component={Paper} sx={{ mb: 2, p: 2 }}>
      <Table size="small">
        <TableRow>
          <TableCell>1. Stator</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'Overhaul'}>Overhaul</MenuItem>
                <MenuItem value={'Rewind'}>Rewind</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>2. Rotor</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'Overhaul'}>Overhaul</MenuItem>
                <MenuItem value={'Rewind'}>Rewind</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>3. Excite Stator</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'Overhaul'}>Overhaul</MenuItem>
                <MenuItem value={'Rewind'}>Rewind</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>5. Armature Coli</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'Overhaul'}>Overhaul</MenuItem>
                <MenuItem value={'Rewind'}>Rewind</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>6. Restack Laminations Core</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'Stator'}>Stator</MenuItem>
                <MenuItem value={'Rotor'}>Rotor</MenuItem>
                <MenuItem value={'Stator+Rotor'}>Stator + Rotor</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>7. Repair Laminations Core</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'Stator'}>Stator</MenuItem>
                <MenuItem value={'Rotor'}>Rotor</MenuItem>
                <MenuItem value={'Stator+Rotor'}>Stator + Rotor</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>8. V.P.I System</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'Stator'}>Stator</MenuItem>
                <MenuItem value={'Rotor'}>Rotor</MenuItem>
                <MenuItem value={'Stator+Rotor'}>Stator + Rotor</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>9. Dip Varnish</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'Stator'}>Stator</MenuItem>
                <MenuItem value={'Rotor'}>Rotor</MenuItem>
                <MenuItem value={'Stator+Rotor'}>Stator + Rotor</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>10. Coat Varnish</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'Stator'}>Stator</MenuItem>
                <MenuItem value={'Rotor'}>Rotor</MenuItem>
                <MenuItem value={'Stator+Rotor'}>Stator + Rotor</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>11. Press Bar Rotor</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'Yes'}>Yes</MenuItem>
                <MenuItem value={'No'}>No</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>12. Coat Resin Coli Brake</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'Yes'}>Yes</MenuItem>
                <MenuItem value={'No'}>No</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>13. Core Loss Test</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'Stator'}>Stator</MenuItem>
                <MenuItem value={'Rotor'}>Rotor</MenuItem>
                <MenuItem value={'Stator+Rotor'}>Stator + Rotor</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>14. Slot Wedge</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'เปลี่ยนใหม่'}>เปลี่ยนใหม่</MenuItem>
                <MenuItem value={'Modify'}>Modify</MenuItem>
                <MenuItem value={'Repair'}>Repair</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>15. Magnetic Slot Wedge</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'เปลี่ยนใหม่'}>เปลี่ยนใหม่</MenuItem>
                <MenuItem value={'Modify'}>Modify</MenuItem>
                <MenuItem value={'Repair'}>Repair</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>16. Rotor Stoper Ring</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'เปลี่ยนใหม่'}>เปลี่ยนใหม่</MenuItem>
                <MenuItem value={'Modify'}>Modify</MenuItem>
                <MenuItem value={'Repair'}>Repair</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>17. Commutator</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'Replace'}>Replace</MenuItem>
                <MenuItem value={'Recondition'}>Recondition</MenuItem>
                <MenuItem value={'Replace+Recondition'}>Replace + Recondition</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>18. Slip Ring</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'Replace'}>Replace</MenuItem>
                <MenuItem value={'Recondition'}>Recondition</MenuItem>
                <MenuItem value={'Replace+Recondition'}>Replace + Recondition</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>19. Carbon Brush</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'Replace'}>Replace</MenuItem>
                <MenuItem value={'Recondition'}>Recondition</MenuItem>
                <MenuItem value={'Replace+Recondition'}>Replace + Recondition</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>20. Brush Holder</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'เปลี่ยนใหม่'}>เปลี่ยนใหม่</MenuItem>
                <MenuItem value={'Repair'}>Repair</MenuItem>
                <MenuItem value={'Modify'}>Modify</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>21. Encoder</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'เปลี่ยนใหม่'}>เปลี่ยนใหม่</MenuItem>
                <MenuItem value={'Repair'}>Repair</MenuItem>
                <MenuItem value={'Modify'}>Modify</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>22. Tacho</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'เปลี่ยนใหม่'}>เปลี่ยนใหม่</MenuItem>
                <MenuItem value={'Repair'}>Repair</MenuItem>
                <MenuItem value={'Modify'}>Modify</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>23. Spring</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'เปลี่ยนใหม่'}>เปลี่ยนใหม่</MenuItem>
                <MenuItem value={'Repair'}>Repair</MenuItem>
                <MenuItem value={'Modify'}>Modify</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>24. Stud Main Stator</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'เปลี่ยนใหม่'}>เปลี่ยนใหม่</MenuItem>
                <MenuItem value={'Repair'}>Repair</MenuItem>
                <MenuItem value={'Modify'}>Modify</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>25. Bearing Temp.Sensor</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'เปลี่ยนใหม่'}>เปลี่ยนใหม่</MenuItem>
                <MenuItem value={'Repair'}>Repair</MenuItem>
                <MenuItem value={'Modify'}>Modify</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>26. Stator Temp.Sensor</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'เปลี่ยนใหม่'}>เปลี่ยนใหม่</MenuItem>
                <MenuItem value={'Repair'}>Repair</MenuItem>
                <MenuItem value={'Modify'}>Modify</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>27. Heater</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'เปลี่ยนใหม่'}>เปลี่ยนใหม่</MenuItem>
                <MenuItem value={'Repair'}>Repair</MenuItem>
                <MenuItem value={'Modify'}>Modify</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>28. Terminal Box</TableCell>
          <TableCell>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <InputLabel>Status:</InputLabel>
              <Select
                label="status"
              >
                <MenuItem value="" disabled>
                </MenuItem>
                <MenuItem value={'N/A'}>N/A</MenuItem>
                <MenuItem value={'ใช้ของเดิม'}>ใช้ของเดิม</MenuItem>
                <MenuItem value={'เปลี่ยนใหม่'}>เปลี่ยนใหม่</MenuItem>
                <MenuItem value={'Repair'}>Repair</MenuItem>
                <MenuItem value={'Modify'}>Modify</MenuItem>
              </Select>
            </FormControl>
          </TableCell>
          <TableCell>
            <TextField label="Note:" rows={2} multiline maxRows={4} />
          </TableCell>
        </TableRow>
      </Table>
    </TableContainer>
  );
}
