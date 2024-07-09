import * as React from 'react';
import { Box, Paper } from '@mui/material';
import { RecordContextProvider, useListContext } from 'react-admin';
import { useQuery } from 'react-query';
import { getUrl, request } from '../utils/network';

import { CompanyCard } from './CompanyCard';
import { Company } from '../types';

const times = (nbChildren: number, fn: (key: number) => any) =>
    Array.from({ length: nbChildren }, (_, key) => fn(key));

const LoadingGridList = () => (
    <Box display="flex" flexWrap="wrap" width={1008} gap={1}>
        {times(15, key => (
            <Paper
                sx={{
                    height: 200,
                    width: 194,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'grey[200]',
                }}
                key={key}
            />
        ))}
    </Box>
);

const LoadedGridList = () => {
    const fetchCompanies = () => {
        const url = getUrl('crm/companies');
        const data = request('GET', url, null, true).then((res: any) =>
            JSON.parse(res.data)
        );
        return data;
    };

    const {
        data: data,
        isLoading: isPending,
        refetch: refetchfetchCompanies,
    } = useQuery(['companies-listing'], fetchCompanies, {
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        onError: err => console.log(err),
    });

    if (isPending) return null;

    return (
        <Box display="flex" flexWrap="wrap" width="100%" gap={1}>
            {data.map((record: Company) => (
                <RecordContextProvider key={record.id} value={record}>
                    <CompanyCard record={record} />
                </RecordContextProvider>
            ))}
        </Box>
    );
};

export const ImageList = () => {
    const { isPending } = useListContext();
    return isPending ? <LoadingGridList /> : <LoadedGridList />;
};
