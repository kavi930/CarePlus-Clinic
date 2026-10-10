import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { WorkflowNode } from '../../types/clinic';
import { 
  GitBranch, 
  Play, 
  CheckCircle2, 
  ArrowDown, 
  Settings, 
  Sparkles, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Server,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';

export const WorkflowBuilderTab: React.FC = () => {
  const { 
    workflowNodes, 
    updateNodeStatus, 
    simulateWorkflowRun, 
    isWorkflowSimulating, 
    activeSimulationStep 
  } = useClinic();

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(workflowNodes[0]);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  const handleSimulate = () => {
    setSimulationLogs(['Initializing automated inquiry runner...', 'Event payload dispatched: [Channel: Website AI Chat]']);
    simulateWorkflowRun();
    
    // Add real-time log statements
    const logIntervals = [
      { step: 1, text: '✓ [Step 1] Inbound inquiry ingested & phone deduplicated.' },
      { step: 2, text: '✓ [Step 2] CRM Lead #CP-904 created with status "New".' },
      { step: 3, text: '✓ [Step 3] AI Assistant qualified: New Patient, Skin Consultation. Safety verified (0 medical advice).' },
      { step: 4, text: '✓ [Step 4] Slot matched: Monday 4:00 PM held with Dr. Ananya Mehta.' },
      { step: 5, text: '✓ [Step 5] WhatsApp confirmation + .ics invite dispatched to patient.' },
      { step: 6, text: '✓ [Step 6] 24-hour reminder scheduled in automation queue.' },
      { step: 7, text: '✓ [Step 7] Clinic reception alert triggered. Pipeline finished in 480ms.' },
    ];

    logIntervals.forEach((item, idx) => {
      setTimeout(() => {
        setSimulationLogs(prev => [...prev, item.text]);
      }, (idx + 1) * 850);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Simulation Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            Interactive Visual Architecture
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
            Clinic Automation Workflow Builder
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end automated orchestration from first inbound message to clinic arrival.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulate}
            disabled={isWorkflowSimulating}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-60"
          >
            <Play className={`w-3.5 h-3.5 ${isWorkflowSimulating ? 'animate-spin' : ''}`} />
            <span>{isWorkflowSimulating ? `Running Node 0${activeSimulationStep}...` : 'Run Pipeline Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Main Builder Layout: Left Flow Diagram, Right Node Config Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Visual Vertical Flow (7 cols) */}
        <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Active Production Pipeline (7 Steps)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              All Triggers Connected
            </span>
          </div>

          {/* Sequential Nodes */}
          <div className="space-y-3 relative">
            {workflowNodes.map((node, index) => {
              const isSelected = selectedNode?.id === node.id;
              const isSimulatingActive = activeSimulationStep === node.stepNumber;
              const isSimulatedPassed = activeSimulationStep > node.stepNumber;

              return (
                <React.Fragment key={node.id}>
                  {/* The Node Card */}
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`rounded-xl p-4 border transition-all duration-200 cursor-pointer relative ${
                      isSimulatingActive
                        ? 'bg-blue-600/25 border-cyan-400 ring-2 ring-cyan-400 shadow-xl shadow-cyan-500/20'
                        : isSelected
                        ? 'bg-slate-900 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                            isSimulatingActive
                              ? 'bg-cyan-500 text-black animate-pulse'
                              : isSimulatedPassed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isSimulatedPassed ? '✓' : `0${node.stepNumber}`}
                        </div>

                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{node.label}</span>
                            {isSimulatingActive && (
                              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono">
                                Executing
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {node.subtitle}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-mono text-slate-400">
                          {node.metrics.executionsToday} runs today
                        </div>
                        <div className="text-[10px] font-mono text-emerald-400">
                          {node.metrics.successRate}
                        </div>
                      </div>
                    </div>

                    {/* Trigger brief */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[280px]">
                        ⚡ {node.trigger}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </div>
                  </div>

                  {/* Connector Arrow */}
                  {index < workflowNodes.length - 1 && (
                    <div className="flex justify-center py-0.5 text-slate-600">
                      <ArrowDown className={`w-3.5 h-3.5 ${isSimulatedPassed ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Live Simulator Logs Box */}
          {simulationLogs.length > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-black/60 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center justify-between">
                <span>Simulation Event Stream</span>
                <span>Latency ~280ms</span>
              </div>
              {simulationLogs.map((log, idx) => (
                <div key={idx} className={idx === simulationLogs.length - 1 ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Clicked Node Configuration Panel (5 cols) */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24">
          {selectedNode ? (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                    Node Configuration · Step 0{selectedNode.stepNumber}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {selectedNode.label}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                  <button
                    onClick={() => updateNodeStatus(selectedNode.id, !selectedNode.isActive)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      selectedNode.isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {selectedNode.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-300 leading-relaxed">
                {selectedNode.description}
              </div>

              {/* Trigger Definition */}
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-cyan-400 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Configured Trigger:</span>
                </div>
                <div className="text-xs text-white font-medium">
                  {selectedNode.trigger}
                </div>
              </div>

              {/* Automated Actions List */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                  Executed Actions ({selectedNode.actions.length}):
                </div>
                <div className="space-y-2">
                  {selectedNode.actions.map((act, actIdx) => (
                    <div
                      key={actIdx}
                      className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Node Performance Telemetry */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Executions</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedNode.metrics.executionsToday}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Reliability</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    {selectedNode.metrics.successRate}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Avg Latency</div>
                  <div className="text-sm font-bold text-cyan-300 font-mono mt-0.5">
                    {selectedNode.metrics.avgLatency}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 text-center">
                All nodes update CRM leads, calendar slots, and notification channels instantaneously.
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Click any workflow node on the left to view its trigger & actions.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
