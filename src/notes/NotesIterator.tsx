import * as React from 'react';
import { Box } from '@mui/material';

import { Note } from './Note';
import { NewNote } from './NewNote';

export const NotesIterator = ({
  data,
  showStatus,
  reference,
}: {
  data: any;
  showStatus?: boolean;
  reference: 'contacts' | 'deals';
}) => {
  return (
    <>
      <NewNote showStatus={showStatus} reference={reference} />
      <Box mt="0.5em">
        {data.map((note: any, index: number) => (
          <Note
            note={note}
            isLast={index === data.length - 1}
            showStatus={showStatus}
            key={index}
          />
        ))}
      </Box>
    </>
  );
};
