import { useState, useEffect, useRef, useCallback } from 'react';
import { Dose, AlertInfo } from '../types';

const SNOOZE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

export const useAlerts = (
  // ATENÇÃO: O hook agora consome as doses já calculadas para o dia.
  todaysDoses: Dose[],
) => {
  const [alert, setAlert] = useState<AlertInfo | null>(null);
  const [snoozedAlerts, setSnoozedAlerts] = useState<Map<string, number>>(new Map());
  const alertedFor = useRef<Set<string>>(new Set());

  const checkAlerts = useCallback(() => {
    // Se já existe um alerta ativo, não faz nada.
    if (alert) return;

    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const todayStr = now.toISOString().split('T')[0];
    
    let potentialAlert: AlertInfo | null = null;
    let expiredSnooze = false;

    // Itera sobre as doses de hoje para encontrar um alerta para disparar
    for (const dose of todaysDoses) {
      // Só nos importamos com doses pendentes
      if (dose.status !== 'pending') continue;

      const alertId = `${dose.medication.id}-${dose.time}-${todayStr}`;
      const snoozedUntil = snoozedAlerts.get(alertId);

      // CONDIÇÃO 1 (MAIOR PRIORIDADE): O tempo de adiamento acabou?
      if (snoozedUntil && now.getTime() >= snoozedUntil) {
        potentialAlert = { medication: dose.medication, doseTime: dose.time };
        
        // Remove o item do mapa de adiados para não disparar de novo
        setSnoozedAlerts(prev => {
            const newMap = new Map(prev);
            newMap.delete(alertId);
            return newMap;
        });

        expiredSnooze = true;
        break; // Encontrou o alerta mais importante, para a busca.
      }

      // CONDIÇÃO 2: É o horário de uma dose normal (não adiada)?
      if (!snoozedUntil && dose.time === currentTime && !alertedFor.current.has(alertId)) {
        potentialAlert = { medication: dose.medication, doseTime: dose.time };
        alertedFor.current.add(alertId);
        break; // Encontrou um alerta, para a busca.
      }
    }

    if (potentialAlert && !alert) {
        setAlert(potentialAlert);
    }

    // Limpa os registros no começo de um novo dia
    if (currentTime === '00:00') {
      alertedFor.current.clear();
      setSnoozedAlerts(new Map());
    }
  }, [todaysDoses, alert, snoozedAlerts]);

  useEffect(() => {
    // A verificação agora é mais frequente para garantir que o alerta dispare no minuto certo.
    const interval = setInterval(checkAlerts, 5000); // Verifica a cada 5 segundos
    checkAlerts(); // Verificação inicial
    return () => clearInterval(interval);
  }, [checkAlerts]);

  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);
  
  const snoozeAlert = useCallback(() => {
    if (!alert) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const alertId = `${alert.medication.id}-${alert.doseTime}-${todayStr}`;
    
    // Adiciona o alerta ao mapa de adiados com o tempo de expiração
    setSnoozedAlerts(prev => {
        const newMap = new Map(prev);
        newMap.set(alertId, Date.now() + SNOOZE_DURATION);
        return newMap;
    });
    
    clearAlert(); // Fecha o modal de alerta
  }, [alert, clearAlert]);

  return { alert, clearAlert, snoozeAlert, snoozedAlerts };
};
