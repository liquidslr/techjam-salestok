import * as React from 'react';
import { ShowBase, useRedirect } from 'react-admin';
import { Box, Dialog, DialogContent, Typography, Divider } from '@mui/material';
import { format } from 'date-fns';
import { useQuery } from 'react-query';
import { useParams, Link } from 'react-router-dom';

import { NotesIterator } from '../notes';
import { ContactList } from './ContactList';
import { stageNames } from './stages';
import { getUrl, request } from '../utils/network';

export const DealShow = ({ open, id }: { open: boolean; id?: string }) => {
  const redirect = useRedirect();
  const handleClose = () => {
    redirect('list', 'deals');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      sx={{
        '.MuiDialog-paper': {
          position: 'absolute',
          top: 50,
        },
      }}
    >
      <DialogContent>
        {!!id ? (
          <ShowBase id={id}>
            <DealShowContent id={id} />
          </ShowBase>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

const DealShowContent = ({ id }: { id: string }) => {
  const fetchDeals = () => {
    const url = getUrl(`crm/deals/${id}`);
    const data = request('GET', url, null, true).then((res: any) =>
      JSON.parse(res.data)
    );
    return data;
  };

  const {
    data: record,
    isLoading: isPending,
    refetch: refetchDeals,
  } = useQuery(['deal-details'], fetchDeals, {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    onError: (err) => console.log(err),
  });

  if (!record) return null;
  return (
    <div>
      <Box display="flex">
        <Box
          width={100}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <div>
            <div
              className="margin-auto text-center"
              style={{
                width: '50px',
                height: '50px',
                backgroundImage: `url(http://localhost:8000${record.company.logo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            ></div>
            <div className="text-center my-2">{record.company.name}</div>
          </div>
        </Box>
        <Box ml={2} flex="1">
          <Typography variant="h5">{record.name}</Typography>

          <Box display="flex" mt={2}>
            <Box display="flex" mr={5} flexDirection="column">
              <Typography color="textSecondary" variant="body2">
                Start
              </Typography>
              <Typography variant="subtitle1">
                {format(record.start_at, 'PP')}
              </Typography>
            </Box>

            <Box display="flex" mr={5} flexDirection="column">
              <Typography color="textSecondary" variant="body2">
                Budget
              </Typography>
              <Typography variant="subtitle1">${record.amount}K</Typography>
            </Box>

            <Box display="flex" mr={5} flexDirection="column">
              <Typography color="textSecondary" variant="body2">
                Category
              </Typography>
              <Typography variant="subtitle1">{record.type}</Typography>
            </Box>

            <Box display="flex" mr={5} flexDirection="column">
              <Typography color="textSecondary" variant="body2">
                Stage
              </Typography>
              <Typography variant="subtitle1">
                {/* @ts-ignore */}
                {stageNames[record.stage]}
              </Typography>
            </Box>
          </Box>

          <Box mt={2} mb={2}>
            <Box display="flex" mr={5} flexDirection="column" minHeight={48}>
              <Typography color="textSecondary" variant="body2">
                Contacts
              </Typography>
              {record.contacts.map((contact: any) => (
                <Link to={`/contacts/${contact.id}/show?deal=${record.id}`}>
                  <span className="text-blue-600"> {contact.first_name} </span>
                </Link>
              ))}
            </Box>
          </Box>

          <Box mt={2} mb={2} style={{ whiteSpace: 'pre-line' }}>
            <Typography color="textSecondary" variant="body2">
              Description
            </Typography>
            <Typography>{record.description}</Typography>
          </Box>

          <Divider />

          <Box mt={2}>
            {/* <ReferenceManyField
                            target="deal_id"
                            reference="dealNotes"
                            sort={{ field: 'date', order: 'DESC' }}
                        > */}
            {/* <NotesIterator reference="deals" /> */}
            {/* </ReferenceManyField> */}
          </Box>
        </Box>
      </Box>
    </div>
  );
};
