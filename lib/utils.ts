import Airtable from 'airtable';
import Asset from '../interfaces/asset';
import { AirtableClient, AssetRecordFields, StatefulRecord, StateFields } from './airtable-client';

export function getLinkedRecordId(field?: Airtable.FieldSet[keyof Airtable.FieldSet]): string | undefined {
    if (!Array.isArray(field) || field.length === 0) {
        return;
    }
    // When a record references another record in 'changed' and 'published-has-changes' states,
    // the linked record field will have 2 IDs, but that's ok because 'getStatefulRecordById()'
    // will always return the 'changed' record in 'preview' mode and 'published-has-changes'
    // record in "non-preview" mode.
    const recordId = field[0];
    if (typeof recordId !== 'string') {
        return;
    }
    return recordId;
}

export async function getLinkedRecord<Fields extends StateFields>({
    tableName,
    field,
    airtableClient,
    preview
}: {
    tableName: string;
    field: Airtable.FieldSet[keyof Airtable.FieldSet] | undefined;
    airtableClient: AirtableClient;
    preview: boolean;
}): Promise<StatefulRecord<Fields> | undefined> {
    const recordId = getLinkedRecordId(field);
    if (!recordId) {
        return;
    }
    const record = await airtableClient.getStatefulRecordById<Fields>({
        tableId: tableName,
        recordId: recordId,
        preview: preview
    });
    if (!record) {
        return;
    }
    return record;
}

export async function getLinkedAsset(
    field: Airtable.FieldSet[keyof Airtable.FieldSet] | undefined,
    airtableClient: AirtableClient
): Promise<Asset | undefined> {
    const assetId = getLinkedRecordId(field);
    if (!assetId) {
        return;
    }
    const asset = await airtableClient.getAirtableRecordById<AssetRecordFields>({
        tableId: 'Assets',
        recordId: assetId
    });
    if (!asset) {
        return;
    }
    const attachment = asset.fields.Asset?.[0];
    if (!attachment || !attachment.url || !attachment.width || !attachment.height) {
        return;
    }
    return {
        url: attachment.url,
        width: attachment.width,
        height: attachment.height
    };
}
