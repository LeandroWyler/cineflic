import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InteractionData {
  sessionId: string;
  visitorName: string | null;
  deviceType: string;
  browser: string;
  planSelected: string | null;
  clickedPayment: boolean;
  allClicks: string[];
  startedAt: Date;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function detectDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    if (/tablet|ipad/i.test(userAgent)) {
      return 'Tablet';
    }
    return 'Mobile';
  }
  return 'Desktop';
}

function detectBrowser(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('SamsungBrowser')) return 'Samsung Browser';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident')) return 'Internet Explorer';
  
  return 'Unknown';
}

export function useInteractionTracker() {
  const [interactionData, setInteractionData] = useState<InteractionData>(() => ({
    sessionId: generateSessionId(),
    visitorName: null,
    deviceType: detectDeviceType(),
    browser: detectBrowser(),
    planSelected: null,
    clickedPayment: false,
    allClicks: [],
    startedAt: new Date(),
  }));

  const isCreatedRef = useRef(false);
  const lastUpdateRef = useRef<Date>(new Date());

  // Create interaction record
  const createInteraction = useCallback(async (name: string) => {
    if (isCreatedRef.current) return;
    
    try {
      const { error } = await supabase
        .from('chat_interactions')
        .insert({
          session_id: interactionData.sessionId,
          visitor_name: name,
          device_type: interactionData.deviceType,
          browser: interactionData.browser,
          started_at: interactionData.startedAt.toISOString(),
          all_clicks: [],
          clicked_payment: false,
          time_in_chat_seconds: 0,
        });

      if (error) {
        console.error('Error creating interaction:', error);
        return;
      }

      isCreatedRef.current = true;
      setInteractionData(prev => ({ ...prev, visitorName: name }));
    } catch (err) {
      console.error('Error creating interaction:', err);
    }
  }, [interactionData.sessionId, interactionData.deviceType, interactionData.browser, interactionData.startedAt]);

  // Update interaction record
  const updateInteraction = useCallback(async (updates: Partial<{
    planSelected: string;
    clickedPayment: boolean;
    newClick: string;
  }>) => {
    // Skip if interaction not created yet
    if (!isCreatedRef.current) {
      console.log('Interaction not created yet, skipping update');
      return;
    }

    try {
      const timeInChat = Math.floor((Date.now() - interactionData.startedAt.getTime()) / 1000);
      
      const updateData: Record<string, unknown> = {
        time_in_chat_seconds: timeInChat,
        last_activity: new Date().toISOString(),
      };

      if (updates.planSelected) {
        updateData.plan_selected = updates.planSelected;
        setInteractionData(prev => ({ ...prev, planSelected: updates.planSelected! }));
      }

      if (updates.clickedPayment) {
        updateData.clicked_payment = true;
        setInteractionData(prev => ({ ...prev, clickedPayment: true }));
      }

      if (updates.newClick) {
        const newClicks = [...interactionData.allClicks, updates.newClick];
        updateData.all_clicks = newClicks;
        setInteractionData(prev => ({ ...prev, allClicks: newClicks }));
      }

      const { error } = await supabase
        .from('chat_interactions')
        .update(updateData)
        .eq('session_id', interactionData.sessionId);

      if (error) {
        console.error('Error updating interaction:', error);
      }
      
      lastUpdateRef.current = new Date();
    } catch (err) {
      console.error('Error updating interaction:', err);
    }
  }, [interactionData.sessionId, interactionData.startedAt, interactionData.allClicks]);

  // Track click
  const trackClick = useCallback((option: string) => {
    updateInteraction({ newClick: option });
  }, [updateInteraction]);

  // Track plan selection
  const trackPlanSelected = useCallback((plan: string) => {
    updateInteraction({ planSelected: plan, newClick: `Plano: ${plan}` });
  }, [updateInteraction]);

  // Track payment click
  const trackPaymentClick = useCallback(() => {
    updateInteraction({ clickedPayment: true, newClick: 'Clicou no pagamento' });
  }, [updateInteraction]);

  // Update time periodically
  useEffect(() => {
    if (!isCreatedRef.current) return;

    const interval = setInterval(() => {
      const timeInChat = Math.floor((Date.now() - interactionData.startedAt.getTime()) / 1000);
      
      supabase
        .from('chat_interactions')
        .update({
          time_in_chat_seconds: timeInChat,
          last_activity: new Date().toISOString(),
        })
        .eq('session_id', interactionData.sessionId)
        .then(({ error }) => {
          if (error) console.error('Error updating time:', error);
        });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [interactionData.sessionId, interactionData.startedAt]);

  return {
    sessionId: interactionData.sessionId,
    createInteraction,
    trackClick,
    trackPlanSelected,
    trackPaymentClick,
  };
}
