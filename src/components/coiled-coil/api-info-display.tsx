'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code } from 'lucide-react';

interface ApiInfoDisplayProps {
  apiUrl: string | null;
  apiResponse: string | null;
}

const ApiInfoDisplay: FC<ApiInfoDisplayProps> = ({ apiUrl, apiResponse }) => {
  if (!apiUrl && !apiResponse) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {apiUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="mr-2 h-5 w-5 text-accent" />
              UniProt API Call
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32 w-full rounded-md border p-2">
              <pre className="text-sm whitespace-pre-wrap break-all">{apiUrl}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      {apiResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="mr-2 h-5 w-5 text-accent" />
              UniProt API Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={apiResponse}
              className="h-64 font-mono text-xs"
              placeholder="API Response will appear here..."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiInfoDisplay;
