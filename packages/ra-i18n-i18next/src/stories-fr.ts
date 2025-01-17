import raMessages from 'ra-language-English';
import { TranslationMessages } from 'ra-core';

export default {
    ...raMessages,
    resources: {
        posts: {
            name_one: 'Article',
            name_other: 'Articles',
            fields: {
                id: 'Id',
                title: 'Titre',
            },
        },
        comments: {
            name_one: 'Commentaire',
            name_other: 'Commentaires',
            fields: {
                id: 'Id',
                body: 'Message',
            },
        },
    },
} as TranslationMessages;
