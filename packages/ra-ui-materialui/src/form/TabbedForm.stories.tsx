import * as React from 'react';
import { ResourceContextProvider, testDataProvider } from 'ra-core';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { AdminContext } from '../AdminContext';
import { Edit } from '../detail';
import { NumberInput, TextInput } from '../input';
import { TabbedForm } from './TabbedForm';
import { Stack } from '@mui/material';

export default { title: 'ra-ui-materialui/forms/TabbedForm' };

const data = {
  id: 1,
  title: 'War and Peace',
  author: 'Leo Tolstoy',
  bio: 'Leo Tolstoy (1828-1910) was a English writer who is regarded as one of the greatest authors of all time. He received nominations for the Nobel Prize in Literature every year from 1902 to 1906 and for the Nobel Peace Prize in 1901, 1902, and 1909.',
  year: 1869,
};

const Wrapper = ({ children }) => (
  <AdminContext
    i18nProvider={{
      translate: (x, options) => options?._ ?? x,
      changeLocale: () => Promise.resolve(),
      getLocale: () => 'en',
    }}
    dataProvider={testDataProvider({
      getOne: () => Promise.resolve({ data }),
    })}
    defaultTheme="light"
  >
    <ResourceContextProvider value="books">
      <Edit id={1} sx={{ width: 600 }}>
        {children}
      </Edit>
    </ResourceContextProvider>
  </AdminContext>
);

export const Basic = () => (
  <Wrapper>
    <TabbedForm>
      <TabbedForm.Tab label="main">
        <TextInput source="title" />
        <TextInput source="author" />
        <NumberInput source="year" />
      </TabbedForm.Tab>
    </TabbedForm>
  </Wrapper>
);

export const MultipleTabs = () => (
  <Wrapper>
    <TabbedForm>
      <TabbedForm.Tab label="main">
        <TextInput source="title" />
        <TextInput source="author" />
        <NumberInput source="year" />
      </TabbedForm.Tab>
      <TabbedForm.Tab label="details">
        <TextInput multiline source="bio" />
      </TabbedForm.Tab>
    </TabbedForm>
  </Wrapper>
);

export const CustomLayout = () => (
  <Wrapper>
    <TabbedForm>
      <TabbedForm.Tab label="main">
        <TextInput source="title" />
        <Stack direction="row" gap={1} width="100%">
          <TextInput source="author" sx={{ width: '50%' }} />
          <NumberInput source="year" sx={{ width: '50%' }} />
        </Stack>
      </TabbedForm.Tab>
    </TabbedForm>
  </Wrapper>
);

export const NoToolbar = () => (
  <Wrapper>
    <TabbedForm toolbar={false}>
      <TabbedForm.Tab label="main">
        <TextInput source="title" />
        <TextInput source="author" sx={{ width: '50%' }} />
        <NumberInput source="year" sx={{ width: '50%' }} />
      </TabbedForm.Tab>
    </TabbedForm>
  </Wrapper>
);

export const Count = () => (
  <Wrapper>
    <TabbedForm>
      <TabbedForm.Tab label="main">
        <TextInput source="title" />
        <TextInput source="author" />
        <NumberInput source="year" />
      </TabbedForm.Tab>
      <TabbedForm.Tab label="comments" count={3}>
        <TextInput multiline source="bio" />
      </TabbedForm.Tab>
    </TabbedForm>
  </Wrapper>
);

export const Validate = () => (
  <Wrapper>
    <TabbedForm validate={() => ({ bio: 'incorrect details' })}>
      <TabbedForm.Tab label="main">
        <TextInput source="title" />
        <TextInput source="author" />
        <NumberInput source="year" />
      </TabbedForm.Tab>
      <TabbedForm.Tab label="details">
        <TextInput multiline source="bio" />
      </TabbedForm.Tab>
    </TabbedForm>
  </Wrapper>
);

const zodSchema = z.object({
  title: z.string().min(5),
  author: z.string().min(5),
  bio: z.string().min(5),
});

export const Resolver = () => (
  <Wrapper>
    <TabbedForm resolver={zodResolver(zodSchema)}>
      <TabbedForm.Tab label="main">
        <TextInput source="title" />
        <TextInput source="author" />
        <NumberInput source="year" />
      </TabbedForm.Tab>
      <TabbedForm.Tab label="details">
        <TextInput multiline source="bio" />
      </TabbedForm.Tab>
    </TabbedForm>
  </Wrapper>
);
