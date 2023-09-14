/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DefaultAutocompleteClient } from '../autocomplete-client/autocomplete'
import * as autocompleteClient from '../autocomplete-client/autocomplete'

import { AutocompleteQuery } from '../views/autocomplete-display'
import { AutocompleteItem } from '@aws/mynah-ui'

export const getAutocompleteSuggestions = async (
    client: DefaultAutocompleteClient,
    query: AutocompleteQuery
): Promise<AutocompleteItem[]> => {
    if (query.input === '' && query.queryContext === undefined) {
        return []
    }
    const request: autocompleteClient.AutocompleteRequest = {
        input: query.input.length > 0 ? query.input.trim().substring(0, 1000) : undefined,
        context: {
            matchPolicy: {
                should: Array.from(query.queryContext.should),
                must: Array.from(query.queryContext.must),
                mustNot: Array.from(query.queryContext.mustNot),
            },
        },
    }

    try {
        const output = await client.autocomplete(request)
        return output.suggestions?.map(suggestion => ({
            ...suggestion,
        })) as AutocompleteItem[]
    } catch (err: any) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        throw new Error('Autocomplete request failed: ' + err)
    }
}
