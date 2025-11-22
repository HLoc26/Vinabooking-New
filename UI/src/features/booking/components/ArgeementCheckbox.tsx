import React, { useState } from 'react';
import { Box, FormControlLabel, Checkbox, Typography } from '@mui/material';

interface Props {
    onAgreeChange?: (checked: boolean) => void;
}

export const AgreementCheckbox: React.FC<Props> = ({ onAgreeChange }) => {
    const [checked, setChecked] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = event.target.checked;
        setChecked(newVal);
        onAgreeChange?.(newVal);
    };

    return (
        <Box>
            <FormControlLabel
                control={<Checkbox checked={checked} onChange={handleChange} />}
                label={
                    <Typography variant="body2">
                        I confirm that all the information provided to Vinabooking is accurate and
                        true to my current status.
                    </Typography>
                }
            />
        </Box>
    );
};
