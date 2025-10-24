// src/components/NotificationFollowButton.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, CircularProgress } from '@mui/material';
import { BellRing, BellOff } from 'lucide-react';

export default function NotificationFollowButton({ insp_id, insp_no, user_key }) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);

    const apiHost = import.meta.env.VITE_API_HOST;

    useEffect(() => {
        const checkFollow = async () => {
            try {
                const res = await axios.get(`${apiHost}/api/follow/status`, {
                    params: { user_key, insp_id },
                });
                setIsFollowing(res.data.is_following);
            } catch (err) {
                console.error("Error checking follow status:", err);
            } finally {
                setLoading(false);
            }
        };

        checkFollow();
    }, [insp_id, user_key]);

    const toggleFollow = async () => {
        try {
            setLoading(true);
            if (isFollowing) {
                await axios.post(`${apiHost}/api/follow/unfollow`, { user_key, insp_id });
                setIsFollowing(false);
            } else {
                await axios.post(`${apiHost}/api/follow`, { user_key, insp_id, insp_no });
                setIsFollowing(true);
            }
        } catch (err) {
            console.error("Error toggling follow:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <CircularProgress size={20} />;
    }

    return (
        <Button
            color={isFollowing ? "default" : "warning"}
            variant={isFollowing ? "outlined" : "contained"}
            onClick={toggleFollow}
            startIcon={isFollowing ? <BellOff size={18} /> : <BellRing size={18} />}
            sx={{ ml: 2 }}
        >
            {isFollowing ? "เลิกติดตาม" : "ติดตาม"}
        </Button>
    );
}
