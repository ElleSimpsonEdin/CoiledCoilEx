
'use client';

import { useState, type FC } from 'react';
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
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';
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
  const [expandedSequences, setExpandedSequences] = useState<Set<string>>(new Set());

  const allSelected = sequences.length > 0 && sequences.every((s) => selectedSequences.has(s.id));
  const someSelected = sequences.some((s) => selectedSequences.has(s.id)) && !allSelected;

  const handleToggleExpand = (id: string) => {
    setExpandedSequences((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Heuristic to determine if a sequence is "long" enough to warrant an expand button
  const isSequenceLong = (sequence: string) => sequence.length > 50;


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
            <TableHead className="w-[15%]">Entry</TableHead>
            <TableHead className="w-[25%]">Entry Name</TableHead>
            <TableHead className="w-[20%]">Organism</TableHead>
            <TableHead className="w-[40%]">Sequence</TableHead>
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
                <TableCell className="max-w-xs align-top"> {/* Ensure alignment for multi-line content */}
                  <div className="flex items-start justify-between">
                    <span
                      className={
                        expandedSequences.has(seq.id)
                          ? "whitespace-normal break-all" // Expanded state
                          : "truncate block" // Collapsed state, `block` helps truncate with flex
                      }
                    >
                      {seq.sequence}
                    </span>
                    {isSequenceLong(seq.sequence) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-2 shrink-0 p-0 flex-none" // flex-none to prevent shrinking
                        onClick={() => handleToggleExpand(seq.id)}
                        aria-label={expandedSequences.has(seq.id) ? 'Collapse sequence' : 'Expand sequence'}
                        title={expandedSequences.has(seq.id) ? 'Collapse sequence' : 'Expand sequence'}
                      >
                        <ChevronsUpDown className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default SequenceTable;
