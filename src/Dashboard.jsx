import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  ButtonBase,
  InputBase,
} from "@mui/material";
import {
  Search,
  Pencil,
  ScanLine,
  FileText,
  SearchCheck,
  BellRing,
  UserLock
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

import QRCodeScanner from "./components/QRCodeScanner";

export default function Dashboard() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [openScanner, setOpenScanner] = useState(false);
  const [stationCounts, setStationCounts] = useState({});

  const branch = sessionStorage.getItem('usvt_branch');
  const userRole = sessionStorage.getItem("usvt_role") || "";



  const createItems = [
    ...(userRole === "developer" || userRole === "admin"
      ? [{
        title: "User Manager",
        subtitle: "จัดการผู้ใช้งาน",
        icon: <UserLock size={36} />,
        color: "linear-gradient(135deg, #e0f7fa, #80deea)",
        onClick: () => navigate('/user/manager')
      }]
      : []),
    {
      title: "Project Start",
      subtitle: "เริ่มโปรเจกต์ใหม่",
      icon: <Pencil size={36} />,
      color: "linear-gradient(135deg, #e0f7fa, #80deea)",
      onClick: () => navigate('/project-start')
    },
    {
      title: "Search",
      subtitle: "ค้นหาข้อมูล",
      icon: <SearchCheck size={36} />,
      color: "linear-gradient(135deg, rgb(245, 245, 232), rgb(193, 199, 129))",
      onClick: () => navigate('/Search-List')
    },
    {
      title: "Notifications",
      subtitle: "การแจ้งเตือน",
      icon: <BellRing size={36} />,
      color: "linear-gradient(135deg, rgb(255, 245, 230), rgb(255, 200, 150))",
      onClick: () => navigate('/notifications/followed')
    }
  ];

  const processItems = [
    {
      title: "Scan Tag",
      subtitle: "แสกน QR",
      icon: <ScanLine size={36} />,
      color: "linear-gradient(135deg, #e8f5e9, #81c784)",
      onClick: () => setOpenScanner(true)
    },
    {
      title: "Form",
      subtitle: "ฟอร์มเพิ่มเติม",
      icon: <FileText size={36} />,
      color: "linear-gradient(135deg, #e3f2fd, #64b5f6)",
      onClick: () => navigate('/FormList')
    }
  ];

  const handleScanSuccess = (result) => {
    const encoded = encodeURIComponent(result);
    navigate(`/inspection/${encoded}?from=QR-Scan`);
  };

  const handleCloseScanner = () => {
    setOpenScanner(false);
  };

  const filterItems = (items) => {
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderSection = (title, items) => {
    const filteredItems = filterItems(items);

    if (filteredItems.length === 0) return null;

    return (
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 700,
            color: "#37474f",
            fontSize: { xs: "1.1rem", sm: "1.25rem" }
          }}
        >
          {title}
        </Typography>
        <Grid container spacing={2}>
          {filteredItems.map((item, index) => (
            <Grid item key={index}>
              <ButtonBase
                onClick={item.onClick}
                disableRipple
                sx={{
                  width: { xs: 140, sm: 150 },
                  height: { xs: 140, sm: 150 },
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-4px) scale(1.02)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  },
                  "&:active": {
                    transform: "translateY(-2px) scale(1.01)",
                  }
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    padding: 2,
                    background: item.color,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: 1,
                    borderRadius: 3,
                  }}
                >
                  <Box
                    sx={{
                      color: "#37474f",
                      transition: "transform 0.3s ease",
                      "button:hover &": {
                        transform: "scale(1.1)",
                      }
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      color: "#37474f"
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: { xs: "0.75rem", sm: "0.85rem" },
                      color: "#546e7a",
                      lineHeight: 1.2
                    }}
                  >
                    {item.subtitle}
                  </Typography>
                </Box>
              </ButtonBase>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        paddingTop: { xs: 2, sm: 4 },
        display: "flex",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f9fbfc 0%, #e0f7fa 100%)",
        px: { xs: 2, sm: 3, md: 4 },
        pb: 6,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1200 }}>
        {/* Search Box */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 4,
            px: 2,
            py: 1.5,
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            backgroundColor: "#ffffff",
            maxWidth: 500,
            transition: "box-shadow 0.3s ease",
            "&:focus-within": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            }
          }}
        >
          <Search size={20} style={{ marginRight: 12, color: "#90a4ae" }} />
          <InputBase
            placeholder="ค้นหาเมนู..."
            sx={{
              fontSize: { xs: 14, sm: 15 },
              flex: 1,
              color: "#37474f"
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        {/* Sections */}
        {/*  {renderSection("สร้าง / ค้นหา", createItems)} */}
        {renderSection("ตรวจสอบ / ดำเนินการ", processItems)}
      </Box>

      {/* QR Scanner Modal */}
      {openScanner && (
        <Box
          onClick={handleCloseScanner}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            backdropFilter: "blur(4px)",
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              background: "#fff",
              p: 3,
              borderRadius: 3,
              maxWidth: 450,
              width: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <QRCodeScanner
              onScanSuccess={handleScanSuccess}
              onClose={handleCloseScanner}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}