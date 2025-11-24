import { useState, useEffect, useRef, useCallback } from 'react';
import { Medication, AlertInfo } from '../types';

const SNOOZE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAlerts = (
  medications: Medication[],
) => {
  const [alert, setAlert] = useState<AlertInfo | null>(null);
  const alertedFor = useRef<Set<string>>(new Set());
  const snoozedAlerts = useRef<Map<string, number>>(new Map());

  const checkAlerts = useCallback(() => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const todayStr = now.toISOString().split('T')[0];
    
    medications.forEach(med => {
      // Check if treatment period is active
      const today = new Date();
      today.setHours(0,0,0,0);
      const startDate = new Date(med.startDate);
      startDate.setHours(0,0,0,0);

      if (today < startDate) return; // Not started yet

      if (typeof med.duration === 'number') {
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + med.duration - 1); // -1 because start day is day 1
        if (today > endDate) return; // Treatment finished
      }
      
      med.schedule.times.forEach(doseTime => {
        const alertId = `${med.id}-${doseTime}-${todayStr}`;
        
        const snoozedUntil = snoozedAlerts.current.get(alertId);
        if (snoozedUntil && now.getTime() < snoozedUntil) {
          return; // Still snoozing
        }

        if (doseTime === currentTime && !alertedFor.current.has(alertId)) {
          setAlert({ medication: med, doseTime });
          alertedFor.current.add(alertId);
          snoozedAlerts.current.delete(alertId); // Clear snooze if re-alerting
        }
      });
    });
    
    // Reset alerted set at midnight
    if (currentTime === '00:00') {
        alertedFor.current.clear();
        snoozedAlerts.current.clear();
    }
  }, [medications]);

  useEffect(() => {
    const interval = setInterval(checkAlerts, 30 * 1000); // Check every 30 seconds
    checkAlerts(); // Initial check
    
    return () => clearInterval(interval);
  }, [checkAlerts]);

  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);
  
  const snoozeAlert = useCallback((med: Medication, doseTime: string) => {
    const today = new Date().toISOString().split('T')[0];
    const alertId = `${med.id}-${doseTime}-${today}`;
    snoozedAlerts.current.set(alertId, Date.now() + SNOOZE_DURATION);
    clearAlert();
  }, [clearAlert]);

  return { alert, clearAlert, snoozeAlert };
};