// src/booking/components/QRCodeDisplay.tsx
import React, { useEffect, useState } from 'react';
import type { BoxProps } from '@mui/material';
import { Box } from '@mui/material';
import QRCode from 'qrcode';

interface Props extends BoxProps {
    value?: string; // data to encode (if not provided, random)
    size?: number;
}

export const QRCodeDisplay: React.FC<Props> = ({ value, size = 200, ...boxProps }) => {
    const [dataUrl, setDataUrl] = useState<string | null>(null);

    useEffect(() => {
        const v = value ?? `vinabooking:${Math.random().toString(36).slice(2)}:${Date.now()}`;
        let mounted = true;
        QRCode.toDataURL(v, { width: size })
            .then((url) => {
                if (mounted) setDataUrl(url);
            })
            .catch((err) => {
                console.error('QR gen error', err);
                if (mounted) setDataUrl(null);
            });
        return () => {
            mounted = false;
        };
    }, [value, size]);

    return (
        <Box {...boxProps} display="flex" justifyContent="center" alignItems="center">
            {dataUrl ? (
                <img src={dataUrl} alt="qr-code" width={size} height={size} />
            ) : (
                <div>Generating QR...</div>
            )}
        </Box>
    );
};
