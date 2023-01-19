import { defineStackbitConfig, getLocalizedFieldForLocale, DocumentValueField, SiteMapEntry } from '@stackbit/types';
import { AirtableContentSource } from './airtable-content-source/airtable-content-source';

export default defineStackbitConfig({
    stackbitVersion: '0.6.0',
    ssgName: 'nextjs',
    nodeVersion: '16',

    contentSources: [
        new AirtableContentSource({
            baseId: process.env.AIRTABLE_BASE_ID!,
            personalAccessToken: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN!
        })
    ],

    // Extend and override models for project specific requirements.
    modelExtensions: [
        // Change the Posts model to page to enable page creation feature.
        // Override Airtable's plural table names with singular name.
        {
            type: 'page',
            name: 'Posts',
            label: 'Post'
        },
        {
            name: 'Authors',
            label: 'Author'
        }
    ],

    // Generate a sitemap to enable quick page navigation in Stackbit.
    siteMap: ({ documents, models }) => {
        const postsTableId = models.find((model) => model.label === 'Posts')?.name;
        return [
            // The homepage is not represented by any record, define a static SiteMapEntry
            {
                urlPath: '/',
                stableId: 'home',
                label: 'Home',
                isHomePage: true
            },
            // For every 'Posts' record from Airtable, generate a SiteMapEntry
            ...documents
                .filter((document) => {
                    return document.modelName === postsTableId;
                })
                .map((document): SiteMapEntry | null => {
                    const slug = document.fields.Slug as DocumentValueField;
                    const localizedSlug = getLocalizedFieldForLocale(slug);
                    if (!localizedSlug) {
                        return null;
                    }
                    const title = document.fields.Title as DocumentValueField;
                    const localizedTitle = getLocalizedFieldForLocale(title);
                    return {
                        stableId: document.id,
                        label: localizedTitle ? localizedTitle.value : localizedSlug.value,
                        urlPath: `/posts/${localizedSlug.value}`,
                        document: {
                            srcType: document.srcType,
                            srcProjectId: document.srcProjectId,
                            modelName: document.modelName,
                            id: document.id
                        }
                    };
                })
                .filter((document): document is SiteMapEntry => !!document)
        ];
    }
});
