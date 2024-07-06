import * as React from 'react';
import {
    ReferenceArrayField,
    SingleFieldList,
    ChipField,
    useRecordContext,
} from 'react-admin';
import { Contact } from 'types';

const ColoredChipField = (props: any) => {
    const record = useRecordContext();
    if (!record) return null;
    return (
        <ChipField
            record={record}
            {...props}
            style={{ backgroundColor: record.color, border: 0 }}
            component="span"
        />
    );
};

export const TagsList = (tags: any) => {
    return (
        <ReferenceArrayField
            sx={{ display: 'inline-block' }}
            resource="contacts"
            source={tags}
            reference="tags"
        >
            <SingleFieldList linkType={false}>
                <ColoredChipField source={"tag.name"} variant="outlined" size="small" />
            </SingleFieldList>
        </ReferenceArrayField>
    )
};
