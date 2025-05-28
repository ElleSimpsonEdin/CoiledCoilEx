import { z } from 'zod';

export interface UniProtAPIResponse {
  results: RawUniProtEntry[];
}

export interface RawUniProtEntry {
  primaryAccession: string;
  proteinDescription?: {
    recommendedName?: {
      fullName?: {
        value: string;
      };
    };
    submissionNames?: {
      fullName?: {
        value: string;
      };
    }[];
  };
  organism?: {
    scientificName: string;
    taxonId: number;
  };
  sequence?: {
    value: string;
    length: number;
    molWeight: number;
    crc64: string;
  };
}

export interface ProcessedUniProtEntry {
  id: string; // Using primaryAccession as id
  entry: string;
  entryName: string;
  organism: string;
  sequence: string;
}

export const sequenceFormSchema = z.object({
  organism: z.string().min(1, { message: 'Organism is required.' }),
  count: z.coerce
    .number()
    .int()
    .min(1, { message: 'Count must be at least 1.' })
    .max(100, { message: 'Count cannot exceed 100.' }),
});

export type SequenceFormValues = z.infer<typeof sequenceFormSchema>;
