'use client';

import type { FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ProcessedUniProtEntry } from '@/types';

interface SequenceTableProps {
  sequences: ProcessedUniProtEntry[];
  selectedSequences: Set<string>;
  onSelectionChange: (id: string, selected: boolean) => void;
  onSelectAllChange: (selected: boolean) => void;
}

const SequenceTable: FC<SequenceTableProps> = ({
  sequences,
  selectedSequences,
  onSelectionChange,
  onSelectAllChange,
}) => {
  const allSelected = sequences.length > 0 && sequences.every((s) => selectedSequences.has(s.id));
  const someSelected = sequences.some((s) => selectedSequences.has(s.id)) && !allSelected;

  return (
    <ScrollArea className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected || someSelected}
                aria-label="Select all rows"
                onCheckedChange={(checked) => onSelectAllChange(!!checked)}
                indeterminate={someSelected}
              />
            </TableHead>
            <TableHead>Entry</TableHead>
            <TableHead>Entry Name</TableHead>
            <TableHead>Organism</TableHead>
            <TableHead>Sequence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sequences.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No sequences to display.
              </TableCell>
            </TableRow>
          ) : (
            sequences.map((seq) => (
              <TableRow
                key={seq.id}
                data-state={selectedSequences.has(seq.id) ? 'selected' : ''}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedSequences.has(seq.id)}
                    onCheckedChange={(checked) =>
                      onSelectionChange(seq.id, !!checked)
                    }
                    aria-label={`Select row ${seq.entry}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{seq.entry}</TableCell>
                <TableCell>{seq.entryName}</TableCell>
                <TableCell>{seq.organism}</TableCell>
                <TableCell className="max-w-xs truncate hover:max-w-none hover:whitespace-normal">
                  {seq.sequence}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <style jsx global>{`
        .truncate:hover {
          overflow: visible;
          text-overflow: inherit;
          white-space: normal;
          word-break: break-all;
        }
      `}</style>
    </ScrollArea>
  );
};

export default SequenceTable;
