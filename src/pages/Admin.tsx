import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CreditCard, 
  LogOut, 
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatInteraction {
  id: string;
  session_id: string;
  visitor_name: string;
  started_at: string;
  device_type: string | null;
  browser: string | null;
  plan_selected: string | null;
  clicked_payment: boolean | null;
  all_clicks: string[] | null;
  time_in_chat_seconds: number | null;
  last_activity: string;
}

// Commission values per plan
const PLAN_COMMISSIONS: Record<string, number> = {
  'Mensal': 16.00,
  'Anual': 62.00,
  'Vitalício': 160.00,
};

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, signOut } = useAdminAuth();
  
  const [interactions, setInteractions] = useState<ChatInteraction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Fetch interactions
  const fetchInteractions = async () => {
    setIsLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('chat_interactions')
        .select('*')
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching interactions:', error);
        return;
      }

      // Type assertion since we know the structure
      const typedData = (data || []).map(item => ({
        ...item,
        all_clicks: Array.isArray(item.all_clicks) 
          ? item.all_clicks as string[]
          : [],
      })) as ChatInteraction[];

      setInteractions(typedData);
    } catch (err) {
      console.error('Error fetching interactions:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Initial fetch and realtime subscription
  useEffect(() => {
    if (!isAdmin) return;

    fetchInteractions();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('chat-interactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_interactions',
        },
        () => {
          fetchInteractions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  // Calculate statistics
  const totalVisitors = interactions.length;
  
  // Count checkouts (clicked_payment) by plan
  const checkoutsByPlan = interactions.reduce((acc, i) => {
    if (i.clicked_payment && i.plan_selected) {
      acc[i.plan_selected] = (acc[i.plan_selected] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const mensalCheckouts = checkoutsByPlan['Mensal'] || 0;
  const anualCheckouts = checkoutsByPlan['Anual'] || 0;
  const vitalicioCheckouts = checkoutsByPlan['Vitalício'] || 0;
  const totalCheckouts = mensalCheckouts + anualCheckouts + vitalicioCheckouts;

  // Calculate potential earnings
  const potentialEarnings = 
    (mensalCheckouts * PLAN_COMMISSIONS['Mensal']) +
    (anualCheckouts * PLAN_COMMISSIONS['Anual']) +
    (vitalicioCheckouts * PLAN_COMMISSIONS['Vitalício']);

  // Count support clicks
  const supportClicks = interactions.reduce((count, i) => {
    if (i.all_clicks) {
      return count + i.all_clicks.filter(click => 
        click.includes('Suporte') || click.includes('🎧')
      ).length;
    }
    return count;
  }, 0);
  
  const conversionRate = totalVisitors > 0 ? ((totalCheckouts / totalVisitors) * 100).toFixed(1) : '0';
  
  const planCounts = interactions.reduce((acc, i) => {
    if (i.plan_selected) {
      acc[i.plan_selected] = (acc[i.plan_selected] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const mostPopularPlan = Object.entries(planCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || '-';
  
  const avgTimeInChat = totalVisitors > 0
    ? Math.floor(interactions.reduce((sum, i) => sum + (i.time_in_chat_seconds || 0), 0) / totalVisitors)
    : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'Mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'Tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-y-auto overflow-x-hidden pb-16">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Luna TV</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInteractions}
              disabled={isLoadingData}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Earnings & Checkouts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Commission Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Checkouts por Plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-muted-foreground">Plano</TableHead>
                      <TableHead className="text-muted-foreground text-center">Checkouts</TableHead>
                      <TableHead className="text-muted-foreground text-right">Comissão Unit.</TableHead>
                      <TableHead className="text-muted-foreground text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="border-border/50">
                      <TableCell className="font-medium text-foreground">⚡ Mensal</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{mensalCheckouts}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">R$ 16,00</TableCell>
                      <TableCell className="text-right font-medium text-green-400">
                        {formatCurrency(mensalCheckouts * 16)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-border/50">
                      <TableCell className="font-medium text-foreground">💎 Anual</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{anualCheckouts}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">R$ 62,00</TableCell>
                      <TableCell className="text-right font-medium text-green-400">
                        {formatCurrency(anualCheckouts * 62)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-border/50">
                      <TableCell className="font-medium text-foreground">👑 Vitalício</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{vitalicioCheckouts}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">R$ 160,00</TableCell>
                      <TableCell className="text-right font-medium text-green-400">
                        {formatCurrency(vitalicioCheckouts * 160)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total de Checkouts:</span>
                  <span className="text-lg font-bold text-foreground">{totalCheckouts}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">Ganhos Potenciais:</span>
                  <span className="text-2xl font-bold text-green-400">{formatCurrency(potentialEarnings)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Visitantes
                  </CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{totalVisitors}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taxa de Conversão
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{conversionRate}%</div>
                  <p className="text-xs text-muted-foreground">{totalCheckouts} checkouts</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Cliques no Suporte
                  </CardTitle>
                  <Headphones className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{supportClicks}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Tempo Médio
                  </CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{formatTime(avgTimeInChat)}</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Interactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground">Interações dos Visitantes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : interactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhuma interação registrada ainda.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="text-muted-foreground">Nome</TableHead>
                        <TableHead className="text-muted-foreground">Data/Hora</TableHead>
                        <TableHead className="text-muted-foreground">Dispositivo</TableHead>
                        <TableHead className="text-muted-foreground">Navegador</TableHead>
                        <TableHead className="text-muted-foreground">Plano</TableHead>
                        <TableHead className="text-muted-foreground">Pagamento</TableHead>
                        <TableHead className="text-muted-foreground">Tempo</TableHead>
                        <TableHead className="text-muted-foreground w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interactions.map((interaction) => (
                        <>
                          <TableRow 
                            key={interaction.id}
                            className="border-border/50 hover:bg-muted/10 cursor-pointer"
                            onClick={() => setExpandedRow(expandedRow === interaction.id ? null : interaction.id)}
                          >
                            <TableCell className="font-medium text-foreground">
                              {interaction.visitor_name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(interaction.started_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                {getDeviceIcon(interaction.device_type)}
                                <span>{interaction.device_type || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {interaction.browser || '-'}
                            </TableCell>
                            <TableCell>
                              {interaction.plan_selected ? (
                                <Badge variant="secondary">{interaction.plan_selected}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {interaction.clicked_payment ? (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  Sim
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Não
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatTime(interaction.time_in_chat_seconds || 0)}
                            </TableCell>
                            <TableCell>
                              {expandedRow === interaction.id ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </TableCell>
                          </TableRow>
                          {expandedRow === interaction.id && (
                            <TableRow className="border-border/50 bg-muted/5">
                              <TableCell colSpan={8} className="py-4">
                                <div className="space-y-3">
                                  <div>
                                    <h4 className="text-sm font-medium text-foreground mb-2">Histórico de Cliques</h4>
                                    {interaction.all_clicks && interaction.all_clicks.length > 0 ? (
                                      <div className="flex flex-wrap gap-2">
                                        {interaction.all_clicks.map((click, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {idx + 1}. {click}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">Nenhum clique registrado</p>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Última atividade: {format(new Date(interaction.last_activity), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
