//FormSquirrelCageMotor.jsx
import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
    Box, Typography, Paper, FormGroup, FormControlLabel,
    Checkbox, Grid, TextField, Select, MenuItem,
    CircularProgress, FormControl, Button,
    Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    RadioGroup, Radio
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    CheckCircle,
    Save,
    Create
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
dayjs.locale('th');


export default function FormSquirrelCageMotor({ date, data, inspNo, inspSV, userKey, customerName, customerNo, jobNo, attention
}) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    // ฟังก์ชันช่วย - ไม่ต้อง useCallback เพราะไม่มี dependencies
    const getBackgroundColor = (value) => {
        switch (value) {
            case 'N': return '#4caf50';
            case 'W': return '#ffc107';
            case 'D': return '#f44336';
            default: return 'transparent';
        }
    };

    // ... states ทั้งหมดเหมือนเดิม (header, generalInfo, motorNameplate, etc.)
    const [header, setHeader] = useState({
        customer_no: '',
        customer_name: customerName,
        job_no: jobNo,
        inspection_date: dayjs(date),
        attention: attention,
        tag_no: '',
        equipment_name: '',
        conclusion: '',
        recommendation: '',
        inspector_name: '',
        inspector_signature: '',
        inspection_completed_date: null
    });

    const [generalInfo, setGeneralInfo] = useState({
        motor_type_mv: false,
        motor_type_lv: false,
        motor_type_special: false,
        mounting_flange: false,
        mounting_foot: false,
        connection_coupling: false,
        connection_gearbox: false,
        connection_vbelt: false
    });

    const [motorNameplate, setMotorNameplate] = useState({
        manufacture: '',
        model: '',
        type: '',
        power: '',
        power_unit: 'kW',
        speed: '',
        speed_unit: 'RPM',
        ser_no: '',
        voltage: '',
        frequency: '',
        insulation_class: '',
        design: '',
        current: '',
        cos_phi: '',
        temp_rise_class: '',
        duty: '',
        de_bearing: '',
        nde_bearing: '',
        ip: '',
        sf: '',
        frame: '',
        note: ''
    });

    const [drivenEquipment, setDrivenEquipment] = useState({
        equipment_type: '',
        manufactory: '',
        tag_no: '',
        speed: '',
        speed_unit: 'RPM',
        de_bearing: '',
        nde_bearing: ''
    });

    const [generalChecks, setGeneralChecks] = useState([
        { check_item: 'Body/Frame Corrossive', status: '', remarks: '' },
        { check_item: 'Cable Entry Condition', status: '', remarks: '' },
        { check_item: 'Earthing Connection Status', status: '', remarks: '' },
        { check_item: 'Terminal Box Sealing & Other Gasket', status: '', remarks: '' },
        { check_item: 'Inside of Terminal Box, Dus/ Water is Clear', status: '', remarks: '' },
        { check_item: 'All Cable Connection, Tightening', status: '', remarks: '' }
    ]);

    const [standstillTest, setStandstillTest] = useState({
        application: false,
        not_application: false,
        winding_include_cable: false,
        winding_exclude_cable: false
    });

    const [insulationTests, setInsulationTests] = useState([
        { phase_marking: 'U-V', test_voltage: '', resistance_1min_c: '', resistance_1min_40c: '', resistance_10min_c: '', resistance_10min_40c: '', polarization_index: '', winding_temp: '' },
        { phase_marking: 'U-W', test_voltage: '', resistance_1min_c: '', resistance_1min_40c: '', resistance_10min_c: '', resistance_10min_40c: '', polarization_index: '', winding_temp: '' },
        { phase_marking: 'V-W', test_voltage: '', resistance_1min_c: '', resistance_1min_40c: '', resistance_10min_c: '', resistance_10min_40c: '', polarization_index: '', winding_temp: '' },
        { phase_marking: 'Stator - EARTH', test_voltage: '', resistance_1min_c: '', resistance_1min_40c: '', resistance_10min_c: '', resistance_10min_40c: '', polarization_index: '', winding_temp: '' }
    ]);

    const [insulationNote, setInsulationNote] = useState('');

    const [resistanceTests, setResistanceTests] = useState({
        test_unit: '',
        resistance_uv: '',
        resistance_uw: '',
        resistance_vw: '',
        result_status: ''
    });

    const [inductanceTests, setInductanceTests] = useState({
        test_unit: '',
        inductance_uv: '',
        inductance_uw: '',
        inductance_vw: '',
        result_status: ''
    });

    const [tempSensorsBearing, setTempSensorsBearing] = useState({
        de_connection_no1: '',
        de_connection_no2: '',
        de_resistance: '',
        nde_connection_no1: '',
        nde_connection_no2: '',
        nde_resistance: '',
        sensor_type: '',
        result_status: ''
    });

    const [heaters, setHeaters] = useState([
        { unit_no: 1, connection_no1: '', connection_no2: '', resistance: '' },
        { unit_no: 2, connection_no1: '', connection_no2: '', resistance: '' }
    ]);

    const [tempSensorsStator, setTempSensorsStator] = useState([
        { element_no: 1, connection_no1: '', connection_no2: '', resistance: '', sensor_type: '', result_status: '' },
        { element_no: 2, connection_no1: '', connection_no2: '', resistance: '', sensor_type: '', result_status: '' },
        { element_no: 3, connection_no1: '', connection_no2: '', resistance: '', sensor_type: '', result_status: '' },
        { element_no: 4, connection_no1: '', connection_no2: '', resistance: '', sensor_type: '', result_status: '' },
        { element_no: 5, connection_no1: '', connection_no2: '', resistance: '', sensor_type: '', result_status: '' },
        { element_no: 6, connection_no1: '', connection_no2: '', resistance: '', sensor_type: '', result_status: '' }
    ]);

    // ============= OPTIMIZED HANDLERS ด้วย useCallback =============

    const handleHeaderChange = useCallback((field, value) => {
        setHeader(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleMotorNameplateChange = useCallback((field, value) => {
        setMotorNameplate(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleDrivenEquipmentChange = useCallback((field, value) => {
        setDrivenEquipment(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleGeneralCheckChange = useCallback((index, field, value) => {
        setGeneralChecks(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }, []);

    const handleInsulationTestChange = useCallback((index, field, value) => {
        setInsulationTests(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }, []);

    const handleHeaterChange = useCallback((index, field, value) => {
        setHeaters(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }, []);

    const handleTempSensorStatorChange = useCallback((index, field, value) => {
        setTempSensorsStator(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }, []);

    // Handler สำหรับ GeneralInfo
    const handleGeneralInfoChange = useCallback((field, checked) => {
        setGeneralInfo(prev => ({ ...prev, [field]: checked }));
    }, []);

    // Handler สำหรับ StandstillTest
    const handleStandstillTestChange = useCallback((field, checked) => {
        setStandstillTest(prev => ({ ...prev, [field]: checked }));
    }, []);

    // Handler สำหรับ ResistanceTests
    const handleResistanceTestsChange = useCallback((field, value) => {
        setResistanceTests(prev => ({ ...prev, [field]: value }));
    }, []);

    // Handler สำหรับ InductanceTests
    const handleInductanceTestsChange = useCallback((field, value) => {
        setInductanceTests(prev => ({ ...prev, [field]: value }));
    }, []);

    // Handler สำหรับ TempSensorsBearing
    const handleTempSensorsBearingChange = useCallback((field, value) => {
        setTempSensorsBearing(prev => ({ ...prev, [field]: value }));
    }, []);

    // Handler สำหรับ TempSensorsStator - update ทุกตัว
    const handleTempSensorsStatorBulkUpdate = useCallback((field, value) => {
        setTempSensorsStator(prev => prev.map(s => ({ ...s, [field]: value })));
    }, []);

    // useEffect เดิมไม่ต้องแก้
    useEffect(() => {
        if (!data) return;
        // ... โค้ดเดิมทั้งหมด
    }, [data, customerName, customerNo]);

    // ========== MEMOIZED COMPONENTS ==========
    useEffect(() => {
        if (!data) return;

        console.log('📥 Loading form data:', data);

        setHeader(prev => ({
            ...prev,
            customer_no: data.customer_name || customerNo || prev.customer_no,
            customer_name: data.customer_name || customerName || prev.customer_name,
            job_no: data.job_no || '',
            inspection_date: data.inspection_date ? dayjs(data.inspection_date) : prev.inspection_date,
            attention: data.attention || '',
            tag_no: data.tag_no || '',
            equipment_name: data.equipment_name || '',
            conclusion: data.conclusion || '',
            recommendation: data.recommendation || '',
            inspector_name: data.inspector_name || '',
            inspector_signature: data.inspector_signature || '',
            inspection_completed_date: data.inspection_completed_date ? dayjs(data.inspection_completed_date) : null
        }));

        setGeneralInfo({
            motor_type_mv: data.scm_gi_motor_type_mv == 1,
            motor_type_lv: data.scm_gi_motor_type_lv == 1,
            motor_type_special: data.scm_gi_motor_type_special == 1,
            mounting_flange: data.scm_gi_mounting_flange == 1,
            mounting_foot: data.scm_gi_mounting_foot == 1,
            connection_coupling: data.scm_gi_connection_coupling == 1,
            connection_gearbox: data.scm_gi_connection_gearbox == 1,
            connection_vbelt: data.scm_gi_connection_vbelt == 1
        });

        setStandstillTest({
            application: data.scm_st_application == 1,
            not_application: data.scm_st_not_application == 1,
            winding_include_cable: data.scm_st_winding_include_cable == 1,
            winding_exclude_cable: data.scm_st_winding_exclude_cable == 1
        });

        setMotorNameplate(prev => ({
            ...prev,
            manufacture: data.fmn_manufacture || '',
            model: data.fmn_model || '',
            type: data.fmn_type || '',
            power: data.fmn_power || '',
            power_unit: data.fmn_power_unit || 'kW',
            speed: data.fmn_speed || '',
            speed_unit: data.fmn_speed_unit || 'RPM',
            ser_no: data.fmn_ser_no || '',
            voltage: data.fmn_voltage || '',
            frequency: data.fmn_frequency || '',
            insulation_class: data.fmn_insulation_class || '',
            design: data.fmn_design || '',
            current: data.fmn_current || '',
            cos_phi: data.fmn_cos_phi || '',
            temp_rise_class: data.fmn_temp_rise_class || '',
            duty: data.fmn_duty || '',
            de_bearing: data.fmn_de_bearing || '',
            nde_bearing: data.fmn_nde_bearing || '',
            ip: data.fmn_ip || '',
            sf: data.fmn_sf || '',
            frame: data.fmn_frame || '',
            note: data.fmn_note || ''
        }));

        setDrivenEquipment(prev => ({
            ...prev,
            equipment_type: data.scm_de_equipment_type || '',
            manufactory: data.scm_de_manufactory || '',
            tag_no: data.scm_de_tag_no || '',
            speed: data.scm_de_speed || '',
            speed_unit: data.scm_de_speed_unit || 'RPM',
            de_bearing: data.scm_de_de_bearing || '',
            nde_bearing: data.scm_de_nde_bearing || ''
        }));

        setResistanceTests({
            test_unit: data.scm_rt_test_unit || '',
            resistance_uv: data.scm_rt_resistance_uv || '',
            resistance_uw: data.scm_rt_resistance_uw || '',
            resistance_vw: data.scm_rt_resistance_vw || '',
            result_status: data.scm_rt_result_status || ''
        });

        setInductanceTests({
            test_unit: data.scm_lt_test_unit || '',
            inductance_uv: data.scm_lt_inductance_uv || '',
            inductance_uw: data.scm_lt_inductance_uw || '',
            inductance_vw: data.scm_lt_inductance_vw || '',
            result_status: data.scm_lt_result_status || ''
        });

        setTempSensorsBearing({
            de_connection_no1: data.scm_tsb_de_connection_no1 || '',
            de_connection_no2: data.scm_tsb_de_connection_no2 || '',
            de_resistance: data.scm_tsb_de_resistance || '',
            nde_connection_no1: data.scm_tsb_nde_connection_no1 || '',
            nde_connection_no2: data.scm_tsb_nde_connection_no2 || '',
            nde_resistance: data.scm_tsb_nde_resistance || '',
            sensor_type: data.scm_tsb_sensor_type || '',
            result_status: data.scm_tsb_result_status || ''
        });

        if (data.generalChecks && Array.isArray(data.generalChecks) && data.generalChecks.length > 0) {
            const mappedChecks = data.generalChecks.map(check => ({
                check_item: check.scm_gc_check_item,
                status: check.scm_gc_status,
                remarks: check.scm_gc_remarks
            }));
            setGeneralChecks(mappedChecks);
        }

        if (data.insulationTests && Array.isArray(data.insulationTests) && data.insulationTests.length > 0) {
            const mappedTests = data.insulationTests.map(test => ({
                phase_marking: test.scm_it_phase_marking,
                test_voltage: test.scm_it_test_voltage,
                resistance_1min_c: test.scm_it_resistance_1min_c,
                resistance_1min_40c: test.scm_it_resistance_1min_40c,
                resistance_10min_c: test.scm_it_resistance_10min_c,
                resistance_10min_40c: test.scm_it_resistance_10min_40c,
                polarization_index: test.scm_it_polarization_index,
                winding_temp: test.scm_it_winding_temp
            }));
            setInsulationTests(mappedTests);
        }

        if (data.heaters && Array.isArray(data.heaters) && data.heaters.length > 0) {
            const mappedHeaters = data.heaters.map(heater => ({
                unit_no: heater.scm_h_unit_no,
                connection_no1: heater.scm_h_connection_no1,
                connection_no2: heater.scm_h_connection_no2,
                resistance: heater.scm_h_resistance
            }));
            setHeaters(mappedHeaters);
        }

        if (data.tempSensorsStator && Array.isArray(data.tempSensorsStator) && data.tempSensorsStator.length > 0) {
            const mappedSensors = data.tempSensorsStator.map(sensor => ({
                element_no: sensor.scm_tss_element_no,
                connection_no1: sensor.scm_tss_connection_no1,
                connection_no2: sensor.scm_tss_connection_no2,
                resistance: sensor.scm_tss_resistance,
                sensor_type: sensor.scm_tss_sensor_type,
                result_status: sensor.scm_tss_result_status
            }));
            setTempSensorsStator(mappedSensors);
        }

        if (data.overall_status) {
            setStatus(data.overall_status);
        }

        console.log('✅ Form data loaded successfully');

    }, [data, customerName, customerNo]);

    //  ส่วนนี้ขาด - handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const apiHost = import.meta.env.VITE_API_HOST;
            const url = `${apiHost}/api/scm/inspection-save`;

            const payload = {
                insp_no: inspNo,
                insp_sv: inspSV,
                created_by: userKey,
                updated_by: userKey,
                header: {
                    ...header,
                    overall_status: status
                },
                motorNameplate,
                drivenEquipment,
                generalInfo,
                generalChecks,
                insulationTests: insulationTests.map(test => ({
                    ...test,
                    note: test.phase_marking === 'Note' ? insulationNote : ''
                })),
                resistanceTests,
                inductanceTests,
                tempSensorsBearing,
                heaters,
                tempSensorsStator,
                standstillTest
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'user_key': userKey || '',
                    'sv': inspSV || ''
                },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || 'Save failed');

            await Swal.fire({
                icon: 'success',
                title: 'บันทึกสำเร็จ',
                text: `บันทึกฟอร์มสำเร็จ (Inspection No: ${inspNo})`,
                confirmButtonText: 'ตกลง'
            });
            window.location.reload();

        } catch (err) {
            console.error(err);
            await Swal.fire({
                icon: 'error',
                title: 'บันทึกไม่สำเร็จ',
                text: err.message || String(err)
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 1, sm: 1 }, maxWidth: '1200px', mx: 'auto' }}>

                <AppliedToSection
                    generalInfo={generalInfo}
                    onChange={handleGeneralInfoChange}
                />

                <Grid container spacing={2}>
                    <HeaderFieldsSection
                        header={header}
                        onChange={handleHeaderChange}
                    />
                </Grid>

                <Divider sx={{ my: 5 }} />

                <MotorNameplateSection
                    motorNameplate={motorNameplate}
                    onChange={handleMotorNameplateChange}
                />

                <DrivenEquipmentSection
                    drivenEquipment={drivenEquipment}
                    onChange={handleDrivenEquipmentChange}
                />

                <Divider sx={{ my: 3 }} />

                <GeneralInformationSection
                    generalInfo={generalInfo}
                    onChange={handleGeneralInfoChange}
                />

                <Divider sx={{ my: 3 }} />

                <GeneralCheckSection
                    generalChecks={generalChecks}
                    onChange={handleGeneralCheckChange}
                />

                <Divider sx={{ my: 3 }} />

                <StandstillTestSection
                    standstillTest={standstillTest}
                    onChange={handleStandstillTestChange}
                />

                <InsulationTestTable
                    insulationTests={insulationTests}
                    insulationNote={insulationNote}
                    onTestChange={handleInsulationTestChange}
                    onNoteChange={setInsulationNote}
                />

                <ResistanceTestsTable
                    resistanceTests={resistanceTests}
                    onChange={handleResistanceTestsChange}
                />

                <InductanceTestsTable
                    inductanceTests={inductanceTests}
                    onChange={handleInductanceTestsChange}
                />

                <TempSensorBearingTable
                    tempSensorsBearing={tempSensorsBearing}
                    onChange={handleTempSensorsBearingChange}
                />

                <HeaterTable
                    heaters={heaters}
                    onChange={handleHeaterChange}
                />

                <TempSensorStatorTable
                    tempSensorsStator={tempSensorsStator}
                    onChange={handleTempSensorStatorChange}
                    onBulkUpdate={handleTempSensorsStatorBulkUpdate}
                />

                <Divider sx={{ my: 3 }} />

                <ConclusionSection
                    header={header}
                    onChange={handleHeaderChange}
                />

                <ResultTableSection
                    status={status}
                    header={header}
                    onStatusChange={setStatus}
                    onHeaderChange={handleHeaderChange}
                    getBackgroundColor={getBackgroundColor}
                />

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        disabled={loading}
                        sx={{ minWidth: 200 }}
                        startIcon={<Save />}
                    >
                        {loading ? <CircularProgress size={24} /> : 'บันทึกข้อมูล'}
                    </Button>
                </Box>
            </Box>
        </LocalizationProvider>
    );
}
// 1. Applied To Section
const AppliedToSection = memo(({ generalInfo, onChange }) => (
    <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1">Applied to:</Typography>
            <FormControl component="fieldset">
                <RadioGroup
                    value={
                        generalInfo.motor_type_mv ? 'mv' :
                            generalInfo.motor_type_lv ? 'lv' :
                                generalInfo.motor_type_special ? 'special' : ''
                    }
                    onChange={(e) => {
                        const value = e.target.value;
                        onChange('motor_type_mv', value === 'mv');
                        onChange('motor_type_lv', value === 'lv');
                        onChange('motor_type_special', value === 'special');
                    }}
                >
                    <FormControlLabel
                        value="mv"
                        control={<Radio />}
                        label="All Medium Voltage Motor"
                    />
                    <FormControlLabel
                        value="lv"
                        control={<Radio />}
                        label="Low Voltage Motor"
                    />
                    <FormControlLabel
                        value="special"
                        control={<Radio />}
                        label="Special Design of Low Voltage AC Motor"
                    />
                </RadioGroup>
            </FormControl>
        </Grid>
    </Grid>
));
AppliedToSection.displayName = 'AppliedToSection';

// 2. Header Fields Section
const HeaderFieldsSection = memo(({ header, onChange }) => (
    <>
        <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
                fullWidth
                label="Customer :"
                variant="filled"
                slotProps={{
                    input: {
                        readOnly: true,
                    },
                }}
                value={header.customer_name}
            />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
                fullWidth
                label="Job no :"
                variant="standard"
                value={header.job_no}
                onChange={(e) => onChange('job_no', e.target.value)}
            />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
            <DatePicker
                format="DD/MM/YYYY"
                label="Inspection Date :"
                value={header.inspection_date}
                onChange={(newValue) => onChange('inspection_date', newValue)}
                slotProps={{ textField: { variant: 'standard', fullWidth: true } }}
            />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
                fullWidth
                label="Attention :"
                variant="standard"
                value={header.attention || ''}
                onChange={(e) => onChange('attention', e.target.value)}
            />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
                fullWidth
                label="Tag No :"
                variant="standard"
                value={header.tag_no || ''}
                onChange={(e) => onChange('tag_no', e.target.value)}
            />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
                fullWidth
                label="Name :"
                variant="standard"
                value={header.equipment_name || ''}
                onChange={(e) => onChange('equipment_name', e.target.value)}
            />
        </Grid>
    </>
));
HeaderFieldsSection.displayName = 'HeaderFieldsSection';

// 3. Motor Nameplate Section
const MotorNameplateSection = memo(({ motorNameplate, onChange }) => (
    <>
        <Typography variant="h6">MOTOR NAMEPLATE</Typography>
        <Grid container spacing={2} my={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label="Manufacture :"
                    variant="standard"
                    value={motorNameplate.manufacture}
                    onChange={(e) => onChange('manufacture', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label="Frame/ Model :"
                    variant="standard"
                    value={motorNameplate.model}
                    onChange={(e) => onChange('model', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label="Type :"
                    variant="standard"
                    value={motorNameplate.type}
                    onChange={(e) => onChange('type', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label="Power :"
                    variant="standard"
                    helperText="kw"
                    value={motorNameplate.power}
                    onChange={(e) => onChange('power', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label="Speed :"
                    variant="standard"
                    value={motorNameplate.speed}
                    onChange={(e) => onChange('speed', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label="Ser.No :"
                    variant="standard"
                    value={motorNameplate.ser_no}
                    onChange={(e) => onChange('ser_no', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                    fullWidth
                    label="Voltage :"
                    variant="standard"
                    value={motorNameplate.voltage}
                    onChange={(e) => onChange('voltage', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                    fullWidth
                    label="Frequency :"
                    variant="standard"
                    value={motorNameplate.frequency}
                    onChange={(e) => onChange('frequency', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                    fullWidth
                    label="Insulation Class :"
                    variant="standard"
                    value={motorNameplate.insulation_class}
                    onChange={(e) => onChange('insulation_class', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                    fullWidth
                    label="Design :"
                    variant="standard"
                    value={motorNameplate.design}
                    onChange={(e) => onChange('design', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                    fullWidth
                    label="Current :"
                    variant="standard"
                    value={motorNameplate.current}
                    onChange={(e) => onChange('current', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                    fullWidth
                    label="Cos.θ :"
                    variant="standard"
                    value={motorNameplate.cos_phi}
                    onChange={(e) => onChange('cos_phi', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                    fullWidth
                    label="Temp.Rise Class :"
                    variant="standard"
                    value={motorNameplate.temp_rise_class}
                    onChange={(e) => onChange('temp_rise_class', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                    fullWidth
                    label="Duty :"
                    variant="standard"
                    value={motorNameplate.duty}
                    onChange={(e) => onChange('duty', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                    fullWidth
                    label="DE Bearing :"
                    variant="standard"
                    value={motorNameplate.de_bearing}
                    onChange={(e) => onChange('de_bearing', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                    fullWidth
                    label="NDE Bearing :"
                    variant="standard"
                    value={motorNameplate.nde_bearing}
                    onChange={(e) => onChange('nde_bearing', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                    fullWidth
                    label="IP :"
                    variant="standard"
                    value={motorNameplate.ip}
                    onChange={(e) => onChange('ip', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
                <TextField
                    fullWidth
                    label="SF :"
                    variant="standard"
                    value={motorNameplate.sf}
                    onChange={(e) => onChange('sf', e.target.value)}
                />
            </Grid>
        </Grid>
    </>
));
MotorNameplateSection.displayName = 'MotorNameplateSection';

// 4. Driven Equipment Section
const DrivenEquipmentSection = memo(({ drivenEquipment, onChange }) => (
    <>
        <Typography variant="h6" mt={5}>DRIVEN(LOAD)</Typography>
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label="Equipment :"
                    variant="standard"
                    helperText="(Driven)"
                    value={drivenEquipment.equipment_type}
                    onChange={(e) => onChange('equipment_type', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label="Manufactory :"
                    variant="standard"
                    value={drivenEquipment.manufactory}
                    onChange={(e) => onChange('manufactory', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label="Tag No. :"
                    variant="standard"
                    value={drivenEquipment.tag_no}
                    onChange={(e) => onChange('tag_no', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label="Speed :"
                    variant="standard"
                    helperText="RPM"
                    value={drivenEquipment.speed}
                    onChange={(e) => onChange('speed', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label="DE BRG. :"
                    variant="standard"
                    value={drivenEquipment.de_bearing}
                    onChange={(e) => onChange('de_bearing', e.target.value)}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                    fullWidth
                    label="NDE BRG. :"
                    variant="standard"
                    value={drivenEquipment.nde_bearing}
                    onChange={(e) => onChange('nde_bearing', e.target.value)}
                />
            </Grid>
        </Grid>
    </>
));
DrivenEquipmentSection.displayName = 'DrivenEquipmentSection';

// 5. General Information Section
const GeneralInformationSection = memo(({ generalInfo, onChange }) => (
    <>
        <Typography variant="subtitle1">1. General Information</Typography>
        <FormGroup row sx={{ alignItems: 'center', ml: 2 }}>
            <Typography variant="subtitle2" sx={{ minWidth: '200px', mr: 2 }}>
                1.1 Motor Mounting
            </Typography>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={generalInfo.mounting_flange}
                        onChange={(e) => onChange('mounting_flange', e.target.checked)}
                    />
                }
                label="Flange mounted"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={generalInfo.mounting_foot}
                        onChange={(e) => onChange('mounting_foot', e.target.checked)}
                    />
                }
                label="Foot mounted"
            />
        </FormGroup>

        <FormGroup row sx={{ alignItems: 'center', ml: 2 }}>
            <Typography variant="subtitle2" sx={{ minWidth: '200px', mr: 2 }}>
                1.2 Driven Connection
            </Typography>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={generalInfo.connection_coupling}
                        onChange={(e) => onChange('connection_coupling', e.target.checked)}
                    />
                }
                label="Coupling"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={generalInfo.connection_gearbox}
                        onChange={(e) => onChange('connection_gearbox', e.target.checked)}
                    />
                }
                label="Gear box"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={generalInfo.connection_vbelt}
                        onChange={(e) => onChange('connection_vbelt', e.target.checked)}
                    />
                }
                label="V - Belt"
            />
        </FormGroup>
    </>
));
GeneralInformationSection.displayName = 'GeneralInformationSection';

// 6. General Check Section
const GeneralCheckSection = memo(({ generalChecks, onChange }) => (
    <>
        <Typography variant="subtitle1" mb={2}>2. General Check.</Typography>
        {generalChecks.map((check, index) => (
            <Box key={index} mb={2} ml={2}>
                <Typography variant="subtitle2">2.{index + 1} {check.check_item}</Typography>
                <FormGroup row sx={{ alignItems: 'center' }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={check.status === 'Normal'}
                                onChange={(e) => onChange(index, 'status', e.target.checked ? 'Normal' : null)}
                            />
                        }
                        label="Normal"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={check.status === 'Abnormal'}
                                onChange={(e) => onChange(index, 'status', e.target.checked ? 'Abnormal' : null)}
                            />
                        }
                        label="Abnormal"
                    />
                    <TextField
                        variant="standard"
                        size="small"
                        sx={{ ml: 2, minWidth: 200 }}
                        value={check.remarks || ''}
                        onChange={(e) => onChange(index, 'remarks', e.target.value)}
                    />
                </FormGroup>
            </Box>
        ))}
    </>
));
GeneralCheckSection.displayName = 'GeneralCheckSection';

// 7. Standstill Test Section
const StandstillTestSection = memo(({ standstillTest, onChange }) => (
    <>
        <FormGroup row sx={{ alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ minWidth: '200px', mr: 2 }}>
                3. Standstill Test.
            </Typography>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={standstillTest.application}
                        onChange={(e) => onChange('application', e.target.checked)}
                    />
                }
                label="Application"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={standstillTest.not_application}
                        onChange={(e) => onChange('not_application', e.target.checked)}
                    />
                }
                label="Not Application"
            />
        </FormGroup>

        <FormGroup row sx={{ alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ minWidth: '200px', mr: 2, ml: 2 }}>
                3.1 Winding Condition
            </Typography>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={standstillTest.winding_include_cable}
                        onChange={(e) => onChange('winding_include_cable', e.target.checked)}
                    />
                }
                label="Include Cable"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={standstillTest.winding_exclude_cable}
                        onChange={(e) => onChange('winding_exclude_cable', e.target.checked)}
                    />
                }
                label="Exclude Cable"
            />
        </FormGroup>
    </>
));
StandstillTestSection.displayName = 'StandstillTestSection';

// 8. Insulation Test Table
const InsulationTestTable = memo(({ insulationTests, insulationNote, onTestChange, onNoteChange }) => (
    <TableContainer
        component={Paper}
        sx={{
            overflowX: 'auto',
            maxWidth: '100%',
            '&::-webkit-scrollbar': {
                height: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#bedde2',
                borderRadius: '4px',
            },
        }}
    >
        <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: '#bedde2' }}>
                <TableRow>
                    <TableCell
                        colSpan={8}
                        align="center"
                        sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            fontWeight: 'bold',
                            padding: { xs: '12px 8px', sm: '16px' }
                        }}
                    >
                        Insulation Test (MΩ)
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                            minWidth: '80px',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontWeight: 600,
                            padding: { xs: '8px 4px', sm: '12px 8px' },
                            borderRight: '1px solid rgba(224, 224, 224, 1)'
                        }}
                    >
                        Volt
                    </TableCell>
                    <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                            minWidth: '90px',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontWeight: 600,
                            padding: { xs: '8px 4px', sm: '12px 8px' },
                            borderRight: '1px solid rgba(224, 224, 224, 1)'
                        }}
                    >
                        Marking
                    </TableCell>
                    <TableCell
                        colSpan={2}
                        align="center"
                        sx={{
                            minWidth: '160px',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontWeight: 600,
                            padding: { xs: '8px 4px', sm: '12px 8px' },
                            borderRight: '1px solid rgba(224, 224, 224, 1)'
                        }}
                    >
                        1 min.
                    </TableCell>
                    <TableCell
                        colSpan={2}
                        align="center"
                        sx={{
                            minWidth: '160px',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontWeight: 600,
                            padding: { xs: '8px 4px', sm: '12px 8px' },
                            borderRight: '1px solid rgba(224, 224, 224, 1)'
                        }}
                    >
                        10 min.
                    </TableCell>
                    <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                            minWidth: '70px',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontWeight: 600,
                            padding: { xs: '8px 4px', sm: '12px 8px' },
                            borderRight: '1px solid rgba(224, 224, 224, 1)'
                        }}
                    >
                        PI
                    </TableCell>
                    <TableCell
                        rowSpan={2}
                        align="center"
                        sx={{
                            minWidth: '100px',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            fontWeight: 600,
                            padding: { xs: '8px 4px', sm: '12px 8px' }
                        }}
                    >
                        Winding Temp
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell
                        align="center"
                        sx={{
                            minWidth: '80px',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            padding: { xs: '8px 4px', sm: '12px 8px' }
                        }}
                    >
                        °C
                    </TableCell>
                    <TableCell
                        align="center"
                        sx={{
                            minWidth: '80px',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            padding: { xs: '8px 4px', sm: '12px 8px' },
                            borderRight: '1px solid rgba(224, 224, 224, 1)'
                        }}
                    >
                        40°C
                    </TableCell>
                    <TableCell
                        align="center"
                        sx={{
                            minWidth: '80px',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            padding: { xs: '8px 4px', sm: '12px 8px' }
                        }}
                    >
                        °C
                    </TableCell>
                    <TableCell
                        align="center"
                        sx={{
                            minWidth: '80px',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            padding: { xs: '8px 4px', sm: '12px 8px' },
                            borderRight: '1px solid rgba(224, 224, 224, 1)'
                        }}
                    >
                        40°C
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {insulationTests.map((test, index) => (
                    <TableRow
                        key={index}
                        sx={{
                            '&:nth-of-type(odd)': {
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            },
                            '&:hover': {
                                backgroundColor: 'rgba(190, 221, 226, 0.1)',
                            },
                        }}
                    >
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="number"
                                value={test.test_voltage}
                                onChange={(e) => onTestChange(index, 'test_voltage', e.target.value)}
                                inputProps={{
                                    step: "0.01",
                                    min: "0",
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{
                            padding: { xs: '8px 4px', sm: '12px 8px' },
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}>
                            {test.phase_marking}
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={test.resistance_1min_c}
                                onChange={(e) => onTestChange(index, 'resistance_1min_c', e.target.value)}
                                inputProps={{
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={test.resistance_1min_40c}
                                onChange={(e) => onTestChange(index, 'resistance_1min_40c', e.target.value)}
                                inputProps={{
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={test.resistance_10min_c}
                                onChange={(e) => onTestChange(index, 'resistance_10min_c', e.target.value)}
                                inputProps={{
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={test.resistance_10min_40c}
                                onChange={(e) => onTestChange(index, 'resistance_10min_40c', e.target.value)}
                                inputProps={{
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={test.polarization_index}
                                onChange={(e) => onTestChange(index, 'polarization_index', e.target.value)}
                                inputProps={{
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={test.winding_temp}
                                onChange={(e) => onTestChange(index, 'winding_temp', e.target.value)}
                                inputProps={{
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
));
InsulationTestTable.displayName = 'InsulationTestTable';
// 9. Resistance Tests Table
const ResistanceTestsTable = memo(({ resistanceTests, onChange }) => (
    <>
        <Typography variant="subtitle2" sx={{ minWidth: '200px', mb: 2, color: 'red' }}>
            Refer Standard IEEE 43-2000 : Min. Insulation Recommend {'>'}100 mΩ/ Polarization Index Recommend 2-5
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table >
                <TableHead sx={{ backgroundColor: '#bedde2' }}>
                    <TableRow>
                        <TableCell rowSpan={2} align="center">Test Condition</TableCell>
                        <TableCell align="center" colSpan={3}
                            sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 'bold',
                                padding: { xs: '12px 8px', sm: '16px' }
                            }}
                        >Main Stator</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell align="center">U - V</TableCell>
                        <TableCell align="center">U - W</TableCell>
                        <TableCell align="center">V - W</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            Resistance <br />
                            ( <TextField
                                variant="standard"
                                size="small"
                                type="text"
                                sx={{ width: "30px" }}
                                value={resistanceTests.test_unit}
                                onChange={(e) => onChange('test_unit', e.target.value)}
                            /> Ω)
                        </TableCell>
                        <TableCell>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="number"
                                value={resistanceTests.resistance_uv}
                                onChange={(e) => onChange('resistance_uv', e.target.value)}
                                inputProps={{ step: "0.01", min: "0" }}
                            />
                        </TableCell>
                        <TableCell>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="number"
                                value={resistanceTests.resistance_uw}
                                onChange={(e) => onChange('resistance_uw', e.target.value)}
                                inputProps={{ step: "0.01", min: "0" }}
                            />
                        </TableCell>
                        <TableCell>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="number"
                                value={resistanceTests.resistance_vw}
                                onChange={(e) => onChange('resistance_vw', e.target.value)}
                                inputProps={{ step: "0.01", min: "0" }}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={4}>
                            <FormGroup row sx={{ alignItems: 'center' }}>
                                <Typography variant="subtitle2" sx={{ minWidth: '200px', mr: 2 }}>
                                    Result:
                                </Typography>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={resistanceTests.result_status === 'Normal'}
                                            onChange={(e) => onChange('result_status', e.target.checked ? 'Normal' : 'Abnormal')}
                                        />
                                    }
                                    label="Normal"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={resistanceTests.result_status === 'Abnormal'}
                                            onChange={(e) => onChange('result_status', e.target.checked ? 'Abnormal' : 'Normal')}
                                        />
                                    }
                                    label="Abnormal"
                                />
                            </FormGroup>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </>
));
ResistanceTestsTable.displayName = 'ResistanceTestsTable';

// 10. Inductance Tests Table
const InductanceTestsTable = memo(({ inductanceTests, onChange }) => (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
            <TableHead sx={{ backgroundColor: '#bedde2' }}>
                <TableRow>
                    <TableCell rowSpan={2} align="center">Test Condition</TableCell>
                    <TableCell align="center" colSpan={3}
                        sx={{
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            fontWeight: 'bold',
                            padding: { xs: '12px 8px', sm: '16px' }
                        }}
                    >Main Stator</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell align="center">U - V</TableCell>
                    <TableCell align="center">U - W</TableCell>
                    <TableCell align="center">V - W</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>
                        Inductance <br />
                        ( <TextField
                            variant="standard"
                            size="small"
                            type="text"
                            sx={{ width: "30px" }}
                            value={inductanceTests.test_unit}
                            onChange={(e) => onChange('test_unit', e.target.value)}
                        /> H)
                    </TableCell>
                    <TableCell>
                        <TextField
                            variant="standard"
                            size="small"
                            fullWidth
                            type="number"
                            value={inductanceTests.inductance_uv}
                            onChange={(e) => onChange('inductance_uv', e.target.value)}
                            inputProps={{ step: "0.01", min: "0" }}
                        />
                    </TableCell>
                    <TableCell>
                        <TextField
                            variant="standard"
                            size="small"
                            fullWidth
                            type="number"
                            value={inductanceTests.inductance_uw}
                            onChange={(e) => onChange('inductance_uw', e.target.value)}
                            inputProps={{ step: "0.01", min: "0" }}
                        />
                    </TableCell>
                    <TableCell>
                        <TextField
                            variant="standard"
                            size="small"
                            fullWidth
                            type="number"
                            value={inductanceTests.inductance_vw}
                            onChange={(e) => onChange('inductance_vw', e.target.value)}
                            inputProps={{ step: "0.01", min: "0" }}
                        />
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={4}>
                        <FormGroup row sx={{ alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ minWidth: '200px', mr: 2 }}>
                                Result:
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={inductanceTests.result_status === 'Normal'}
                                        onChange={(e) => onChange('result_status', e.target.checked ? 'Normal' : 'Abnormal')}
                                    />
                                }
                                label="Normal"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={inductanceTests.result_status === 'Abnormal'}
                                        onChange={(e) => onChange('result_status', e.target.checked ? 'Abnormal' : 'Normal')}
                                    />
                                }
                                label="Abnormal"
                            />
                        </FormGroup>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </TableContainer>
));
InductanceTestsTable.displayName = 'InductanceTestsTable';

// 11. Temperature Sensor Bearing Table
const TempSensorBearingTable = memo(({ tempSensorsBearing, onChange }) => (
    <>
        <Typography
            variant="subtitle2"
            sx={{
                minWidth: '200px',
                mt: 2,
                mb: 2,
                ml: { xs: 1, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 600
            }}
        >
            3.2 Temperature Sensor And Heater
        </Typography>
        <TableContainer
            component={Paper}
            sx={{
                mb: 2,
                overflowX: 'auto',
                maxWidth: '100%',
                '&::-webkit-scrollbar': {
                    height: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#bedde2',
                    borderRadius: '4px',
                },
            }}
        >
            <Table sx={{ minWidth: 600 }}>
                <TableHead sx={{ backgroundColor: '#bedde2' }}>
                    <TableRow>
                        <TableCell
                            colSpan={6}
                            align="center"
                            sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 'bold',
                                padding: { xs: '12px 8px', sm: '16px' }
                            }}
                        >
                            TEMPERATURE SENSOR (BEARING)
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow sx={{ backgroundColor: 'rgba(190, 221, 226, 0.3)' }}>
                        <TableCell
                            align="center"
                            sx={{
                                minWidth: '120px',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 600,
                                padding: { xs: '8px 4px', sm: '12px 8px' }
                            }}
                        >
                            LOCATION
                        </TableCell>
                        <TableCell
                            colSpan={2}
                            align="center"
                            sx={{
                                minWidth: '160px',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 600,
                                padding: { xs: '8px 4px', sm: '12px 8px' },
                                borderLeft: '1px solid rgba(224, 224, 224, 1)'
                            }}
                        >
                            DE
                        </TableCell>
                        <TableCell
                            colSpan={2}
                            align="center"
                            sx={{
                                minWidth: '160px',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 600,
                                padding: { xs: '8px 4px', sm: '12px 8px' },
                                borderLeft: '1px solid rgba(224, 224, 224, 1)'
                            }}
                        >
                            NDE
                        </TableCell>
                        <TableCell
                            align="center"
                            sx={{
                                minWidth: '100px',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 600,
                                padding: { xs: '8px 4px', sm: '12px 8px' },
                                borderLeft: '1px solid rgba(224, 224, 224, 1)'
                            }}
                        >
                            TYPE
                        </TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(190, 221, 226, 0.1)' } }}>
                        <TableCell
                            align="center"
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 500,
                                padding: { xs: '8px 4px', sm: '12px 8px' },
                                backgroundColor: 'rgba(0, 0, 0, 0.02)'
                            }}
                        >
                            CONNECTION No.
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={tempSensorsBearing.de_connection_no1}
                                onChange={(e) => onChange('de_connection_no1', e.target.value)}
                                inputProps={{
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={tempSensorsBearing.de_connection_no2}
                                onChange={(e) => onChange('de_connection_no2', e.target.value)}
                                inputProps={{
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={tempSensorsBearing.nde_connection_no1}
                                onChange={(e) => onChange('nde_connection_no1', e.target.value)}
                                inputProps={{
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={tempSensorsBearing.nde_connection_no2}
                                onChange={(e) => onChange('nde_connection_no2', e.target.value)}
                                inputProps={{
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                        <TableCell
                            rowSpan={2}
                            sx={{
                                padding: { xs: '8px 4px', sm: '12px 8px' },
                                verticalAlign: 'middle'
                            }}
                        >
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={tempSensorsBearing.sensor_type}
                                onChange={(e) => onChange('sensor_type', e.target.value)}
                                inputProps={{
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(190, 221, 226, 0.1)' } }}>
                        <TableCell
                            align="center"
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 500,
                                padding: { xs: '8px 4px', sm: '12px 8px' },
                                backgroundColor: 'rgba(0, 0, 0, 0.02)'
                            }}
                        >
                            RESISTANCE (Ω)
                        </TableCell>
                        <TableCell
                            colSpan={2}
                            sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}
                        >
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="number"
                                value={tempSensorsBearing.de_resistance}
                                onChange={(e) => onChange('de_resistance', e.target.value)}
                                inputProps={{
                                    step: "0.01",
                                    min: "0",
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                        <TableCell
                            colSpan={2}
                            sx={{ padding: { xs: '8px 4px', sm: '12px 8px' } }}
                        >
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="number"
                                value={tempSensorsBearing.nde_resistance}
                                onChange={(e) => onChange('nde_resistance', e.target.value)}
                                inputProps={{
                                    step: "0.01",
                                    min: "0",
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </>
));
TempSensorBearingTable.displayName = 'TempSensorBearingTable';

// 12. Heater Table
const HeaterTable = memo(({ heaters, onChange }) => (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table>
            <TableHead sx={{ backgroundColor: '#bedde2' }}>
                <TableRow>
                    <TableCell colSpan={5} align="center">HEATER</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell align="center">UNIT No.</TableCell>
                    <TableCell colSpan={2} align="center">1</TableCell>
                    <TableCell colSpan={2} align="center">2</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell align="center">CONNECTION No.</TableCell>
                    <TableCell>
                        <TextField
                            variant="standard"
                            size="small"
                            fullWidth
                            type="text"
                            value={heaters[0].connection_no1}
                            onChange={(e) => onChange(0, 'connection_no1', e.target.value)}
                        />
                    </TableCell>
                    <TableCell>
                        <TextField
                            variant="standard"
                            size="small"
                            fullWidth
                            type="text"
                            value={heaters[0].connection_no2}
                            onChange={(e) => onChange(0, 'connection_no2', e.target.value)}
                        />
                    </TableCell>
                    <TableCell>
                        <TextField
                            variant="standard"
                            size="small"
                            fullWidth
                            type="text"
                            value={heaters[1].connection_no1}
                            onChange={(e) => onChange(1, 'connection_no1', e.target.value)}
                        />
                    </TableCell>
                    <TableCell>
                        <TextField
                            variant="standard"
                            size="small"
                            fullWidth
                            type="text"
                            value={heaters[1].connection_no2}
                            onChange={(e) => onChange(1, 'connection_no2', e.target.value)}
                        />
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell align="center">RESISTANCE (Ω)</TableCell>
                    <TableCell colSpan={2}>
                        <TextField
                            variant="standard"
                            size="small"
                            fullWidth
                            type="number"
                            value={heaters[0].resistance}
                            onChange={(e) => onChange(0, 'resistance', e.target.value)}
                            inputProps={{ step: "0.01", min: "0" }}
                        />
                    </TableCell>
                    <TableCell colSpan={2}>
                        <TextField
                            variant="standard"
                            size="small"
                            fullWidth
                            type="number"
                            value={heaters[1].resistance}
                            onChange={(e) => onChange(1, 'resistance', e.target.value)}
                            inputProps={{ step: "0.01", min: "0" }}
                        />
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </TableContainer>
));
HeaterTable.displayName = 'HeaterTable';

// 13. Temperature Sensor Stator Table
const TempSensorStatorTable = memo(({ tempSensorsStator, onChange, onBulkUpdate }) => (
    <>
        <TableContainer
            component={Paper}
            sx={{
                mb: 2,
                overflowX: 'auto',
                maxWidth: '100%',
                '&::-webkit-scrollbar': {
                    height: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#bedde2',
                    borderRadius: '4px',
                },
            }}
        >
            <Table sx={{ minWidth: 900 }}>
                <TableHead sx={{ backgroundColor: '#bedde2' }}>
                    <TableRow>
                        <TableCell
                            colSpan={14}
                            align="center"
                            sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 'bold',
                                padding: { xs: '12px 8px', sm: '16px' }
                            }}
                        >
                            TEMPERATURE SENSOR (STATOR)
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow sx={{ backgroundColor: 'rgba(190, 221, 226, 0.3)' }}>
                        <TableCell
                            align="center"
                            sx={{
                                minWidth: '120px',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 600,
                                padding: { xs: '8px 4px', sm: '12px 8px' }
                            }}
                        >
                            ELEMENT ITEM
                        </TableCell>
                        {[1, 2, 3, 4, 5, 6].map(num => (
                            <TableCell
                                key={num}
                                align="center"
                                colSpan={2}
                                sx={{
                                    minWidth: '140px',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    fontWeight: 600,
                                    padding: { xs: '8px 4px', sm: '12px 8px' },
                                    borderLeft: num > 1 ? '1px solid rgba(224, 224, 224, 1)' : 'none'
                                }}
                            >
                                {num}
                            </TableCell>
                        ))}
                        <TableCell
                            align="center"
                            sx={{
                                minWidth: '100px',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 600,
                                padding: { xs: '8px 4px', sm: '12px 8px' },
                                borderLeft: '1px solid rgba(224, 224, 224, 1)'
                            }}
                        >
                            TYPE
                        </TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(190, 221, 226, 0.1)' } }}>
                        <TableCell
                            align="center"
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 500,
                                padding: { xs: '8px 4px', sm: '12px 8px' },
                                backgroundColor: 'rgba(0, 0, 0, 0.02)'
                            }}
                        >
                            CONNECTION No.
                        </TableCell>
                        {tempSensorsStator.map((sensor, index) => (
                            <React.Fragment key={index}>
                                <TableCell
                                    sx={{
                                        padding: { xs: '8px 4px', sm: '12px 8px' },
                                        minWidth: '70px'
                                    }}
                                >
                                    <TextField
                                        variant="standard"
                                        size="small"
                                        fullWidth
                                        type="text"
                                        value={sensor.connection_no1}
                                        onChange={(e) => onChange(index, 'connection_no1', e.target.value)}
                                        inputProps={{
                                            style: {
                                                fontSize: '0.875rem',
                                                padding: '4px 0'
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell
                                    sx={{
                                        padding: { xs: '8px 4px', sm: '12px 8px' },
                                        minWidth: '70px'
                                    }}
                                >
                                    <TextField
                                        variant="standard"
                                        size="small"
                                        fullWidth
                                        type="text"
                                        value={sensor.connection_no2}
                                        onChange={(e) => onChange(index, 'connection_no2', e.target.value)}
                                        inputProps={{
                                            style: {
                                                fontSize: '0.875rem',
                                                padding: '4px 0'
                                            }
                                        }}
                                    />
                                </TableCell>
                            </React.Fragment>
                        ))}
                        <TableCell
                            rowSpan={2}
                            sx={{
                                padding: { xs: '8px 4px', sm: '12px 8px' },
                                verticalAlign: 'middle'
                            }}
                        >
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={tempSensorsStator[0].sensor_type}
                                onChange={(e) => onBulkUpdate('sensor_type', e.target.value)}
                                inputProps={{
                                    style: {
                                        fontSize: '0.875rem',
                                        padding: '4px 0'
                                    }
                                }}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(190, 221, 226, 0.1)' } }}>
                        <TableCell
                            align="center"
                            sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                fontWeight: 500,
                                padding: { xs: '8px 4px', sm: '12px 8px' },
                                backgroundColor: 'rgba(0, 0, 0, 0.02)'
                            }}
                        >
                            RESISTANCE (Ω)
                        </TableCell>
                        {tempSensorsStator.map((sensor, index) => (
                            <TableCell
                                key={index}
                                colSpan={2}
                                sx={{
                                    padding: { xs: '8px 4px', sm: '12px 8px' }
                                }}
                            >
                                <TextField
                                    variant="standard"
                                    size="small"
                                    fullWidth
                                    type="number"
                                    value={sensor.resistance}
                                    onChange={(e) => onChange(index, 'resistance', e.target.value)}
                                    inputProps={{
                                        step: "0.01",
                                        min: "0",
                                        style: {
                                            fontSize: '0.875rem',
                                            padding: '4px 0'
                                        }
                                    }}
                                />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>

        <FormGroup
            row
            sx={{
                alignItems: 'center',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: { xs: 1, sm: 0 }
            }}
        >
            <Typography
                sx={{
                    mr: { xs: 1, sm: 2 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: 500
                }}
            >
                Result:
            </Typography>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={tempSensorsStator[0].result_status === 'Normal'}
                        onChange={(e) => onBulkUpdate('result_status', e.target.checked ? 'Normal' : 'Abnormal')}
                        sx={{
                            '& .MuiSvgIcon-root': {
                                fontSize: { xs: '1.2rem', sm: '1.5rem' }
                            }
                        }}
                    />
                }
                label={
                    <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Normal
                    </Typography>
                }
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={tempSensorsStator[0].result_status === 'Abnormal'}
                        onChange={(e) => onBulkUpdate('result_status', e.target.checked ? 'Abnormal' : 'Normal')}
                        sx={{
                            '& .MuiSvgIcon-root': {
                                fontSize: { xs: '1.2rem', sm: '1.5rem' }
                            }
                        }}
                    />
                }
                label={
                    <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Abnormal
                    </Typography>
                }
            />
        </FormGroup>
    </>
));
TempSensorStatorTable.displayName = 'TempSensorStatorTable';

// 14. Conclusion Section
const ConclusionSection = memo(({ header, onChange }) => (
    <Box sx={{ mb: 4 }}>
        <Typography
            variant="subtitle1"
            sx={{
                mb: 2,
                fontSize: { xs: '1rem', sm: '1.1rem' },
                fontWeight: 600
            }}
        >
            4. Conclusion and recommendation.
        </Typography>
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    label="Conclusion"
                    multiline
                    rows={4}
                    value={header.conclusion}
                    onChange={(e) => onChange('conclusion', e.target.value)}
                    variant="outlined"
                    sx={{
                        '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                    }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    fullWidth
                    label="Recommendation"
                    multiline
                    rows={4}
                    value={header.recommendation}
                    onChange={(e) => onChange('recommendation', e.target.value)}
                    variant="outlined"
                    sx={{
                        '& .MuiInputBase-root': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                    }}
                />
            </Grid>
        </Grid>
    </Box>
));
ConclusionSection.displayName = 'ConclusionSection';

// 15. Result Table Section
const ResultTableSection = memo(({ status, header, onStatusChange, onHeaderChange, getBackgroundColor }) => (
    <Box sx={{ mb: 4 }}>
        {/* Result Status Selection */}
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4,
                p: { xs: 2, sm: 3 },
                backgroundColor: 'rgba(190, 221, 226, 0.1)',
                borderRadius: 2
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    mb: 2,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    fontWeight: 700
                }}
            >
                RESULT:
            </Typography>
            <FormControl>
                <Select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    sx={{
                        backgroundColor: getBackgroundColor(status),
                        color: status ? 'white' : 'inherit',
                        fontWeight: 'bold',
                        fontSize: { xs: '1.1rem', sm: '1.3rem' },
                        minHeight: { xs: '60px', sm: '80px' },
                        width: { xs: '180px', sm: '220px' },
                        textAlign: 'center',
                        borderRadius: 2,
                        '& .MuiSelect-select': {
                            padding: { xs: '16px', sm: '20px' },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: '2px',
                            borderColor: status ? 'transparent' : 'rgba(0, 0, 0, 0.23)'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: status ? 'transparent' : 'rgba(0, 0, 0, 0.4)'
                        }
                    }}
                >
                    <MenuItem value="N">N - Normal</MenuItem>
                    <MenuItem value="W">W - Warning</MenuItem>
                    <MenuItem value="D">D - Danger</MenuItem>
                </Select>
            </FormControl>
        </Box>

        {/* Inspector Information Table */}
        <TableContainer
            component={Paper}
            sx={{
                overflowX: 'auto',
                boxShadow: 2,
                '&::-webkit-scrollbar': {
                    height: '8px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#bedde2',
                    borderRadius: '4px',
                },
            }}
        >
            <Table sx={{ minWidth: 500 }}>
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#bedde2' }}>
                        <TableCell
                            sx={{
                                width: { xs: '35%', sm: '40%' },
                                padding: { xs: '12px 8px', sm: '16px' }
                            }}
                        >
                            <Typography
                                variant="h6"
                                align="center"
                                sx={{
                                    fontSize: { xs: '0.95rem', sm: '1.15rem' },
                                    fontWeight: 700
                                }}
                            >
                                DESCRIPTION
                            </Typography>
                        </TableCell>
                        <TableCell
                            sx={{
                                padding: { xs: '12px 8px', sm: '16px' }
                            }}
                        >
                            <Typography
                                variant="h6"
                                align="center"
                                sx={{
                                    fontSize: { xs: '0.95rem', sm: '1.15rem' },
                                    fontWeight: 700
                                }}
                            >
                                TESTED AND INSPECTED BY
                            </Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(190, 221, 226, 0.1)' } }}>
                        <TableCell
                            sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 600,
                                padding: { xs: '12px 8px', sm: '16px' },
                                backgroundColor: 'rgba(0, 0, 0, 0.02)'
                            }}
                        >
                            Company Name
                        </TableCell>
                        <TableCell
                            align="center"
                            sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                padding: { xs: '12px 8px', sm: '16px' }
                            }}
                        >
                            U-SERVICES (THAILAND) CO.,LTD
                        </TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(190, 221, 226, 0.1)' } }}>
                        <TableCell
                            sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 600,
                                padding: { xs: '12px 8px', sm: '16px' },
                                backgroundColor: 'rgba(0, 0, 0, 0.02)'
                            }}
                        >
                            Name-Surname
                        </TableCell>
                        <TableCell sx={{ padding: { xs: '12px 8px', sm: '16px' } }}>
                            <TextField
                                variant="standard"
                                size="small"
                                fullWidth
                                type="text"
                                value={header.inspector_name}
                                inputProps={{
                                    style: {
                                        textAlign: 'center',
                                        fontSize: '0.95rem'
                                    }
                                }}
                                onChange={(e) => onHeaderChange('inspector_name', e.target.value)}
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(190, 221, 226, 0.1)' } }}>
                        <TableCell
                            sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 600,
                                padding: { xs: '12px 8px', sm: '16px' },
                                backgroundColor: 'rgba(0, 0, 0, 0.02)'
                            }}
                        >
                            Signature
                        </TableCell>
                        <TableCell
                            align="center"
                            sx={{
                                padding: { xs: '12px 8px', sm: '16px' }
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                width: '100%'
                            }}>
                                <SignaturePad
                                    value={header.inspector_signature}
                                    onChange={(value) => onHeaderChange('inspector_signature', value)}
                                />
                            </Box>
                        </TableCell>
                    </TableRow>
                    <TableRow sx={{ '&:hover': { backgroundColor: 'rgba(190, 221, 226, 0.1)' } }}>
                        <TableCell
                            sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                fontWeight: 600,
                                padding: { xs: '12px 8px', sm: '16px' },
                                backgroundColor: 'rgba(0, 0, 0, 0.02)'
                            }}
                        >
                            Date
                        </TableCell>
                        <TableCell
                            align="center"
                            sx={{
                                padding: { xs: '12px 8px', sm: '16px' }
                            }}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                label="Inspection Date"
                                value={header.inspection_completed_date}
                                onChange={(newValue) => onHeaderChange('inspection_completed_date', newValue)}
                                slotProps={{
                                    textField: {
                                        variant: 'standard',
                                        fullWidth: true,
                                        sx: {
                                            '& .MuiInputBase-input': {
                                                textAlign: 'center',
                                                fontSize: { xs: '0.875rem', sm: '1rem' }
                                            }
                                        }
                                    }
                                }}
                            />
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
));
ResultTableSection.displayName = 'ResultTableSection';

// เพิ่ม SignaturePad Component หลัง imports ทั้งหมด
const SignaturePad = memo(({ value, onChange }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [open, setOpen] = useState(false);
    const [context, setContext] = useState(null);

    // ป้องกันการ scroll ทั้งหน้า
    useEffect(() => {
        if (open) {
            const scrollY = window.scrollY;
            const body = document.body;
            const html = document.documentElement;

            // ล็อคการ scroll
            body.style.position = 'fixed';
            body.style.top = `-${scrollY}px`;
            body.style.width = '100%';
            body.style.overflowY = 'scroll'; // รักษา scrollbar width

            html.style.overflow = 'hidden';

            return () => {
                body.style.position = '';
                body.style.top = '';
                body.style.width = '';
                body.style.overflowY = '';
                html.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [open]);

    useEffect(() => {
        if (open && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            setContext(ctx);

            if (value) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                };
                img.src = value;
            }
        }
    }, [open, value]);

    const startDrawing = (e) => {
        if (!context) return;
        e.preventDefault();
        setIsDrawing(true);
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
        context.beginPath();
        context.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing || !context) return;
        e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
        context.lineTo(x, y);
        context.stroke();
    };

    const stopDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(false);
    };

    const clearSignature = () => {
        if (context && canvasRef.current) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const saveSignature = () => {
        if (canvasRef.current) {
            const dataURL = canvasRef.current.toDataURL('image/png');
            onChange(dataURL);
            setOpen(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                {value && (
                    <img
                        src={value}
                        alt="Signature"
                        style={{
                            maxWidth: '200px',
                            maxHeight: '60px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}
                    />
                )}
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Create />}
                    onClick={() => setOpen(true)}
                >
                    {value ? 'แก้ไขลายเซ็น' : 'เซ็นชื่อ'}
                </Button>
                {value && (
                    <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => onChange('')}
                    >
                        ลบ
                    </Button>
                )}
            </Box>

            {open && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        overflow: 'hidden',
                        touchAction: 'none'
                    }}
                    onClick={() => setOpen(false)}
                    onTouchStart={(e) => e.preventDefault()}
                    onTouchMove={(e) => e.preventDefault()}
                    onTouchEnd={(e) => e.preventDefault()}
                >
                    <Paper
                        sx={{
                            p: 3,
                            maxWidth: 600,
                            width: '90%',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        <Typography variant="h6" gutterBottom>
                            ลายเซ็นอิเล็กทรอนิกส์
                        </Typography>
                        <Box sx={{
                            border: '2px dashed #ccc',
                            borderRadius: 2,
                            backgroundColor: '#f9f9f9',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            p: 2,
                            mb: 2,
                            touchAction: 'none'
                        }}>
                            <canvas
                                ref={canvasRef}
                                width={500}
                                height={200}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                style={{
                                    cursor: 'crosshair',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    maxWidth: '100%',
                                    touchAction: 'none'
                                }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button onClick={clearSignature} startIcon={<Delete />}>
                                ล้าง
                            </Button>
                            <Button onClick={() => setOpen(false)}>
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={saveSignature}
                                variant="contained"
                                startIcon={<CheckCircle />}
                            >
                                บันทึกลายเซ็น
                            </Button>
                        </Box>
                    </Paper>
                </Box>
            )}
        </>
    );
});
SignaturePad.displayName = 'SignaturePad';