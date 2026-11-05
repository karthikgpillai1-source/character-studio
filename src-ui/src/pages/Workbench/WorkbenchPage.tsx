import React, { useRef, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useWorkbench } from '../../hooks/useWorkbench';
import { Server, PlaySquare, List, Network, FileTerminal } from 'lucide-react';
import styles from './WorkbenchPage.module.css';

export const WorkbenchPage: React.FC<{ activePage?: string, onNavigate?: (page: string) => void }> = () => {
  const { 
    engineStatus, tokenStream, logs, startupDiag, 
    setTokenStream, setLogs, rawRequest, rawResponses,
    foundModels, selectedModel, setSelectedModel
  } = useWorkbench();
  
  const streamRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    streamRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    logRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [tokenStream, logs, rawResponses]);

  const [prompt, setPrompt] = useState('Hello');

  const handleLoadModel = async () => {
    if (!selectedModel) return;
    try {
      setLogs([]);
      await invoke('load_model', { path: selectedModel, mode: 'CPU' });
    } catch (e) {
      alert('Failed to load model: ' + e);
    }
  };

  const handleTestGeneration = async () => {
    try {
      setTokenStream([]);
      await invoke('generate_text', { 
        request: {
          prompt: prompt,
          conversation_id: null,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9,
          top_k: 40,
          repeat_penalty: 1.1,
          stop_sequences: ["<|im_end|>"]
        }
      });
    } catch (e) {
      alert('Failed to start generation: ' + e);
    }
  };

  const handleKill = async () => {
    try {
      await invoke('unload_model');
    } catch(e) {
      alert('Failed to kill: ' + e);
    }
  };

  const [isRawRequestExpanded, setIsRawRequestExpanded] = useState(false);

  if (!engineStatus) return <div className={styles.loading}>Initializing Diagnostic Workstation...</div>;

  const hasModels = foundModels.length > 0;

  return (
    <div className={styles.workbenchGrid}>
      
      {/* Left Column - Diagnostics & Request */}
      <div className={styles.columnLeft}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}><Server size={14}/> Runtime Summary</div>
          </div>
          <div className={styles.panelContent}>
            <div className={styles.kvList}>
              <div className={styles.kvRow}><span>Backend State</span> <span className={engineStatus.is_running ? styles.metricGreen : ''}>{engineStatus.is_running ? 'RUNNING' : 'STOPPED'}</span></div>
              <div className={styles.kvRow}><span>PID</span> <span>{engineStatus.pid !== null ? engineStatus.pid : 'N/A'}</span></div>
              <div className={styles.kvRow}><span>Model Exists?</span> <span>{startupDiag?.resolved_model ? 'YES' : 'NO'}</span></div>
              <div className={styles.kvRow}><span>Resolved Model Path</span> <span>{startupDiag?.resolved_model || 'N/A'}</span></div>
              <div className={styles.kvRow}><span>Backend Binary</span> <span>{startupDiag?.resolved_binary || 'N/A'}</span></div>
              <div className={styles.kvRow}><span>URL</span> <span>127.0.0.1:8080</span></div>
            </div>
            
            <div style={{marginTop: 'auto', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {!hasModels ? (
                <div style={{background: '#ef4444', color: '#fff', padding: '10px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px'}}>
                  NO GGUF MODELS FOUND
                </div>
              ) : (
                <select 
                  value={selectedModel || ''} 
                  onChange={e => setSelectedModel(e.target.value)}
                  style={{background: '#1a1b26', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '4px', fontSize: '12px'}}
                >
                  {foundModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
              
              <button disabled={!hasModels} onClick={handleLoadModel} style={{background: hasModels ? '#4a9eff' : '#333', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: hasModels ? 'pointer' : 'not-allowed', fontSize: '12px', fontWeight: 'bold'}}>
                Launch Backend
              </button>
              <button disabled={!engineStatus.is_running} onClick={handleKill} style={{background: engineStatus.is_running ? '#ef4444' : '#333', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: engineStatus.is_running ? 'pointer' : 'not-allowed', fontSize: '12px', fontWeight: 'bold'}}>
                Kill Backend
              </button>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}><FileTerminal size={14}/> Raw Request</div>
            <button className={styles.expandBtn} onClick={() => setIsRawRequestExpanded(!isRawRequestExpanded)}>
              {isRawRequestExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          <div className={styles.panelContent}>
            <div className={styles.kvList} style={{marginBottom: isRawRequestExpanded ? '10px' : '0'}}>
              <div className={styles.kvRow}><span>Temperature</span> <span>0.7</span></div>
              <div className={styles.kvRow}><span>Top P</span> <span>0.9</span></div>
              <div className={styles.kvRow}><span>Token Limit</span> <span>500</span></div>
            </div>
            {isRawRequestExpanded && (
              <div className={styles.rawPrompt}>
                {rawRequest || 'No request sent yet.'}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Center Column - Stream & Prompts */}
      <div className={styles.columnCenter}>
         <section className={`${styles.panel} ${styles.streamPanel}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}><PlaySquare size={14}/> Validation Workflow & Live Stream</div>
          </div>
          <div className={styles.panelContent} style={{gap: '10px'}}>
            <div style={{display: 'flex', gap: '8px'}}>
              <input 
                type="text" 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)} 
                style={{flex: 1, background: '#1a1b26', color: '#fff', border: '1px solid #333', padding: '8px', borderRadius: '4px', fontSize: '13px'}}
                disabled={!hasModels}
              />
              <button disabled={!hasModels} onClick={handleTestGeneration} style={{background: hasModels ? '#4ade80' : '#333', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: hasModels ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: 'bold'}}>
                Send Test Prompt
              </button>
            </div>
            <div className={styles.tokenStreamBox}>
              {tokenStream.map((t, i) => <span key={i}>{t.token}</span>)}
              {tokenStream.length > 0 && tokenStream[tokenStream.length - 1].is_finished && (
                <div style={{color: '#4ade80', width: '100%', marginTop: '10px'}}>--- GENERATION COMPLETE ---</div>
              )}
              <div ref={streamRef} />
            </div>
          </div>
        </section>
      </div>

      {/* Right Column - Logs */}
      <div className={styles.columnRight}>
        <section className={`${styles.panel} ${styles.logPanel}`}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}><List size={14}/> Live Event Log</div>
          </div>
          <div className={styles.panelContent} style={{padding: '0'}}>
            <div className={styles.logList} style={{padding: '10px', height: '100%'}}>
              {logs.map(log => (
                <div key={log.id} className={styles.logRow}>
                  <span className={styles.logTime}>{new Date(log.timestamp * 1000).toLocaleTimeString()}</span>
                  <span className={styles.logType} style={{color: log.event_type === 'RUNTIME' ? '#94a3b8' : log.event_type === 'HEALTH' ? '#eab308' : '#38bdf8'}}>
                    [{log.event_type}]
                  </span>
                  <span className={styles.logMsg}>{log.message}</span>
                </div>
              ))}
              <div ref={logRef} />
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelHeaderLeft}><Network size={14}/> Raw Response</div>
          </div>
          <div className={styles.panelContent} style={{padding: '0'}}>
            <div className={styles.rawResponseBox}>
              {rawResponses.length > 0 ? rawResponses.map((r, i) => <div key={i} style={{marginBottom: '4px', borderBottom: '1px solid #333', paddingBottom: '4px'}}>{r}</div>) : 'No response received yet.'}
              <div ref={responseRef} />
            </div>
          </div>
        </section>
      </div>

    </div>
  );
};
