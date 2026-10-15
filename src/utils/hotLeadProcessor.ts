import { useState, useEffect, useRef, useCallback } from 'react';
import { Lead } from '../types';

export const HOT_SCORE_THRESHOLD = 85;

export interface HotEvaluationResult {
  updatedLeads: Lead[];
  changedCount: number;
  newlyHotCount: number;
  unmarkedCount: number;
  hotTotalCount: number;
}

/**
 * Pure evaluation function that inspects leads and updates their 'isHot' status
 * and 'Hot' tag based on whether acquirabilityScore > 85.
 */
export function evaluateLeadsForHotStatus(leads: Lead[]): HotEvaluationResult {
  let changedCount = 0;
  let newlyHotCount = 0;
  let unmarkedCount = 0;
  let hotTotalCount = 0;

  const nowIso = new Date().toISOString();

  const updatedLeads = leads.map((lead) => {
    const acquirabilityScore = lead.peSignals?.acquirabilityScore ?? 0;
    const shouldBeHot = acquirabilityScore > HOT_SCORE_THRESHOLD;
    const isCurrentlyHot = !!lead.isHot;
    const hasHotTag = (lead.tags || []).includes('Hot');

    if (shouldBeHot) {
      hotTotalCount++;
    }

    // Check if state is already in sync
    if (shouldBeHot === isCurrentlyHot && (!shouldBeHot || hasHotTag)) {
      return lead;
    }

    changedCount++;

    let updatedTags = [...(lead.tags || [])];
    if (shouldBeHot) {
      newlyHotCount++;
      if (!hasHotTag) {
        updatedTags.unshift('Hot');
      }
      return {
        ...lead,
        isHot: true,
        hotMarkedAt: lead.hotMarkedAt || nowIso,
        tags: updatedTags,
      };
    } else {
      unmarkedCount++;
      updatedTags = updatedTags.filter((t) => t !== 'Hot');
      return {
        ...lead,
        isHot: false,
        hotMarkedAt: undefined,
        tags: updatedTags,
      };
    }
  });

  return {
    updatedLeads,
    changedCount,
    newlyHotCount,
    unmarkedCount,
    hotTotalCount,
  };
}

export interface HotDaemonState {
  isActive: boolean;
  cycleCount: number;
  lastAuditedAt: string | null;
  hotCount: number;
  lastChangedCount: number;
  recentNotice: string | null;
}

/**
 * Custom hook that runs the background process daemon for automatically
 * classifying leads as 'Hot' when acquirabilityScore > 85.
 */
export function useHotLeadDaemon(
  leads: Lead[],
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>,
  setSelectedLead?: React.Dispatch<React.SetStateAction<Lead | null>>,
  pollIntervalMs: number = 4000
) {
  const [daemonState, setDaemonState] = useState<HotDaemonState>({
    isActive: true,
    cycleCount: 0,
    lastAuditedAt: null,
    hotCount: leads.filter((l) => (l.peSignals?.acquirabilityScore ?? 0) > HOT_SCORE_THRESHOLD).length,
    lastChangedCount: 0,
    recentNotice: null,
  });

  const leadsRef = useRef(leads);
  leadsRef.current = leads;

  const runEvaluationCycle = useCallback(() => {
    const currentLeads = leadsRef.current;
    const { updatedLeads, changedCount, newlyHotCount, hotTotalCount } = evaluateLeadsForHotStatus(currentLeads);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (changedCount > 0) {
      setLeads(updatedLeads);
      if (setSelectedLead) {
        setSelectedLead((prev) => {
          if (!prev) return null;
          const match = updatedLeads.find((l) => l.id === prev.id);
          return match || prev;
        });
      }

      const notice = newlyHotCount > 0
        ? `Background Daemon: Auto-tagged ${newlyHotCount} lead${newlyHotCount > 1 ? 's' : ''} as 'Hot' (>85 PE Acquirability)`
        : `Background Daemon: Updated lead prioritization status`;

      setDaemonState((prev) => ({
        ...prev,
        cycleCount: prev.cycleCount + 1,
        lastAuditedAt: now,
        hotCount: hotTotalCount,
        lastChangedCount: changedCount,
        recentNotice: notice,
      }));
    } else {
      setDaemonState((prev) => ({
        ...prev,
        cycleCount: prev.cycleCount + 1,
        lastAuditedAt: now,
        hotCount: hotTotalCount,
        lastChangedCount: 0,
      }));
    }
  }, [setLeads, setSelectedLead]);

  // Initial immediate background check on mount or when leads list changes
  useEffect(() => {
    runEvaluationCycle();
  }, [runEvaluationCycle]);

  // Recurring background interval daemon
  useEffect(() => {
    if (!daemonState.isActive) return;

    const intervalId = setInterval(() => {
      runEvaluationCycle();
    }, pollIntervalMs);

    return () => clearInterval(intervalId);
  }, [daemonState.isActive, pollIntervalMs, runEvaluationCycle]);

  const toggleDaemon = () => {
    setDaemonState((prev) => ({
      ...prev,
      isActive: !prev.isActive,
      recentNotice: !prev.isActive ? 'Background lead scoring process resumed' : 'Background lead scoring process paused',
    }));
  };

  const triggerManualAudit = () => {
    runEvaluationCycle();
  };

  const clearNotice = () => {
    setDaemonState((prev) => ({ ...prev, recentNotice: null }));
  };

  return {
    daemonState,
    toggleDaemon,
    triggerManualAudit,
    clearNotice,
  };
}
