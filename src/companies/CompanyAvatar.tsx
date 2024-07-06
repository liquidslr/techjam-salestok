import * as React from 'react';
import { Avatar } from '@mui/material';
import { BASE_API } from '../utils/network';

import { Company } from '../types';

export const CompanyAvatar = (props: {
    record?: Company;
    size?: 'small' | 'large';
}) => {
    const { size = 'large', record } = props;
    if (!record) return null;
    return (
        <Avatar
            src={`${BASE_API}${record.logo}`}
            alt={record.name}
            sx={{
                bgcolor: 'aliceblue',
                '& img': { objectFit: 'contain' },
            }}
            imgProps={{ className: size }}
        />
    );
};
