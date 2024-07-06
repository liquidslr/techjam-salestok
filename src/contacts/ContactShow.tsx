import * as React from 'react';
import {
    ShowBase,
    ReferenceField,
    ReferenceManyField,
} from 'react-admin';
import { useParams, Link } from 'react-router-dom';
import { Box, Card, CardContent, Typography } from '@mui/material';
import {  useQuery } from 'react-query';

import { Avatar } from './Avatar';
import { ContactAside } from './ContactAside';
import { LogoField } from '../companies/LogoField';
import { NotesIterator } from '../notes';
import {  getUrl, request } from '../utils/network';
import { Contact } from '../types';

export const ContactShow = () => (
    <ShowBase>
        <ContactShowContent />
    </ShowBase>
);

const ContactShowContent = () => {
    // const { record, isPending } = useShowContext<Contact>();
    const { id } = useParams();

    const fetchContactDetail = () => {
        const url = getUrl(`crm/contacts/${id}`);
        const data = request('GET', url, null, true).then((res: any) => JSON.parse(res.data));
        return data;
    };
  
    const {
      data: record,
      isLoading: isPending,
      refetch: refetchContactDetail,
    } = useQuery(['contact-details'], fetchContactDetail, {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      onError: (err) => console.log(err),
    });

    if (isPending) {
        return null;
    }
    if (isPending || !record) return null;
    return (
        <Box mt={2} display="flex">
            <Box flex="1">
                <Card>
                    <CardContent>
                        <Box display="flex">
                            <Avatar />
                            <Box ml={2} flex="1">
                                <Typography variant="h5">
                                    {record.first_name} 
                                </Typography>
                                <Typography variant="body2" component="div">
                                    {record.title} at{' '} 
                                    <Link to={`/companies/${record.company.id}/show`}>
                                    {record.company.name}
                                    </Link>
                                </Typography>
                            </Box>
                            <Box>
                                <ReferenceField
                                    source="company_id"
                                    reference="companies"
                                    link="show"
                                >
                                    <LogoField />
                                </ReferenceField>
                            </Box>
                        </Box>
                        <ReferenceManyField
                            target="contact_id"
                            reference="contactNotes"
                            sort={{ field: 'date', order: 'DESC' }}
                        >
                            <NotesIterator showStatus reference="contacts" />
                        </ReferenceManyField>
                    </CardContent>
                </Card>
            </Box>
            <ContactAside record={record} />
        </Box>
    );
};
