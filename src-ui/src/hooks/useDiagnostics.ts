import { useState, useEffect } from 'react';

export interface DiagnosticEvent {
  id: number;
  time: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export function useDiagnostics() {
  const [events, setEvents] = useState<DiagnosticEvent[]>([]);

  // Mocking diagnostic events since phase 1.3 didn't explicitly implement a log API
  useEffect(() => {
    setEvents([
      { id: 1, time: new Date(), level: 'info', message: 'Character Studio initialized' },
      { id: 2, time: new Date(Date.now() - 10000), level: 'info', message: 'Model Scanner found 3 models' },
      { id: 3, time: new Date(Date.now() - 20000), level: 'warning', message: 'High memory usage detected during last generation' },
    ]);
  }, []);

  const exportDiagnostics = (format: 'json' | 'csv') => {
    let dataStr = '';
    let mime = '';
    let filename = '';

    if (format === 'json') {
      dataStr = JSON.stringify(events, null, 2);
      mime = 'application/json';
      filename = 'diagnostics.json';
    } else {
      const header = 'id,time,level,message\n';
      const rows = events.map(e => `${e.id},${e.time.toISOString()},${e.level},"${e.message}"`).join('\n');
      dataStr = header + rows;
      mime = 'text/csv';
      filename = 'diagnostics.csv';
    }

    const blob = new Blob([dataStr], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { events, exportDiagnostics };
}
