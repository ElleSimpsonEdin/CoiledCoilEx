
'use server';

import type { UniProtAPIResponse, RawUniProtEntry } from '@/types';

interface FetchResult {
  apiUrl: string;
  data?: RawUniProtEntry[];
  error?: string;
}

export async function fetchUniProtSequences(
  organism: string,
  limit: number
): Promise<FetchResult> {
  const baseUrl = 'https://rest.uniprot.org/uniprotkb/search';
  
  let organismQueryPart: string;
  if (/^\d+$/.test(organism)) {
    organismQueryPart = `organism_id:${organism}`;
  } else {
    organismQueryPart = `organism_name:"${decodeURIComponent(encodeURIComponent(organism))}"`;
  }
  
  const query = `${organismQueryPart} AND reviewed:true AND ft_coiled:*`;
  // Added 'ft_coiled' to fields to get feature information
  const fields = 'accession,protein_name,organism_name,sequence,ft_coiled'; 
  const apiUrl = `${baseUrl}?query=${encodeURIComponent(query)}&fields=${fields}&format=json&size=${limit}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`UniProt API error: ${response.status} ${errorText}`);
      return {
        apiUrl,
        error: `Failed to fetch data from UniProt: ${response.status} ${errorText.substring(0,100)}${errorText.length > 100 ? '...' : '' }`,
      };
    }

    const data: UniProtAPIResponse = await response.json();
    return { apiUrl, data: data.results };
  } catch (error) {
    console.error('Error fetching UniProt sequences:', error);
    if (error instanceof Error) {
      return { apiUrl, error: `An error occurred: ${error.message}` };
    }
    return { apiUrl, error: 'An unknown error occurred while fetching data.' };
  }
}
