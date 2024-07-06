import * as React from 'react';
import { Card, Box, Button } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import {
  useGetList,
  Link,
  useGetIdentity,
  useList,
  ListContextProvider,
  ResourceContextProvider,
} from 'react-admin';
import { isAfter } from 'date-fns';
import { List } from '@mui/material';
import { useQuery } from 'react-query';
import { getUrl, request } from '../utils/network';
import { Contact } from '../types';
import { Task } from '../tasks/Task';

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

export const TasksList = () => {
  const { identity } = useGetIdentity();

  const fetchTasks = () => {
    const url = getUrl(`crm/tasks/`);
    const data = request('GET', url, null, true).then((res: any) =>
      JSON.parse(res.data)
    );
    return data;
  };

  const {
    data: tasksdata,
    isLoading: tasksdataLoading,
    refetch: refetchTasks,
  } = useQuery(['tasks-detaisl'], fetchTasks, {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    onError: (err) => console.log(err),
  });

  // get all the contacts for this sales
  const { data: contacts, isPending: contactsLoading } = useGetList<Contact>(
    'contacts',
    {
      pagination: { page: 1, perPage: 500 },
      filter: { sales_id: identity?.id },
    },
    { enabled: !!identity }
  );

  // get the first 100 upcoming tasks for these contacts
  const { data: tasks, isPending: tasksLoading } = useGetList(
    'tasks',
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: 'due_date', order: 'ASC' },
      filter: {
        done_date: undefined,
        contact_id: contacts?.map((contact) => contact.id),
      },
    },
    { enabled: !!contacts }
  );
  console.log(tasksdata, 'tasksss');
  const isPending = tasksLoading || contactsLoading;

  // limit to 10 tasks and provide the list context
  const listContext = useList({
    data: tasks,
    isPending,
    resource: 'tasks',
    perPage: 10,
  });
  return (
    <>
      <Box display="flex" alignItems="center" marginBottom="1em">
        <Box ml={2} mr={2} display="flex">
          <AssignmentTurnedInIcon color="disabled" fontSize="large" />
        </Box>
        <Link
          underline="none"
          variant="h5"
          color="textSecondary"
          to="/contacts"
        >
          Upcoming tasks
        </Link>
      </Box>
      <Card sx={{ px: 2, mb: '2em' }}>
        {!tasksdataLoading && <TasksIterator tasks={tasksdata} showContact />}

        {!isPending && (
          <Button
            onClick={() => listContext.setPerPage(listContext.perPage + 10)}
            fullWidth
          >
            Load more
          </Button>
        )}
      </Card>
    </>
  );
};
