import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FloatingActionButtons from '../components/FloatingActionButtons';

const apiHost = import.meta.env.VITE_API_HOST || '';

// Helper function สำหรับจัดการค่าว่าง
const displayValue = (value, defaultValue = '-') => {
    if (value === null || value === undefined || value === '') {
        return defaultValue;
    }
    return value;
};



const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export default function PrintSCMReport() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [err, setErr] = useState('');
    const { inspNo } = useParams();
    const [zoom, setZoom] = useState(1);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.3));
    const handleResetZoom = () => setZoom(1);

    const fetchReport = async () => {
        setLoading(true);
        setErr('');
        try {
            const res = await fetch(`${apiHost}/api/forms/FormSquirrelCageMotor/${inspNo}`);
            const json = await res.json();

            if (json.success) {
                setData(json.data);
            } else {
                setErr('ไม่พบข้อมูล');
            }
        } catch (e) {
            console.error(e);
            setErr('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [inspNo]);

    // ฟังก์ชันสำหรับ Print
    const handlePrint = () => {
        const printContent = document.getElementById('pdf-content');
        if (!printContent) return;

        const printWindow = window.open('', '_blank', 'width=800,height=600');

        printWindow.document.write(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>SCM Inspection Report - ${inspNo || 'Report'}</title>
    <style>
      @page {
        size: A4;
        margin: 20px;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
        background: white;
      }
      
      body {
        font-family: Arial, sans-serif;
      }
      
      .page {
        width: 210mm;
        height: 297mm;
        page-break-after: always;
        page-break-inside: avoid;
        position: relative;
        overflow: hidden;
        background: white;
        border: 2px solid #000;
        box-sizing: border-box;
      }
      
      .page:last-child {
        page-break-after: auto;
      }
      
      @media print {
        html, body {
          width: 100%;
          height: 100%;
          background: white;
        }
        
        .page {
          margin: 0;
          page-break-after: always;
          box-shadow: none;
        }
      }
      
      @media screen {
        body {
          background: #f0f0f0;
          padding: 20px;
        }
        
        .page {
          margin: 0 auto 20px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
      }
          ${printContent.querySelector('style')?.textContent || ''}
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);

        printWindow.document.close();

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            setTimeout(() => {
                printWindow.close();
            }, 100);
        }, 500);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (err && !data) {
        return <div style={{ color: 'red', fontWeight: 600, padding: '20px' }}>{err}</div>;
    }

    return (

        <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh', padding: '20px' }}>  {/* เพิ่ม padding */}
            <style>{`
    @media print {
        .no-print {
            display: none !important;
        }
        body {
            background: white !important;
            padding: 0 !important;
        }
    }
    
    #pdf-content {
        transition: transform 0.2s ease;
    }
    
    @media screen and (min-width: 769px) and (max-width: 1024px) {
        #pdf-content {
            transform: scale(calc(0.85 * var(--zoom-level, 1)));
            transform-origin: top center;
        }
    }
    
    @media screen and (max-width: 768px) {
        #pdf-content {
            transform: scale(calc(0.6 * var(--zoom-level, 1)));
            transform-origin: top center;
        }
    }
    
    @media screen and (max-width: 480px) {
        #pdf-content {
            transform: scale(calc(0.45 * var(--zoom-level, 1)));
            transform-origin: top center;
        }
    }
`}</style>
            {/*  <div className="no-print" style={{
                position: 'sticky',
                top: 0,
                backgroundColor: '#f0f0f0',
                zIndex: 1000,
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                justifyContent: 'center',
                padding: '10px',
                flexWrap: 'wrap'
            }}>
                <button onClick={handleDownloadPDF} style={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download PDF
                </button>
                <button onClick={handlePrint} style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                        <rect x="6" y="14" width="12" height="8"></rect>
                    </svg>
                    Print
                </button>
                <button onClick={fetchReport} style={{
                    backgroundColor: 'white',
                    color: '#6b7280',
                    padding: '8px 16px',
                    border: '2px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    Reload
                </button>
            </div> */}

            <FloatingActionButtons
                onPrint={handlePrint}
                /* onDownloadPDF={handleDownloadPDF} */
                onReload={fetchReport}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
                currentZoom={zoom}
            />

            <div id="pdf-content" style={{
                maxWidth: '210mm',
                margin: '0 auto',
                '--zoom-level': zoom
            }}>
                <SCMInspectionForm data={data} inspNo={inspNo} />
                <SCMBeforeAfterImagesPage inspNo={inspNo} dataTag={data.tag_no} />
            </div>
        </div>
    );
}

function SCMInspectionForm({ data, inspNo }) {
    const checkbox = (checked) => checked ? '☑' : '☐';

    // 1. เพิ่ม state สำหรับรูป header
    const [headerImage, setHeaderImage] = useState(null);
    const [headerImageLoading, setHeaderImageLoading] = useState(true);

    // 2. เพิ่มการ fetch รูป header ใน useEffect
    useEffect(() => {
        const fetchHeaderImage = async () => {
            if (!inspNo) {
                setHeaderImageLoading(false);
                return;
            }

            try {
                setHeaderImageLoading(true);

                // Fetch เฉพาะรูป header (SCMHeader)
                const headerRes = await fetch(`${apiHost}/api/forms/FormScmImage/${inspNo}?location=SCMHeader&del=0`);
                const headerJson = await headerRes.json();

                if (headerJson.success && headerJson.data) {
                    // กรอง del = 0 ก่อน
                    const filteredData = Array.isArray(headerJson.data)
                        ? headerJson.data.filter(img => img.del === 0)
                        : (headerJson.data.del === 0 ? headerJson.data : null);

                    // ถ้าเป็น array ให้เอาตัวแรก
                    setHeaderImage(Array.isArray(filteredData) ? filteredData[0] : filteredData);
                } else {
                    setHeaderImage(null);
                }
            } catch (error) {
                console.error('Error fetching header image:', error);
                setHeaderImage(null);
            } finally {
                setHeaderImageLoading(false);
            }
        };

        fetchHeaderImage();
    }, [inspNo]);


    return (
        <div className="page" style={{
            width: '210mm',
            height: '297mm',
            padding: '6mm',
            backgroundColor: 'white',
            fontFamily: 'Arial, sans-serif',
            fontSize: '7.5pt',
            lineHeight: '1.0',
            color: '#000',
            boxSizing: 'border-box',
            border: '2px solid #000',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '20px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
        }}>
            <style>{`
        table.excel-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 3px;
        }
        table.excel-table td, table.excel-table th {
          border: 1px solid #000;
          padding: 1px 3px;
          font-size: 7pt;
          vertical-align: middle;
        }
        table.excel-table th {
          background-color: #d9d9d9;
          font-weight: bold;
          text-align: center;
        }
        .header-cell {
          background-color: #d9d9d9;
          font-weight: bold;
          padding: 2px 3px;
        }
        .label-cell {
          font-size: 7pt;
          padding: 1px 3px;
        }
        .value-cell {
          font-size: 7pt;
          padding: 1px 3px;
        }
        .section-header {
          font-weight: bold;
          font-size: 8pt;
          margin: 4px 0 2px 0;
        }
        .bordered-section {
          border: 2px solid #000;
          padding: 6px;
          margin-bottom: 6px;
        }

      `}</style>

            {/* Title */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
            }}>
                <img src="/img/U-LOGO.png" alt="" style={{ width: '80px', marginRight: '20px' }} />
                <div>
                    <h1 style={{ margin: 30, fontSize: '14pt', fontWeight: 'bold' }}>
                        Inspection Sheet For Squirrel Cage Motor
                    </h1>
                </div>
            </div>

            {/* Applied to */}
            <div className="bordered-section">
                <span style={{ fontWeight: 'bold' }}>Applied to : </span>
                {checkbox(data?.scm_gi_motor_type_mv == 1)} All Medium Voltage Motor &nbsp;&nbsp;
                {checkbox(data?.scm_gi_motor_type_lv == 1)} Low Voltage Motor &nbsp;&nbsp;
                {checkbox(data?.scm_gi_motor_type_special == 1)} Special Design of Low Voltage AC Motor
            </div>

            {/* Customer Info */}
            <table className="bordered-section" style={{ width: '100%' }}>
                <tbody>
                    <tr>
                        <td className="label-cell" style={{ width: '40%' }}>
                            Customer : <span style={{ fontWeight: 'bold' }}>{displayValue(data?.customer_name)}</span>
                        </td>
                        <td className="label-cell" style={{ width: '25%' }}>
                            Job No : <span style={{ fontWeight: 'bold' }}>{displayValue(data?.job_no)}</span>
                        </td>
                        <td className="label-cell" style={{ width: '35%' }}>
                            Inspection Date : <span style={{ fontWeight: 'bold' }}>{formatDate(data?.inspection_date)}</span>
                        </td>
                    </tr>
                    <tr>
                        <td className="label-cell">
                            Attention : <span style={{ fontWeight: 'bold' }}>{displayValue(data?.attention)}</span>
                        </td>
                        <td className="label-cell">
                            Tag No : <span style={{ fontWeight: 'bold' }}>{displayValue(data?.tag_no)}</span>
                        </td>
                        <td className="label-cell">
                            Name : <span style={{ fontWeight: 'bold' }}>{displayValue(data?.equipment_name)}</span>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Motor Nameplate and Driven */}
            <table className="excel-table" style={{ marginBottom: '10px' }}>
                <thead>
                    <tr>
                        <th colSpan="4" className="header-cell" style={{ width: '80%' }}>MOTOR NAMEPLATE</th>
                        <th className="header-cell" style={{ width: '40%' }}>DRIVEN (LOAD)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="label-cell">Manufacture : {displayValue(data?.fmn_manufacture)}</td>
                        <td className="label-cell">Frame /Model : {displayValue(data?.fmn_model)}</td>
                        <td className="label-cell" colSpan="2">Type : {displayValue(data?.fmn_type)}</td>
                        <td className="label-cell" rowSpan="6" style={{ verticalAlign: 'top' }}>
                            <div>EQUIPMENT : {displayValue(data?.scm_de_equipment_type)}</div>
                            <div style={{ marginTop: '5px' }}>MANUFACTORY : {displayValue(data?.scm_de_manufactory)}</div>
                            <div style={{ marginTop: '5px' }}>TAG NO. : {displayValue(data?.scm_de_tag_no)}</div>
                            <div style={{ marginTop: '5px' }}>SPEED : {displayValue(data?.scm_de_speed)} {displayValue(data?.scm_de_speed_unit, 'RPM')}</div>
                            <div style={{ marginTop: '5px' }}>DE BRG. : {displayValue(data?.scm_de_de_bearing)}</div>
                            <div style={{ marginTop: '5px' }}>NDE BRG. : {displayValue(data?.scm_de_nde_bearing)}</div>
                        </td>
                    </tr>
                    <tr>
                        <td className="label-cell">Power : {displayValue(data?.fmn_power)} {displayValue(data?.fmn_power_unit, 'kW')}</td>
                        <td className="label-cell">Speed : {displayValue(data?.fmn_speed)} {displayValue(data?.fmn_speed_unit, 'RPM')}</td>
                        <td className="label-cell" colSpan="2">Ser.No. : {displayValue(data?.fmn_ser_no)}</td>
                    </tr>
                    <tr>
                        <td className="label-cell">Voltage : {displayValue(data?.fmn_voltage)} V.</td>
                        <td className="label-cell">Frequency : {displayValue(data?.fmn_frequency)} Hz.</td>
                        <td className="label-cell">Insulation Class : {displayValue(data?.fmn_insulation_class)}</td>
                        <td className="label-cell">Design : {displayValue(data?.fmn_design)}</td>
                    </tr>
                    <tr>
                        <td className="label-cell">Current : {displayValue(data?.fmn_current)} A.</td>
                        <td className="label-cell">Cos.φ : {displayValue(data?.fmn_cos_phi)}</td>
                        <td className="label-cell">Temp.Rise Class : {displayValue(data?.fmn_temp_rise_class)}</td>
                        <td className="label-cell">Duty : {displayValue(data?.fmn_duty)}</td>
                    </tr>
                    <tr>
                        <td className="label-cell">DE Bearing : {displayValue(data?.fmn_de_bearing)}</td>
                        <td className="label-cell">NDE Bearing : {displayValue(data?.fmn_nde_bearing)}</td>
                        <td className="label-cell">IP : {displayValue(data?.fmn_ip)}</td>
                        <td className="label-cell">SF: {displayValue(data?.fmn_sf)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Section 1 & 2 with border */}
            <div style={{ border: '2px solid #000', marginBottom: '6px' }}>
                <div style={{ display: 'flex' }}>
                    {/* Left column */}
                    <div style={{ flex: '1', borderRight: '2px solid #000' }}>
                        <div style={{ borderBottom: '2px solid #000', padding: '10px' }}>
                            <div className="section-header">1. General Information.</div>
                            <div style={{ marginLeft: '15px', fontSize: '8pt', marginBottom: '5px' }}>
                                <div style={{ marginBottom: '3px' }}>
                                    1.1 Motor Mounting: &nbsp;
                                    {checkbox(data?.scm_gi_mounting_flange == 1)} Flange mounted &nbsp;&nbsp;
                                    {checkbox(data?.scm_gi_mounting_foot == 1)} Foot mounted
                                </div>
                                <div>
                                    1.2 Driven Connection: &nbsp;
                                    {checkbox(data?.scm_gi_connection_coupling == 1)} Coupling &nbsp;&nbsp;
                                    {checkbox(data?.scm_gi_connection_gearbox == 1)} Gear box &nbsp;&nbsp;
                                    {checkbox(data?.scm_gi_connection_vbelt == 1)} V - Belt
                                </div>
                            </div>
                        </div>

                        <div className="section-header" style={{ padding: '10px' }}>2. General check.
                            <table style={{ paddingLeft: '6px' }}>
                                <tbody>
                                    {data?.generalChecks?.map((check, idx) => (
                                        <tr key={idx}>
                                            <td className="label-cell" style={{ width: '50%' }}>
                                                2.{idx + 1} {displayValue(check.scm_gc_check_item || check.check_item)}
                                            </td>
                                            <td className="label-cell" style={{ width: '30%' }}>
                                                {checkbox(check.scm_gc_status === 'Normal' || check.status === 'Normal')} Normal &nbsp;&nbsp;
                                                {checkbox(check.scm_gc_status === 'Abnormal' || check.status === 'Abnormal')} Abnormal
                                            </td>
                                            <td className="label-cell" style={{ width: '20%' }}>
                                                <span style={{
                                                    borderBottom: '1px solid #666',
                                                    display: 'inline-block',
                                                    width: '100px',
                                                    textAlign: 'left'
                                                }}>
                                                    {displayValue(check.scm_gc_remarks)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right column */}
                    <div style={{
                        width: '250px', flexShrink: 0, padding: '10px'
                    }}>
                        <div className="section-header" style={{ textAlign: 'center' }}>General Picture/Connection diagram</div>
                        <div style={{
                            border: '1px solid #000',
                            height: '180px',
                            backgroundColor: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '8pt',
                            color: '#999'
                        }}>
                            {headerImageLoading ? (
                                <span>Loading...</span>
                            ) : headerImage?.image_path ? (
                                <img
                                    src={`${apiHost}${headerImage.image_path}`}
                                    alt="Connection diagram"
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<span style="font-size: 8pt; color: #999;">Image not found</span>';
                                    }}
                                />
                            ) : (
                                <span>Diagram/Image</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3 with border */}
            <div className="bordered-section">
                <div className="section-header">
                    3. Standstill Test. &nbsp;&nbsp;&nbsp;&nbsp;
                    <span style={{ fontSize: '8pt', fontWeight: 'normal' }}>
                        {checkbox(data?.scm_st_application == 1)} Application &nbsp;&nbsp;
                        {checkbox(data?.scm_st_not_application == 1)} Not Application
                    </span>
                </div>

                <div style={{ marginLeft: '15px', fontSize: '8pt', marginBottom: '5px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>3.1 Winding Condition.</div>
                    <div style={{ marginLeft: '10px', marginBottom: '5px' }}>
                        {checkbox(data?.scm_st_winding_include_cable == 1)} Include Cable &nbsp;&nbsp;
                        {checkbox(data?.scm_st_winding_exclude_cable == 1)} Exclude Cable
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
                    <div style={{ flex: '0 0 auto' }}>
                        <table className="excel-table" style={{ marginBottom: '3px' }}>
                            <thead>
                                <tr>
                                    <th colSpan="8">Insulation Test (MΩ)</th>
                                </tr>
                                <tr>
                                    <th rowSpan="2">Volt</th>
                                    <th rowSpan="2">Marking</th>
                                    <th colSpan="2" style={{ width: '100px' }}>1 min.</th>
                                    <th colSpan="2" style={{ width: '100px' }}>10 min.</th>
                                    <th rowSpan="2" style={{ width: '50px' }}>PI</th>
                                    <th rowSpan="2" style={{ width: '50px' }}>Winding<br />Temp</th>
                                </tr>
                                <tr>
                                    <th style={{ width: '50px' }}>C</th>
                                    <th style={{ width: '50px' }}>40°C</th>
                                    <th style={{ width: '50px' }}>C</th>
                                    <th style={{ width: '50px' }}>40°C</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.insulationTests?.map((test, idx) => (
                                    <tr key={idx}>
                                        <td className="value-cell" style={{ textAlign: 'center' }}>
                                            {displayValue(test.scm_it_test_voltage || test.test_voltage)}
                                        </td>
                                        <td className="value-cell" style={{ textAlign: 'center' }}>
                                            {displayValue(test.scm_it_phase_marking || test.phase_marking)}
                                        </td>
                                        <td className="value-cell" style={{ textAlign: 'center' }}>
                                            {displayValue(test.scm_it_resistance_1min_c || test.resistance_1min_c)}
                                        </td>
                                        <td className="value-cell" style={{ textAlign: 'center' }}>
                                            {displayValue(test.scm_it_resistance_1min_40c || test.resistance_1min_40c)}
                                        </td>
                                        <td className="value-cell" style={{ textAlign: 'center' }}>
                                            {displayValue(test.scm_it_resistance_10min_c || test.resistance_10min_c)}
                                        </td>
                                        <td className="value-cell" style={{ textAlign: 'center' }}>
                                            {displayValue(test.scm_it_resistance_10min_40c || test.resistance_10min_40c)}
                                        </td>
                                        <td className="value-cell" style={{ textAlign: 'center' }}>
                                            {displayValue(test.scm_it_polarization_index || test.polarization_index)}
                                        </td>
                                        <td className="value-cell" style={{ textAlign: 'center' }}>
                                            {displayValue(test.scm_it_winding_temp || test.winding_temp)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ fontSize: '7pt', fontStyle: 'italic', color: 'red' }}>
                            Refer Standard IEEE 43-2000 : Min. Insulation Recommend &gt;100 MΩ / Polarization Index Recommend 2-5
                        </div>
                    </div>

                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <table className="excel-table">
                            <thead>
                                <tr>
                                    <th rowSpan="2" align="center">Test Condition</th>
                                    <th colSpan="3" align="center">Main Stator</th>
                                </tr>
                                <tr>
                                    <th align="center">U - V</th>
                                    <th align="center">U - W</th>
                                    <th align="center">V - W</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="label-cell">Resistance ({displayValue(data?.scm_rt_test_unit, 'm')}Ω)</td>
                                    <td className="value-cell" style={{ textAlign: 'center' }}>{displayValue(data?.scm_rt_resistance_uv)}</td>
                                    <td className="value-cell" style={{ textAlign: 'center' }}>{displayValue(data?.scm_rt_resistance_uw)}</td>
                                    <td className="value-cell" style={{ textAlign: 'center' }}>{displayValue(data?.scm_rt_resistance_vw)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="4" className="label-cell">
                                        Result: {checkbox(data?.scm_rt_result_status === 'Normal')} Normal &nbsp;&nbsp;
                                        {checkbox(data?.scm_rt_result_status === 'Abnormal')} Abnormal
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <table className="excel-table">
                            <thead>
                                <tr>
                                    <th rowSpan="2" align="center">Test Condition</th>
                                    <th colSpan="3" align="center">Main Stator</th>
                                </tr>
                                <tr>
                                    <th align="center">U - V</th>
                                    <th align="center">U - W</th>
                                    <th align="center">V - W</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="label-cell">Inductance ({displayValue(data?.scm_lt_test_unit, 'm')}H)</td>
                                    <td className="value-cell" style={{ textAlign: 'center' }}>{displayValue(data?.scm_lt_inductance_uv)}</td>
                                    <td className="value-cell" style={{ textAlign: 'center' }}>{displayValue(data?.scm_lt_inductance_uw)}</td>
                                    <td className="value-cell" style={{ textAlign: 'center' }}>{displayValue(data?.scm_lt_inductance_vw)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="4" className="label-cell">
                                        Result: {checkbox(data?.scm_lt_result_status === 'Normal')} Normal &nbsp;&nbsp;
                                        {checkbox(data?.scm_lt_result_status === 'Abnormal')} Abnormal
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ marginLeft: '15px', fontWeight: 'bold', fontSize: '9pt', marginBottom: '5px' }}>
                    3.2 Temperature Sensor And Heater
                </div>

                <table className="excel-table" style={{ marginBottom: '8px', tableLayout: 'fixed', width: '100%' }}>
                    <colgroup>
                        <col style={{ width: '20%' }} /> {/* LOCATION */}
                        <col style={{ width: '6.5%' }} /> {/* DE col 1 */}
                        <col style={{ width: '6.5%' }} /> {/* DE col 2 */}
                        <col style={{ width: '6.5%' }} /> {/* NDE col 1 */}
                        <col style={{ width: '6.5%' }} /> {/* NDE col 2 */}
                        <col style={{ width: '8%' }} />  {/* TYPE */}
                        <col style={{ width: '20%' }} /> {/* UNIT No */}
                        <col style={{ width: '6.5%' }} /> {/* UNIT 1 col 1 */}
                        <col style={{ width: '6.5%' }} /> {/* UNIT 1 col 2 */}
                        <col style={{ width: '6.5%' }} /> {/* UNIT 2 col 1 */}
                        <col style={{ width: '6.5%' }} /> {/* UNIT 2 col 2 */}
                    </colgroup>
                    <thead>
                        <tr>
                            <th colSpan="6" className="header-cell">TEMPERATURE SENSOR (BEARING)</th>
                            <th colSpan="5" className="header-cell">HEATER</th>
                        </tr>
                        <tr>
                            <th>LOCATION</th>
                            <th colSpan={2}>DE</th>
                            <th colSpan={2}>NDE</th>
                            <th>TYPE</th>
                            <th>UNIT No</th>
                            <th colSpan={2}>UNIT No. 1</th>
                            <th colSpan={2}>UNIT No. 2</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="label-cell">CONNECTION No.</td>
                            <td className="value-cell" align="center">{displayValue(data?.scm_tsb_de_connection_no1)}</td>
                            <td className="value-cell" align="center">{displayValue(data?.scm_tsb_de_connection_no2)}</td>
                            <td className="value-cell" align="center">{displayValue(data?.scm_tsb_nde_connection_no1)}</td>
                            <td className="value-cell" align="center">{displayValue(data?.scm_tsb_nde_connection_no2)}</td>
                            <td className="value-cell" rowSpan={2} align="center">{displayValue(data?.scm_tsb_sensor_type)}</td>
                            <td className="label-cell">CONNECTION No.</td>
                            <td className="value-cell" align="center">{displayValue(data?.heaters?.[0]?.scm_h_connection_no1 || data?.heaters?.[0]?.connection_no1)}</td>
                            <td className="value-cell" align="center">{displayValue(data?.heaters?.[0]?.scm_h_connection_no2 || data?.heaters?.[0]?.connection_no2)}</td>
                            <td className="value-cell" align="center">{displayValue(data?.heaters?.[1]?.scm_h_connection_no1 || data?.heaters?.[1]?.connection_no1)}</td>
                            <td className="value-cell" align="center">{displayValue(data?.heaters?.[1]?.scm_h_connection_no2 || data?.heaters?.[1]?.connection_no2)}</td>
                        </tr>
                        <tr>
                            <td className="label-cell">RESISTANCE (Ω)</td>
                            <td className="value-cell" colSpan={2} align="center">{displayValue(data?.scm_tsb_de_resistance)}</td>
                            <td className="value-cell" colSpan={2} align="center">{displayValue(data?.scm_tsb_nde_resistance)}</td>
                            <td className="label-cell">RESISTANCE (Ω)</td>
                            <td className="value-cell" colSpan={2} align="center">{displayValue(data?.heaters?.[0]?.scm_h_resistance || data?.heaters?.[0]?.resistance)}</td>
                            <td className="value-cell" colSpan={2} align="center">{displayValue(data?.heaters?.[1]?.scm_h_resistance || data?.heaters?.[1]?.resistance)}</td>
                        </tr>
                    </tbody>
                </table>
                <table className="excel-table" style={{ marginBottom: '5px', width: '100%', borderCollapse: 'collapse' }}>
                    <colgroup>
                        <col style={{ width: '250px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '60px' }} />
                        <col style={{ width: '100px' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th colSpan="14" className="header-cell">TEMPERATURE SENSOR (STATOR)</th>
                        </tr>
                        <tr>
                            <th>ELEMENT ITEM</th>
                            {[1, 2, 3, 4, 5, 6].map(num => (
                                <th colSpan={2} key={num}>{num}</th>
                            ))}
                            <th>TYPE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="label-cell">CONNECTION No.</td>
                            {data?.tempSensorsStator?.map((sensor, idx) => (
                                <React.Fragment key={idx}>
                                    <td className="value-cell" align='center'>
                                        {displayValue(sensor.scm_tss_connection_no1 || sensor.connection_no1)}
                                    </td>
                                    <td className="value-cell" align='center'>
                                        {displayValue(sensor.scm_tss_connection_no2 || sensor.connection_no2)}
                                    </td>
                                </React.Fragment>
                            ))}
                            <td className="value-cell" rowSpan="2" align='center'>
                                {displayValue(data?.tempSensorsStator?.[0]?.scm_tss_sensor_type || data?.tempSensorsStator?.[0]?.sensor_type)}
                            </td>
                        </tr>
                        <tr>
                            <td className="label-cell">RESISTANCE (Ω)</td>
                            {data?.tempSensorsStator?.map((sensor, idx) => (
                                <td key={idx} className="value-cell" colSpan={2} align='center'>
                                    {displayValue(sensor.scm_tss_resistance || sensor.resistance)}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
                <div style={{ fontSize: '8pt', marginBottom: '5px' }}>
                    Result: {checkbox(data?.tempSensorsStator?.[0]?.scm_tss_result_status === 'Normal' || data?.tempSensorsStator?.[0]?.result_status === 'Normal')} Normal &nbsp;&nbsp;
                    {checkbox(data?.tempSensorsStator?.[0]?.scm_tss_result_status === 'Abnormal' || data?.tempSensorsStator?.[0]?.result_status === 'Abnormal')} Abnormal
                </div>
            </div>

            {/* Section 4 with border */}
            <div className="bordered-section">
                <div className="section-header">4. Conclusion and recommendation</div>
                <div style={{ marginLeft: '15px', marginBottom: '8px' }}>
                    <div
                        style={{
                            border: '1px solid #000',
                            minHeight: '30px',
                            padding: '5px',
                            fontSize: '8pt',
                            marginBottom: '8px'
                        }}>
                        Conclusion: {displayValue(data?.conclusion)}
                    </div>
                    <div
                        style={{
                            border: '1px solid #000',
                            minHeight: '30px',
                            padding: '5px',
                            fontSize: '8pt',
                            marginBottom: '8px'
                        }}>
                        Recommendation: {displayValue(data?.recommendation)}
                    </div>
                </div>
            </div>

            {/* Footer with border */}
            <div className="bordered-section">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '80px', verticalAlign: 'top', padding: '0' }} align='center'>
                                <div style={{
                                    fontWeight: 'bold',
                                    fontSize: '9pt',
                                    marginBottom: '8px',
                                    borderBottom: '1px solid #333',
                                    paddingBottom: '5px'
                                }}>
                                    RESULT
                                </div>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    backgroundColor: data?.overall_status === 'N' ? '#4CAF50' : data?.overall_status === 'W' ? '#FFC107' : '#F44336',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    border: '1px solid #000'
                                }}>
                                    <span style={{
                                        color: 'white',
                                        fontSize: '24pt',
                                        fontWeight: 'bold'
                                    }}>
                                        {displayValue(data?.overall_status, 'N')}
                                    </span>
                                </div>
                            </td>
                            <td style={{ width: '100px', verticalAlign: 'top', padding: '0 20px' }}>
                                <div style={{
                                    fontWeight: 'bold',
                                    fontSize: '9pt',
                                    marginBottom: '8px',
                                    paddingBottom: '5px'
                                }}>
                                    Definition
                                </div>
                                <div style={{ fontSize: '7pt', lineHeight: '1.4' }}>
                                    <div>N = Normal</div>
                                    <div>W = Warning</div>
                                    <div>D = Danger</div>
                                </div>
                            </td>
                            <td style={{
                                verticalAlign: 'top',
                                padding: '0px 20px',
                                borderLeft: '2px solid #000'
                            }}>
                                <div style={{
                                    fontWeight: 'bold',
                                    fontSize: '9pt',
                                    marginBottom: '8px',
                                    borderBottom: '1px solid #333',
                                    paddingBottom: '5px'
                                }}>
                                    TESTED AND INSPECTED BY
                                </div>

                                <div style={{
                                    display: 'flex',
                                    gap: '20px',
                                    fontSize: '8pt',
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: '5px' }}>
                                            <span style={{ fontWeight: '600' }}>Company:</span> U-SERVICES (THAILAND) CO.,LTD.
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
                                            <span style={{ fontWeight: '600' }}>Date:</span> {formatDate(data?.inspection_completed_date)}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: '5px' }}>
                                            <span style={{ fontWeight: '600' }}>Name-Surname:</span> {displayValue(data?.inspector_name)}
                                        </div>
                                        <div style={{ marginTop: '8px', display: "flex" }}>
                                            <div style={{ fontWeight: '600', marginRight: '5px' }}>Signature:</div>
                                            {data?.inspector_signature ? (
                                                <img
                                                    src={data.inspector_signature}
                                                    alt="Inspector Signature"
                                                    style={{
                                                        maxWidth: '150px',
                                                        maxHeight: '50px',
                                                        borderRadius: '3px',
                                                        backgroundColor: '#fffeb0ff',
                                                        display: 'block'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    height: '50px',
                                                    width: '150px',
                                                    border: '1px solid #ccc',
                                                    backgroundColor: '#f9f9f9',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#999999ff',
                                                    fontSize: '7pt'
                                                }}>
                                                    (No signature)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Document Footer */}
            <div style={{
                /* borderTop: '1px solid #666',
                paddingTop: '5px', */
                fontSize: '6pt',
                color: '#666',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <div>Effective date: {new Date().toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                })}
                </div>
                <div>
                    PM-FM-RY-009 Rev.01
                </div>
            </div>
        </div >
    );
}

function SCMBeforeAfterImagesPage({ inspNo, dataTag }) {
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchImages = async () => {
            if (!inspNo) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const res = await fetch(`${apiHost}/api/forms/FormScmImage/${inspNo}`);
                const json = await res.json();

                if (json.success && json.data && Array.isArray(json.data)) {
                    setImages(json.data.filter(img => img.del === 0 && img.location !== 'SCMHeader'));
                } else {
                    setImages([]);
                }

            } catch (error) {
                console.error('Error fetching images:', error);
                setImages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [inspNo, apiHost]);

    if (loading) {
        return (
            <div style={{
                width: '210mm',
                minHeight: '297mm',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'white'
            }}>
                <div>Loading images...</div>
            </div>
        );
    }

    if (images.length === 0) {
        return null;
    }

    // แบ่งรูปภาพเป็นหน้า ๆ ละ 6 รูป
    const imagesPerPage = 6;
    const pages = [];
    for (let i = 0; i < images.length; i += imagesPerPage) {
        pages.push(images.slice(i, i + imagesPerPage));
    }

    return (
        <>
            {pages.map((pageImages, pageIndex) => (
                <div
                    key={pageIndex}
                    className="page"
                    style={{
                        width: '210mm',
                        height: '297mm',
                        backgroundColor: 'white',
                        fontFamily: 'Arial, sans-serif',
                        fontSize: '9pt',
                        color: '#000',
                        boxSizing: 'border-box',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '2px solid #000',
                        overflow: 'hidden',
                        marginBottom: '20px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    }}
                >
                    <style>{`
                        @media print {
                            .page-container {
                                page-break-after: always;
                            }
                        }
                        .image-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            grid-template-rows: repeat(3, 1fr);
                            gap: 8px;
                            flex: 1;
                            min-height: 0;
                        }
                        .image-item {
                            border: 1px solid #000;
                            padding: 4px;
                            display: flex;
                            flex-direction: column;
                            min-height: 0;
                            background-color: #f9f9f9;
                        }
                        .image-box {
                            flex: 1;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background-color: #fff;
                            position: relative;
                            overflow: hidden;
                            min-height: 0;
                            width: 100%;
                            aspect-ratio: 1 / 1;
                        }
                        .image-box img {
                            max-width: 100%;
                            max-height: 100%;
                            width: auto;
                            height: auto;
                            object-fit: contain;
                            display: block;
                        }
                        .image-number {
                            font-size: 12pt;
                            color: #666;
                            text-align: center;
                            padding: 2px 0;
                            font-weight: bold;
                        }
                    `}</style>

                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px',
                        paddingBottom: '4px',
                        borderBottom: '2px solid #000',
                        padding: '8mm',
                        flexShrink: 0
                    }}>
                        <img src="/img/U-LOGO.png" alt="" style={{ width: '80px', marginRight: '20px' }} />
                        <div>
                            <h1 style={{ margin: '0 0 3px 80px', fontSize: '14pt' }}>
                                U-SERVICES (THAILAND) CO., LTD
                            </h1>
                        </div>
                    </div>
                    {/* Title */}
                    <div style={{ flexShrink: 0 }}>
                        <h2 style={{
                            display: 'flex',
                            justifyContent: 'center',
                            margin: '12px 0',
                            fontSize: '12pt'
                        }}>
                            General Photo
                        </h2>
                    </div>

                    {/* Images Grid */}
                    <div className="image-grid" style={{ padding: '8mm', }}>
                        {pageImages.map((image, idx) => {
                            const globalIndex = pageIndex * imagesPerPage + idx + 1;
                            const imageUrl = image.image_path
                                ? `${apiHost}${image.image_path}`
                                : null;

                            return (
                                <div key={image.id || idx} className="image-item">
                                    <div className="image-box">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={`Image ${globalIndex}`}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const parent = e.target.parentElement;
                                                    if (!parent.querySelector('.error-text')) {
                                                        const span = document.createElement('span');
                                                        span.className = 'error-text';
                                                        span.style.cssText = 'font-size: 8pt; color: #999;';
                                                        span.textContent = 'Image not found';
                                                        parent.appendChild(span);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: '8pt', color: '#999' }}>
                                                No Image
                                            </span>
                                        )}
                                    </div>
                                    <div className="image-number">
                                        {/* Image {globalIndex} */}
                                        {displayValue(image.img_description, `Photo ${globalIndex}`)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div style={{
                        borderTop: '2px solid #0c0a0aff',
                        paddingTop: '4px',
                        marginTop: '6px',
                        fontSize: '7pt',
                        color: '#666',
                        display: 'flex',
                        padding: '8mm',
                        justifyContent: 'space-between',
                        flexShrink: 0
                    }}>
                        <div>Tag No: {dataTag || '-'}</div>
                        <div>
                            Page {pageIndex + 2} - {new Date().toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}