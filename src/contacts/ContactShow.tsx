import * as React from 'react';
import { ShowBase, ReferenceField, ReferenceManyField } from 'react-admin';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Box, Card, CardContent, Typography } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

import Modal from '@mui/material/Modal';
import { format } from 'date-fns';

import Call from './Call';
import { Avatar } from './Avatar';
import { ContactAside } from './ContactAside';
import { LogoField } from '../companies/LogoField';
import { NotesIterator } from '../notes';
import { getUrl, request } from '../utils/network';
import { Contact } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const style = {};

export const ContactShow = () => (
  <ShowBase>
    <ContactShowContent />
  </ShowBase>
);

const ContactShowContent = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const deal_id = searchParams.get('deal');
  const [recordingData, setRecordingData] = React.useState<any>('');
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(0);

  const handleOpen = (data: any) => {
    setOpen(true);
    setRecordingData(data);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const fetchContactDetail = () => {
    const url = getUrl(`crm/contacts/${id}`);
    const data = request('GET', url, null, true).then((res: any) =>
      JSON.parse(res.data)
    );
    return data;
  };

  const {
    data: record,
    isLoading: isLoading,
    refetch: refetchCallRecords,
  } = useQuery(['contact-details'], fetchContactDetail, {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    onError: (err) => console.log(err),
  });

  const fetchCallRecordings = () => {
    const url = getUrl(`call/call_records/${id}/?deal_id=${deal_id}`);
    const data = request('GET', url, null, true).then((res: any) =>
      JSON.parse(res.data)
    );
    return data;
  };

  const {
    data: recordings,
    isLoading: isPending,
    refetch: refetchCallRecordings,
  } = useQuery(['call-records-details'], fetchCallRecordings, {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    onError: (err) => console.log(err),
  });

  const loadSummary = (id: number) => {
    const url = getUrl(`call/summarize/${id}/`);
    return request('GET', url, null, true);
  };

  const { mutate: reloadData, isLoading: realoadLoading } = useMutation(
    loadSummary,
    {
      onSuccess: () => {
        refetchCallRecordings();
      },
      onError: (err) => {
        console.log(err, 'error');
      },
    }
  );

  const toTitleCase = (str: string) => {
    return str.replace(
      /\w\S*/g,
      (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  };

  console.log(record, 'record');

  if (isPending || !record) return null;
  return (
    <Box mt={2} display="flex">
      <Box flex="1">
        <Card>
          <CardContent>
            <Box display="flex">
              <Avatar />
              <Box ml={2} flex="1">
                <Typography variant="h5">{record.first_name}</Typography>
                <Typography variant="body2" component="div">
                  {record.title} at{' '}
                  {record.company && (
                    <Link to={`/companies/${record.company.id}/show`}>
                      {record.company.name}
                    </Link>
                  )}
                </Typography>
              </Box>
              <Box>
                <div className="flex flex-col">
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundImage: `url(http://localhost:8000${record.company?.logo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="text-xs">{record.company?.name}</div>
                </div>
              </Box>
            </Box>
            <div className="mt-10">
              <Call />
            </div>
            {record.notes && (
              <NotesIterator
                data={record.notes}
                showStatus
                reference="contacts"
              />
            )}
            {recordings.data?.length > 0 ? (
              <div>
                <div className="font-semibold">Previous Conversations</div>
                <div>
                  {!isPending &&
                    recordings.data?.map((recording: any, idx: number) => (
                      <div
                        onClick={() => handleOpen(recording)}
                        className="cursor-pointer"
                      >
                        {idx + 1}.
                        <span className="hover:underline">
                          Call @ {format(recording.created_at, 'PP hh:mm a')}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <div
                style={{
                  position: 'absolute' as 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 1000,
                  height: 700,
                  border: '2px solid #000',
                  padding: 4,
                  backgroundColor: 'white',
                  overflowY: 'scroll',
                }}
              >
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <div className="flex flex-row justify-between w-full items-center">
                    <Tabs
                      value={value}
                      onChange={handleChange}
                      aria-label="basic tabs example"
                    >
                      <Tab label="Call Summary" {...a11yProps(0)} />
                      <Tab label="Call Transcript" {...a11yProps(0)} />
                      <Tab label="To Do" {...a11yProps(1)} />
                    </Tabs>
                    <div
                      className="px-6 hover:cursor-pointer"
                      onClick={() => reloadData(recordingData.id)}
                    >
                      {realoadLoading ? 'Loading' : 'Reload'}
                    </div>
                  </div>
                </Box>
                <CustomTabPanel value={value} index={0}>
                  <div className="py-6 px-4">
                    {recordingData.call_summary?.text}
                  </div>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                  <div className="py-6 px-4">
                    {recordingData &&
                      JSON.parse(recordingData?.transcript).map(
                        (message: any, index: number) => (
                          <div key={index} className="message">
                            {Object.keys(message).map((key) => (
                              <div key={key} className="flex gap-2">
                                <div className="font-semibold">
                                  {toTitleCase(key)}:
                                </div>
                                <div> {message[key]}</div>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                  </div>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                  <div className="py-6 px-4">
                    {recordingData.call_summary?.to_do.length > 0
                      ? JSON.parse(recordingData.call_summary?.to_do).map(
                          (task: any, index: any) => (
                            <div
                              key={index}
                              className="task-item border p-2 m-2"
                            >
                              <div>
                                <strong>Task:</strong> {task.task}
                              </div>
                              <div>
                                <strong>Deadline:</strong>{' '}
                                {task.deadline
                                  ? format(task.deadline, 'PP')
                                  : 'No deadline'}
                              </div>
                            </div>
                          )
                        )
                      : null}
                  </div>
                </CustomTabPanel>
              </div>
            </Modal>
          </CardContent>
        </Card>
      </Box>
      <ContactAside record={recordings} />
    </Box>
  );
};
