/* eslint-disable import/no-anonymous-default-export */
import * as React from 'react';
import {
    BulkActionsToolbar,
    BulkDeleteButton,
    CreateButton,
    downloadCSV,
    ExportButton,
    List as RaList,
    Pagination,
    RecordContextProvider,
    SortButton,
    TopToolbar,
    useGetIdentity,
    Exporter
} from 'react-admin';
import { useNavigate } from "react-router-dom";

import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Checkbox,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import jsonExport from 'jsonexport/dist';
import {  useQuery } from 'react-query';


import { Avatar } from './Avatar';
import { ContactListFilter } from './ContactListFilter';
import { Status } from '../misc/Status';
import {  getUrl, request } from '../utils/network';
import { Contact, Company, Sale, Tag } from '../types';

const ContactListContent = () => {
    const navigate = useNavigate();
    const fetchContacts = () => {
        const url = getUrl('crm/contacts');
        const data = request('GET', url, null, true).then((res: any) => JSON.parse(res.data));
        return data;
    };
  
    const {
      data: contacts,
      isLoading: isPending,
      refetch: refetchfetchContacts,
    } = useQuery(['contacts-listing'], fetchContacts, {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      onError: (err) => console.log(err),
    });

    if (isPending) {
        return null;
    }
    const now = Date.now();

    return (
        <>
            <BulkActionsToolbar>
                <BulkDeleteButton />
            </BulkActionsToolbar>
            <List dense>
                {contacts.map((contact: Contact) => (
                    <RecordContextProvider key={contact.id} value={contact}>
                        <ListItem
                            button
                            component={Link}
                            to={`/contacts/${contact.id}/show`}
                        >
                            <ListItemIcon sx={{ minWidth: '2.5em' }}>
                                <Checkbox
                                    edge="start"
                                    // checked={selectedIds.includes(contact.id)}
                                    tabIndex={-1}
                                    disableRipple
                                    onClick={e => {
                                        // e.stopPropagation();
                                        navigate(`/contacts/${contact.id}/show`)
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemAvatar>
                                <Avatar />
                            </ListItemAvatar>
                            <ListItemText
                                primary={`${contact.first_name}`}
                                secondary={
                                    <>
                                        {contact.title} at{' '}
                                        {contact.company.name}
                                    </>
                                }
                            />
                            <ListItemSecondaryAction>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                >
                                    last activity{' '}
                                    {formatDistance(contact.last_seen, now)} ago{' '}
                                    <Status status={contact.status} />
                                </Typography>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </RecordContextProvider>
                ))}
            </List>
        </>
    );
};

const ContactListActions = () => (
    <TopToolbar>
        <SortButton fields={['last_name', 'first_name', 'last_seen']} />
        <ExportButton />
        <CreateButton
            variant="contained"
            label="New Contact"
            sx={{ marginLeft: 2 }}
        />
    </TopToolbar>
);

const exporter: Exporter<Contact> = async (records, fetchRelatedRecords) => {
    const companies = await fetchRelatedRecords<Company>(
        records,
        'company_id',
        'companies'
    );
    const sales = await fetchRelatedRecords<Sale>(records, 'sales_id', 'sales');
    const tags = await fetchRelatedRecords<Tag>(records, 'tags', 'tags');

    const contacts = records.map(contact => ({
        ...contact,
        company: companies[contact.company_id].name,
        sales: `${sales[contact.sales_id].first_name} ${
            sales[contact.sales_id].last_name
        }`,
        tags: contact.tags.map(tagId => tags[tagId].name).join(', '),
    }));
    return jsonExport(contacts, {}, (_err: any, csv: string) => {
        downloadCSV(csv, 'contacts');
    });
};

export const ContactList = () => {
    const { identity } = useGetIdentity();
    return identity ? (
        <RaList<Contact>
            actions={<ContactListActions />}
            aside={<ContactListFilter />}
            perPage={25}
            pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
            filterDefaultValues={{ sales_id: identity?.id }}
            sort={{ field: 'last_seen', order: 'DESC' }}
            exporter={exporter}
        >
            <ContactListContent />
        </RaList>
    ) : null;
};
