import * as React from 'react';
import { useState } from 'react';
import { Paper, Typography, Box } from '@mui/material';
import ContactsIcon from '@mui/icons-material/AccountCircle';
import DealIcon from '@mui/icons-material/MonetizationOn';
import { useCreatePath, SelectField, Link } from 'react-admin';

import { sectors } from './sectors';
import { CompanyAvatar } from './CompanyAvatar';
import { Company } from '../types';

export const CompanyCard = (props: { record?: Company }) => {
    const [elevation, setElevation] = useState(1);
    const { record } = props;
    const createPath = useCreatePath();
    if (!record) return null;

    return (
        <Link
            to={createPath({
                resource: 'companies',
                id: record.id,
                type: 'show',
            })}
            underline="none"
            onMouseEnter={() => setElevation(3)}
            onMouseLeave={() => setElevation(1)}
        >
            <Paper
                sx={{
                    height: 200,
                    width: 195,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1em',
                }}
                elevation={elevation}
            >
                <Box display="flex" flexDirection="column" alignItems="center">
                    {/* <CompanyAvatar record={record} /> */}
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundImage: `url(${record.logo})`,
                        backgroundSize: 'cover',  
                        backgroundPosition: 'center', 
                    }} />

                    <Box textAlign="center" marginTop={1}>
                        <Typography variant="subtitle2">
                            {record.name}
                        </Typography>
                        <SelectField
                            color="textSecondary"
                            source="sector"
                            choices={sectors}
                        />
                    </Box>
                </Box>
                <Box display="flex" justifyContent="space-around" width="100%">
                    <Box display="flex" alignItems="center">
                        <ContactsIcon color="disabled" sx={{ mr: 1 }} />
                        <div>
                            <Typography variant="subtitle2" sx={{ mb: -1 }}>
                                {record.nb_contact}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {record.nb_contact > 1 ? 'contacts' : 'contact'}
                            </Typography>
                        </div>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DealIcon color="disabled" sx={{ mr: 1 }} />
                        <div>
                            <Typography variant="subtitle2" sx={{ mb: -1 }}>
                                {record.nb_contact}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {record.nb_contact > 1 ? 'deals' : 'deal'}
                            </Typography>
                        </div>
                    </Box>
                </Box>
            </Paper>
        </Link>
    );
};
