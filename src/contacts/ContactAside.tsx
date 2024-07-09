import * as React from 'react';
import {
  TextField,
  EmailField,
  DateField,
  ReferenceManyField,
  EditButton,
  ShowButton,
  ReferenceField,
  SelectField,
  FunctionField,
  useRecordContext,
} from 'react-admin';
import { Box, Typography, Divider } from '@mui/material';
import { TagsListEdit } from './TagsListEdit';
import { AddTask } from '../tasks/AddTask';
import { isAfter } from 'date-fns';
import { List } from '@mui/material';

import { Contact, Sale } from '../types';
import { genders } from './constants';
import { Task } from '../tasks/Task';

interface ContactAsideProps {
  record: Contact;
  link?: 'edit' | 'show';
}

export const TasksIterator = ({
  showContact,
  tasks,
}: {
  showContact?: boolean;
  tasks: any;
}) => {
  // Keep only tasks that are not done or done less than 5 minutes ago
  let final = JSON.parse(tasks);
  const data = final.filter(
    (task: any) =>
      !task.deadline ||
      isAfter(new Date(task.deadline), new Date(Date.now() - 5 * 60 * 1000))
  );

  return (
    <List dense>
      {data.map((task: any) => (
        <Task task={task} showContact={showContact} key={task.id} />
      ))}
    </List>
  );
};

export const ContactAside: React.FC<ContactAsideProps> = ({
  link = 'edit',
  record,
}) => {
  // const record = useRecordContext<Contact>();
  console.log(record, 'record');
  if (!record) return null;
  return (
    <Box ml={4} width={250} minWidth={250}>
      <Box mb={2} ml="-5px">
        {link === 'edit' ? (
          <EditButton label="Edit Contact" />
        ) : (
          <ShowButton label="Show Contact" />
        )}
      </Box>
      <Typography variant="subtitle2">Personal info</Typography>
      <Divider />
      <div className="text-sm">{record.email}</div>
      {record.phone_number && (
        <Box>
          <TextField source="phone_number1" />{' '}
          <Typography variant="body2" color="textSecondary" component="span">
            Work
          </Typography>
        </Box>
      )}
      <SelectField source="gender" choices={genders} />
      <Typography variant="subtitle2" mt={2}>
        Background
      </Typography>
      <Divider />
      <Typography variant="body2" mt={2}>
        {record && record.background}
      </Typography>
      <Box mt={1} mb={3}>
        <Typography component="span" variant="body2" color="textSecondary">
          Added on
        </Typography>{' '}
        <DateField
          source="first_seen"
          options={{ year: 'numeric', month: 'long', day: 'numeric' }}
          color="textSecondary"
        />
        <br />
        <Typography component="span" variant="body2" color="textSecondary">
          Last seen on
        </Typography>{' '}
        <DateField
          source="last_seen"
          options={{ year: 'numeric', month: 'long', day: 'numeric' }}
          color="textSecondary"
        />
        <br />
        {/* <Typography component="span" variant="body2" color="textSecondary">
          Followed by
        </Typography>{' '} */}
        {/* {`${record.first_name} ${record.last_name}`} */}
      </Box>
      <Box mb={3}>
        <Typography variant="subtitle2">Tags</Typography>
        <Divider />
        <TagsListEdit />
      </Box>
      <Box>
        <Typography variant="subtitle2">Tasks</Typography>
        <Divider />
        <TasksIterator tasks={record.to_do} />
        <AddTask />
      </Box>
    </Box>
  );
};
