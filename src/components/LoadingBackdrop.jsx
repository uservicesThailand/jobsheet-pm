import { useEffect, useState } from "react";
import { Backdrop, Box, Typography } from "@mui/material";
import { Settings } from "lucide-react";
import { keyframes } from "@emotion/react";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

export default function LoadingMechanic({ open = false, message = "กำลังโหลดข้อมูล" }) {
    const [dots, setDots] = useState("");

    useEffect(() => {
        if (!open) {
            setDots("");
            return;
        }

        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 400);

        return () => clearInterval(interval);
    }, [open]);

    return (
        <Backdrop
            open={open}
            sx={{
                zIndex: 1300,
                backgroundColor: "rgba(0, 0, 0, 0.75)",
            }}
        >
            <Box
                sx={{
                    background: "linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)",
                    px: { xs: 3, sm: 4 },
                    py: { xs: 2.5, sm: 3 },
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 152, 0, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: 2.5,
                    animation: `${pulse} 2s ease-in-out infinite`,
                    border: "1px solid rgba(255, 152, 0, 0.3)",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        animation: `${spin} 1.5s linear infinite`,
                    }}
                >
                    <Settings size={28} color="#1e1e3bff" strokeWidth={2.5} />
                </Box>

                <Box>
                    <Typography
                        sx={{
                            fontSize: { xs: "0.95rem", sm: "1.05rem" },
                            fontWeight: 600,
                            color: "#002b64ff",
                            letterSpacing: "0.02em",
                            minWidth: "120px",
                        }}
                    >
                        {message}
                        <Box
                            component="span"
                            sx={{
                                display: "inline-block",
                                width: "24px",
                                textAlign: "left",
                                color: "#ff9800",
                            }}
                        >
                            {dots}
                        </Box>
                    </Typography>
                </Box>
            </Box>
        </Backdrop>
    );
}