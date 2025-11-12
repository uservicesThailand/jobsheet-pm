import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  ButtonBase,
  InputBase,
  Container,
  Fade,
  Paper,
} from "@mui/material";
import {
  Search,
  ScanLine,
  FileText,
  UserLock,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import QRCodeScanner from "./components/QRCodeScanner";

export default function Dashboard() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [openScanner, setOpenScanner] = useState(false);

  const userRole = sessionStorage.getItem("usvt_role") || "";

  const createItems = [
    ...(userRole === "developer" || userRole === "admin"
      ? [{
        title: "User Manager",
        subtitle: "จัดการผู้ใช้งาน",
        icon: <UserLock size={40} />,
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        shadowColor: "rgba(102, 126, 234, 0.4)",
        onClick: () => navigate('/user/manager')
      }]
      : []),
  ];

  const processItems = [
    {
      title: "Scan Tag",
      subtitle: "แสกน QR",
      icon: <ScanLine size={40} />,
      gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      shadowColor: "rgba(48, 207, 208, 0.4)",
      onClick: () => setOpenScanner(true)
    },
    {
      title: "Form",
      subtitle: "ฟอร์มเพิ่มเติม",
      icon: <FileText size={40} />,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      shadowColor: "rgba(240, 147, 251, 0.4)",
      onClick: () => navigate('/FormList')
    }
  ];

  const handleScanSuccess = (result) => {
    const encoded = encodeURIComponent(result);
    navigate(`/formNumberInput/${encoded}?from=QR-Scan`);
  };

  const handleCloseScanner = () => {
    setOpenScanner(false);
  };

  const allItems = [...createItems, ...processItems];
  const filteredItems = allItems.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        py: { xs: 3, sm: 5 },
      }}
    >
      <Container maxWidth="lg">
        {/* Header with Search */}
        <Box sx={{ mb: 5 }}>
          {/* <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              letterSpacing: "-0.02em"
            }}
          >
            Dashboard
          </Typography> */}

          {/* Modern Search Box */}
          <Paper
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              px: 3,
              py: 2,
              borderRadius: 5,
              maxWidth: 600,
              background: "#ffffff",
              border: "2px solid transparent",
              transition: "all 0.3s ease",
              "&:focus-within": {
                borderColor: "#667eea",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.25)",
                transform: "translateY(-2px)"
              }
            }}
          >
            <Search size={22} style={{ marginRight: 16, color: "#667eea" }} />
            <InputBase
              placeholder="ค้นหาเมนูที่ต้องการ..."
              sx={{
                fontSize: { xs: 15, sm: 16 },
                flex: 1,
                color: "#1a202c",
                fontWeight: 500,
                "& ::placeholder": {
                  color: "#a0aec0",
                  opacity: 1
                }
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Paper>
        </Box>

        {/* Menu Cards */}
        <Grid container spacing={3}>
          {filteredItems.map((item, index) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
              <Fade in timeout={300 + index * 100}>
                <ButtonBase
                  onClick={item.onClick}
                  disableRipple
                  sx={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: 4,
                    overflow: "hidden",
                    position: "relative",
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.03)",
                      "& .card-shadow": {
                        opacity: 1,
                      },
                      "& .icon-wrapper": {
                        transform: "scale(1.15) rotate(5deg)",
                      }
                    },
                    "&:active": {
                      transform: "translateY(-4px) scale(1.01)",
                    }
                  }}
                >
                  {/* Shadow Layer */}
                  <Box
                    className="card-shadow"
                    sx={{
                      position: "absolute",
                      inset: -2,
                      background: item.gradient,
                      filter: "blur(20px)",
                      opacity: 0.6,
                      transition: "opacity 0.4s ease",
                      zIndex: 0,
                    }}
                  />

                  {/* Card Content */}
                  <Paper
                    elevation={0}
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      padding: { xs: 2, sm: 3 },
                      background: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      gap: { xs: 1, sm: 1.5 },
                      borderRadius: 4,
                      border: "1px solid rgba(0,0,0,0.06)",
                      zIndex: 1,
                    }}
                  >
                    {/* Icon with Gradient Background */}
                    <Box
                      className="icon-wrapper"
                      sx={{
                        width: { xs: 60, sm: 70 },
                        height: { xs: 60, sm: 70 },
                        borderRadius: 3,
                        background: item.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        boxShadow: `0 8px 16px ${item.shadowColor}`,
                      }}
                    >
                      {item.icon}
                    </Box>

                    {/* Title */}
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "0.95rem", sm: "1.05rem" },
                        color: "#1a202c",
                        letterSpacing: "-0.01em"
                      }}
                    >
                      {item.title}
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                      sx={{
                        fontWeight: 500,
                        fontSize: { xs: "0.75rem", sm: "0.85rem" },
                        color: "#718096",
                        lineHeight: 1.3
                      }}
                    >
                      {item.subtitle}
                    </Typography>

                  </Paper>
                </ButtonBase>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Modern QR Scanner Modal */}
      {openScanner && (
        <Fade in>
          <Box
            onClick={handleCloseScanner}
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.85)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              backdropFilter: "blur(10px)",
            }}
          >
            <Fade in timeout={300}>
              <Paper
                onClick={(e) => e.stopPropagation()}
                elevation={24}
                sx={{
                  p: 4,
                  borderRadius: 5,
                  maxWidth: 500,
                  width: "90%",
                  background: "#ffffff",
                }}
              >
                <QRCodeScanner
                  onScanSuccess={handleScanSuccess}
                  onClose={handleCloseScanner}
                />
              </Paper>
            </Fade>
          </Box>
        </Fade>
      )}
    </Box>
  );
}