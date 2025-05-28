
'use client';

import { useState, type FC } from 'react';
import { fetchUniProtSequences } from './actions';
import SequenceForm from '@/components/coiled-coil/sequence-form';
import SequenceTable from '@/components/coiled-coil/sequence-table';
import ApiInfoDisplay from '@/components/coiled-coil/api-info-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, ListChecks, Info } from 'lucide-react';
import type { ProcessedUniProtEntry, RawUniProtEntry, SequenceFormValues, UniProtFeature } from '@/types';
import { useToast } from "@/hooks/use-toast";

const processUniProtData = (rawData: RawUniProtEntry[]): ProcessedUniProtEntry[] => {
  return rawData.map((entry) => {
    let coiledCoilSequence = 'N/A - Coiled coil data unavailable';
    const fullSequence = entry.sequence?.value;

    if (fullSequence && entry.features && entry.features.length > 0) {
      const coiledCoilFeature = entry.features.find(
        (feature: UniProtFeature) => feature.type === 'Coiled coil'
      );

      if (coiledCoilFeature && coiledCoilFeature.location?.start?.value && coiledCoilFeature.location?.end?.value) {
        const start = coiledCoilFeature.location.start.value;
        const end = coiledCoilFeature.location.end.value;
        // UniProt sequences are 1-indexed, substring is 0-indexed and end is exclusive
        coiledCoilSequence = fullSequence.substring(start - 1, end);
      } else if (coiledCoilFeature) {
        coiledCoilSequence = 'N/A - Coiled coil location invalid';
      }
    } else if (!fullSequence) {
        coiledCoilSequence = 'N/A - Full sequence unavailable';
    }


    return {
      id: entry.primaryAccession,
      entry: entry.primaryAccession,
      entryName:
        entry.proteinDescription?.recommendedName?.fullName?.value ||
        entry.proteinDescription?.submissionNames?.[0]?.fullName?.value ||
        'N/A',
      organism: entry.organism?.scientificName || 'N/A',
      sequence: coiledCoilSequence,
    };
  });
};

const HomePage: FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sequences, setSequences] = useState<ProcessedUniProtEntry[]>([]);
  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [selectedSequences, setSelectedSequences] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleFormSubmit = async (values: SequenceFormValues) => {
    setIsLoading(true);
    setError(null);
    setSequences([]);
    setApiUrl(null);
    setApiResponse(null);
    setSelectedSequences(new Set());

    const result = await fetchUniProtSequences(values.organism, values.count);

    setApiUrl(result.apiUrl);

    if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else if (result.data) {
      setApiResponse(JSON.stringify(result.data, null, 2));
      const processedData = processUniProtData(result.data);
      setSequences(processedData);
      if (processedData.length === 0) {
        toast({
          title: "No Results",
          description: "No sequences found for the given criteria.",
        });
      } else {
         toast({
          title: "Success",
          description: `Fetched ${processedData.length} sequences.`,
        });
      }
    }
    setIsLoading(false);
  };

  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedSequences((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAllChange = (selected: boolean) => {
    if (selected) {
      setSelectedSequences(new Set(sequences.map(s => s.id)));
    } else {
      setSelectedSequences(new Set());
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-primary">Coiled Coil Explorer</h1>
        <p className="text-muted-foreground mt-2">
          Fetch and explore coiled-coil protein sequences from UniProt.
        </p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5 text-accent" />
            Sequence Retrieval Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SequenceForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(apiUrl || apiResponse) && (
         <ApiInfoDisplay apiUrl={apiUrl} apiResponse={apiResponse} />
      )}
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center space-y-2 p-8 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p>Fetching sequences...</p>
        </div>
      )}

      {!isLoading && sequences.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
             <ListChecks className="mr-2 h-5 w-5 text-accent" />
              Retrieved Sequences
            </CardTitle>
             <p className="text-sm text-muted-foreground">
              Selected {selectedSequences.size} of {sequences.length} sequences.
            </p>
          </CardHeader>
          <CardContent>
            <SequenceTable
              sequences={sequences}
              selectedSequences={selectedSequences}
              onSelectionChange={handleSelectionChange}
              onSelectAllChange={handleSelectAllChange}
            />
          </CardContent>
        </Card>
      )}
      
      {!isLoading && !error && sequences.length === 0 && apiUrl && ( // Show if API call made but no results
         <Card className="shadow-md">
           <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No sequences found for the specified criteria, or no coiled coil regions in found sequences.</p>
           </CardContent>
         </Card>
      )}

    </div>
  );
};

export default HomePage;
