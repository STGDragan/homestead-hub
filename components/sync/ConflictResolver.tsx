
import React from 'react';
import { ConflictLog } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowRight, Check } from 'lucide-react';

interface ConflictResolverProps {
  conflict: ConflictLog;
  onResolve: (id: string, resolution: 'local_wins' | 'remote_wins') => void;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({ conflict, onResolve }) => {
  // Simple diff preview (just showing raw JSON values for MVP)
  const renderDiff = (obj: any) => (
      <pre className="text-[10px] bg-earth-100 dark:bg-black/30 p-2 rounded overflow-x-auto">
          {JSON.stringify(obj, null, 2)}
      </pre>
  );

  return (
    <Card className="border-l-4 border-l-red-500">
        <div className="mb-4">
            <h3 className="font-bold text-earth-900 dark:text-earth-100">Conflict Detected: {conflict.storeName}</h3>
            <p className="text-xs text-earth-500">Record ID: {conflict.recordId}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-leaf-700">Your Version</span>
                    <span className="text-xs text-earth-400">{new Date(conflict.localVersion.updatedAt).toLocaleTimeString()}</span>
                </div>
                {renderDiff(conflict.localVersion)}
                <Button size="sm" onClick={() => onResolve(conflict.id, 'local_wins')} className="w-full">
                    Keep Mine
                </Button>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-blue-700">Server Version</span>
                    <span className="text-xs text-earth-400">{new Date(conflict.remoteVersion.updatedAt).toLocaleTimeString()}</span>
                </div>
                {renderDiff(conflict.remoteVersion)}
                <Button size="sm" variant="secondary" onClick={() => onResolve(conflict.id, 'remote_wins')} className="w-full">
                    Accept Server
                </Button>
            </div>
        </div>
    </Card>
  );
};
