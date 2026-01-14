import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Headphones, MessageCircle } from "lucide-react";
import ChatMessage from "@/components/ChatMessage";
import UserMessage from "@/components/UserMessage";
import InlineChatButtons from "@/components/InlineChatButtons";
import TypingIndicator from "@/components/TypingIndicator";
import PaymentButton from "@/components/PaymentButton";
import ChatInput from "@/components/ChatInput";
import ChatImage from "@/components/ChatImage";
import SupportButton from "@/components/SupportButton";
import { playNotificationSound, preloadNotificationSound } from "@/utils/notificationSound";
import { useInteractionTracker } from "@/hooks/useInteractionTracker";
import lunaAvatar from "@/assets/luna-tv-avatar.jpg";
import lunaAppHome from "@/assets/luna-app-home.jpg";
import lunaAppFilmes from "@/assets/luna-app-filmes.jpg";
import lunaAppCanais from "@/assets/luna-app-canais.jpg";
import lunaAppSeries from "@/assets/luna-app-series.jpg";
type ConversationState = 
  | "welcome"
  | "asking_name"
  | "initial"
  | "plans"
  | "test"
  | "mensal"
  | "anual"
  | "vitalicio"
  | "conhecer_intro"
  | "conhecer_filmes"
  | "conhecer_series"
  | "conhecer_canais"
  | "conhecer_final"
  | "dispositivos"
  | "doubt"
  | "followup"
  | "renovar"
  | "suporte";

interface Message {
  text: string;
  isUser?: boolean;
  isPaymentButton?: boolean;
  paymentUrl?: string;
  isButtons?: boolean;
  buttonOptions?: string[];
  isImage?: boolean;
  imageUrl?: string;
  imageCaption?: string;
  isSupportButton?: boolean;
  supportUrl?: string;
}

// App screenshots - imported from assets
const LUNA_APP_IMAGES = {
  home: lunaAppHome,
  filmes: lunaAppFilmes,
  canais: lunaAppCanais,
  series: lunaAppSeries,
};
// Intent options (shown first after welcome)
const INTENT_OPTIONS = ["🛒 Quero comprar", "🔄 Quero renovar", "🎧 Preciso de Suporte"];

// Welcome message with 3 intent options
const WELCOME_MESSAGES: Message[] = [
  { text: "Oi! 👋 Seja Bem-vindo(a) à Luna TV! 🌙" },
  { text: "Como posso te ajudar hoje?" },
  { text: "", isButtons: true, buttonOptions: INTENT_OPTIONS },
];

const getAskNameMessages = (intent: string): Message[] => {
  let contextMessage = "";
  
  if (intent === "🛒 Quero comprar") {
    contextMessage = "Ótima escolha! 🎉 Vou te mostrar tudo sobre a Luna TV.";
  } else if (intent === "🔄 Quero renovar") {
    contextMessage = "Que bom ter você de volta! 💜 Vou te ajudar com a renovação.";
  } else {
    contextMessage = "Claro, estou aqui para te ajudar! 💪";
  }
  
  return [
    { text: contextMessage },
    { text: "Para começar, qual é o seu nome? 😊" },
  ];
};

const getInitialMessages = (name: string): Message[] => [
  { text: `Prazer em te conhecer, ${name}! 🌟` },
  { text: "Aqui é a Luna TV 🌙\nFilmes, séries e +2 mil canais ao vivo 📺🔥" },
  { text: "O que você gostaria de fazer?" },
  { text: "", isButtons: true, buttonOptions: INITIAL_OPTIONS },
];

const getRenovarMessages = (name: string): Message[] => [
  { text: `Prazer em te ver novamente, ${name}! 🌟` },
  { text: "Para renovar sua assinatura, escolha um dos planos abaixo 👇" },
];

const getSuporteMessages = (): Message[] => [
  { text: "Claro, estou aqui para te ajudar! 💪" },
  { text: "Clique no botão abaixo para ser encaminhado para o suporte:" },
  { text: "", isSupportButton: true, supportUrl: "https://suporteluna.lovable.app" },
];

const getPlansMessages = (name: string): Message[] => [
  { text: `Show, ${name}! 👏\nOlha os planos disponíveis 👇` },
  { text: "📺 Mensal – R$ 24,90\n📺 Anual – R$ 89,90 (2 telas)\n📺 Vitalício – R$ 250,00" },
  { text: "Todos com acesso imediato a +40 mil filmes, séries e +2 mil canais ao vivo 🔥" },
  { text: "Qual plano você prefere?" },
  { text: "", isButtons: true, buttonOptions: PLAN_OPTIONS },
];

const getTestMessages = (name: string): Message[] => [
  { text: `${name}, nosso teste é de 7 dias 😉` },
  { text: "Você compra, usa normalmente\ne o dinheiro fica 100% seguro na Kirvano 💰" },
  { text: "Se não gostar, a própria plataforma devolve 😉\nQuer ver os planos agora?" },
  { text: "", isButtons: true, buttonOptions: TEST_OPTIONS },
];

// Fluxo interativo de conhecer a Luna TV
const getConhecerIntroMessages = (name: string): Message[] => [
  { text: `${name}, que legal que você quer conhecer a Luna TV! 🌙✨` },
  { text: "", isImage: true, imageUrl: LUNA_APP_IMAGES.home, imageCaption: "🏠 Olha como é organizado nosso app!" },
  { text: "Me conta... você gosta de assistir filmes? 🎬" },
  { text: "", isButtons: true, buttonOptions: ["🎬 Adoro filmes!", "📺 Prefiro séries", "⚽ Curto mais esportes"] },
];

const getConhecerFilmesMessages = (): Message[] => [
  { text: "Que ótimo! 🎬🔥" },
  { text: "Temos mais de 40 MIL filmes!\nLançamentos de cinema, clássicos, ação, terror, comédia... 🍿" },
  { text: "", isImage: true, imageUrl: LUNA_APP_IMAGES.filmes, imageCaption: "🎬 Olha nossa biblioteca de filmes!" },
  { text: "E você curte séries também? Tipo Netflix, HBO...? 📺" },
  { text: "", isButtons: true, buttonOptions: ["📺 Sim, amo séries!", "⚽ Prefiro esportes", "✅ Já quero ver os planos!"] },
];

const getConhecerSeriesMessages = (): Message[] => [
  { text: "Você vai amar! 📺🔥" },
  { text: "Temos TODAS as séries da Netflix, Amazon, HBO Max, Disney+, Globoplay...\n\nSão mais de 1.000 séries só da Netflix! 😱" },
  { text: "", isImage: true, imageUrl: LUNA_APP_IMAGES.series, imageCaption: "📺 Séries de TODAS as plataformas!" },
  { text: "E o melhor: tudo atualizado! 🚀\nLançou episódio novo, já tá aqui!" },
  { text: "Curte futebol ou outros esportes? ⚽" },
  { text: "", isButtons: true, buttonOptions: ["⚽ Sim, adoro!", "✅ Tô convencido! Ver planos"] },
];

const getConhecerCanaisMessages = (): Message[] => [
  { text: "Apaixonado por esportes? Você tá no lugar certo! ⚽🏆" },
  { text: "Temos +2.000 canais ao vivo!\nTodos os jogos de futebol, UFC, NBA, F1... 🔥" },
  { text: "", isImage: true, imageUrl: LUNA_APP_IMAGES.canais, imageCaption: "📺 Canais ao vivo - Futebol, esportes, tudo!" },
  { text: "Premiere, ESPN, SporTV, Globo, TNT Sports...\nTUDO liberado! 🎉" },
  { text: "", isButtons: true, buttonOptions: ["✅ Quero ver os planos!", "📱 Funciona na TV?"] },
];

const getConhecerFinalMessages = (name: string): Message[] => [
  { text: `${name}, resumindo... 🌙` },
  { text: "🎬 +40 mil filmes\n📺 +1.000 séries\n⚽ +2.000 canais ao vivo\n💰 Economia de R$ 4.000/ano!" },
  { text: "Funciona na TV, celular, tablet e computador! 🔥" },
  { text: "", isButtons: true, buttonOptions: CONHECER_OPTIONS },
];

const getDispositivosMessages = (name: string): Message[] => [
  { text: `${name}, a Luna TV funciona em praticamente TUDO! 🔥` },
  { text: "📱 Celulares e Tablets (Android/iPhone)\n📺 Smart TVs de todas as marcas\n💻 Computadores e Notebooks\n🎮 PlayStation e Xbox\n📡 TV Box e Fire Stick\n📲 Chromecast" },
  { text: "Não precisa de antena nem instalador!\nÉ só ter internet que funciona 🌐" },
  { text: "Funciona até fora do Brasil! 🌍\nViajou? Leva sua Luna TV com você!" },
  { text: "E ainda tem suporte pra te ajudar na instalação! 💪\nPronto pra garantir o seu?" },
  { text: "", isButtons: true, buttonOptions: DISPOSITIVOS_OPTIONS },
];

const getMensalMessages = (name: string): Message[] => [
  { text: `Boa escolha, ${name}! 😄\nO Plano Mensal é perfeito pra testar tudo.` },
  { text: "Atenção ⚠️\nPreenche seus dados certinho\ne coloca um WhatsApp válido 📲" },
  { 
    text: "", 
    isPaymentButton: true, 
    paymentUrl: "https://pay.kirvano.com/3aac96c1-7db8-4bed-900a-a51664129a81?aff=530c9cfe-fc36-4cd5-8ca5-2aaad880b6a4" 
  },
  { text: "Assim que pagar, o acesso chega rapidinho 🚀" },
];

const getAnualMessages = (name: string): Message[] => [
  { text: `Excelente escolha, ${name}! 🔥\nEsse plano libera 2 telas ao mesmo tempo 📺📺` },
  { text: "Atenção ⚠️\nPreenche seus dados certinho\ne coloca um WhatsApp válido 📲" },
  { 
    text: "", 
    isPaymentButton: true, 
    paymentUrl: "https://pay.kirvano.com/4c835663-ac65-4908-9470-c70bfa3cc84c?aff=530c9cfe-fc36-4cd5-8ca5-2aaad880b6a4" 
  },
  { text: "Você ainda tem 7 dias de garantia 😉" },
];

const getVitalicioMessages = (name: string): Message[] => [
  { text: `Top demais, ${name}! 😎🔥\nPaga uma vez só e aproveita pra sempre.` },
  { text: "Atenção ⚠️\nPreenche seus dados certinho\ne coloca um WhatsApp válido 📲" },
  { 
    text: "", 
    isPaymentButton: true, 
    paymentUrl: "https://pay.kirvano.com/29b91baf-cecf-47c9-a4eb-2f270c992af0?aff=530c9cfe-fc36-4cd5-8ca5-2aaad880b6a4" 
  },
  { text: "Assim que pagar, acesso liberado pra sempre 🚀" },
];

const getFollowupMessages = (name: string): Message[] => [
  { text: `Ei ${name}, ainda tá por aí? 😊` },
  { text: "Se tiver alguma dúvida, posso te ajudar!\nOu quer conhecer melhor a Luna TV? 👇" },
  { text: "", isButtons: true, buttonOptions: FOLLOWUP_OPTIONS },
];

const INITIAL_OPTIONS = ["📺 Ver planos", "🌙 Conhecer a Luna TV", "🎁 Como funciona o teste"];
const PLAN_OPTIONS = ["Mensal", "Anual", "Vitalício"];
const TEST_OPTIONS = ["📺 Ver planos", "🌙 Conhecer mais"];
const CONHECER_OPTIONS = ["📱 Onde funciona?", "📺 Ver planos"];
const DISPOSITIVOS_OPTIONS = ["📺 Ver planos", "🎁 Garantia de 7 dias"];
const FOLLOWUP_OPTIONS = ["📺 Ver planos", "🌙 Conhecer a Luna TV"];

const Index = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userIntent, setUserIntent] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const [messageQueue, setMessageQueue] = useState<Message[]>(WELCOME_MESSAGES);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>("welcome");
  const [followupTriggered, setFollowupTriggered] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const followupTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { createInteraction, trackClick, trackPlanSelected, trackPaymentClick } = useInteractionTracker();

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Process message queue with delays
  useEffect(() => {
    if (messageQueue.length === 0) {
      setIsTyping(false);
      
      // If asking for name, enable input
      if (conversationState === "asking_name" && !userName) {
        setWaitingForInput(true);
      }
      
      // Start followup timer after payment flow ends
      if (!followupTriggered && 
          (conversationState === "mensal" || conversationState === "anual" || conversationState === "vitalicio")) {
        followupTimerRef.current = setTimeout(() => {
          setFollowupTriggered(true);
          setConversationState("followup");
          setMessageQueue(getFollowupMessages(userName || ""));
        }, 10000);
      }
      
      return;
    }

    setIsTyping(true);

    const timer = setTimeout(() => {
      const [nextMessage, ...remaining] = messageQueue;
      setMessages((prev) => [...prev, nextMessage]);
      setMessageQueue(remaining);
      
      // Play notification sound for non-user messages
      if (!nextMessage.isUser && audioEnabled) {
        playNotificationSound();
      }
    }, 800 + Math.random() * 400);

    return () => clearTimeout(timer);
  }, [messageQueue, audioEnabled, conversationState, followupTriggered, userName]);

  // Cleanup followup timer on unmount
  useEffect(() => {
    return () => {
      if (followupTimerRef.current) {
        clearTimeout(followupTimerRef.current);
      }
    };
  }, []);

  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setWaitingForInput(false);
    setAudioEnabled(true);
    preloadNotificationSound();
    
    // Create interaction record in database
    createInteraction(name);
    
    // Add user message
    const userMessage: Message = { text: name, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    
    // Start appropriate flow based on intent
    setTimeout(() => {
      if (userIntent === "🔄 Quero renovar") {
        setConversationState("renovar");
        setMessageQueue([...getRenovarMessages(name), ...getPlansMessages(name)]);
      } else {
        // Default: "Quero comprar"
        setConversationState("initial");
        setMessageQueue(getInitialMessages(name));
      }
    }, 500);
  };

  const handleOptionSelect = (option: string) => {
    // Clear followup timer if user interacts
    if (followupTimerRef.current) {
      clearTimeout(followupTimerRef.current);
      followupTimerRef.current = null;
    }
    
    // Track the click
    trackClick(option);
    
    // Add user message to chat
    const userMessage: Message = { text: option, isUser: true };
    setMessages((prev) => [...prev, userMessage]);

    // Small delay before bot responds
    setTimeout(() => {
      const name = userName || "";
      
      // Handle intent selection (first step)
      if (option === "🛒 Quero comprar" || option === "🔄 Quero renovar") {
        setUserIntent(option);
        setConversationState("asking_name");
        setMessageQueue(getAskNameMessages(option));
        return;
      }
      
      // Suporte goes directly without asking name
      if (option === "🎧 Preciso de Suporte") {
        // Create interaction for support without name
        createInteraction("Suporte Direto");
        setConversationState("suporte");
        setMessageQueue(getSuporteMessages());
        return;
      }
      
      if (option === "📺 Ver planos" || option === "📺 Ver outros planos" || option === "✅ Já quero ver os planos!" || option === "✅ Tô convencido! Ver planos" || option === "✅ Quero ver os planos!") {
        setConversationState("plans");
        setFollowupTriggered(false);
        setMessageQueue(getPlansMessages(name));
      } else if (option === "🌙 Conhecer a Luna TV" || option === "🌙 Conhecer mais") {
        setConversationState("conhecer_intro");
        setMessageQueue(getConhecerIntroMessages(name));
      } else if (option === "🎬 Adoro filmes!") {
        setConversationState("conhecer_filmes");
        setMessageQueue(getConhecerFilmesMessages());
      } else if (option === "📺 Prefiro séries" || option === "📺 Sim, amo séries!") {
        setConversationState("conhecer_series");
        setMessageQueue(getConhecerSeriesMessages());
      } else if (option === "⚽ Curto mais esportes" || option === "⚽ Prefiro esportes" || option === "⚽ Sim, adoro!") {
        setConversationState("conhecer_canais");
        setMessageQueue(getConhecerCanaisMessages());
      } else if (option === "📱 Funciona na TV?") {
        setConversationState("conhecer_final");
        setMessageQueue(getConhecerFinalMessages(name));
      } else if (option === "📱 Onde funciona?") {
        setConversationState("dispositivos");
        setMessageQueue(getDispositivosMessages(name));
      } else if (option === "🎁 Como funciona o teste" || option === "🎁 Garantia de 7 dias") {
        setConversationState("test");
        setMessageQueue(getTestMessages(name));
      } else if (option === "💬 Falar com suporte") {
        window.location.href = "https://suporteluna.lovable.app/auth";
      } else if (option === "Mensal") {
        setConversationState("mensal");
        setFollowupTriggered(false);
        trackPlanSelected("Mensal");
        setMessageQueue(getMensalMessages(name));
      } else if (option === "Anual") {
        setConversationState("anual");
        setFollowupTriggered(false);
        trackPlanSelected("Anual");
        setMessageQueue(getAnualMessages(name));
      } else if (option === "Vitalício") {
        setConversationState("vitalicio");
        setFollowupTriggered(false);
        trackPlanSelected("Vitalício");
        setMessageQueue(getVitalicioMessages(name));
      }
    }, 500);
  };
  
  const handlePaymentClick = () => {
    trackPaymentClick();
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* WhatsApp-style header */}
      <div 
        className="px-[10px] py-[10px] flex items-center gap-[10px]"
        style={{ backgroundColor: "#075e54" }}
      >
        <div className="w-[40px] h-[40px] rounded-full overflow-hidden border-2 border-white/20">
          <img 
            src={lunaAvatar} 
            alt="Luna TV" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-medium text-[16px] leading-[21px]">Luna TV</h1>
          <p className="text-white/80 text-[13px] leading-[17px]">online</p>
        </div>
        <a 
          href="https://suporteluna.lovable.app/auth"
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          title="Falar com suporte"
        >
          <Headphones className="w-[18px] h-[18px] text-white" />
          <span className="text-white text-[13px] font-medium">Suporte</span>
          <span 
            className="w-[8px] h-[8px] rounded-full"
            style={{ 
              backgroundColor: "#25d366",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
            }} 
          />
        </a>
      </div>

      {/* Chat area with WhatsApp wallpaper pattern */}
      <div className="flex-1 overflow-y-auto py-[6px] whatsapp-wallpaper">
        {/* Date badge */}
        <div className="flex justify-center mb-[12px] mt-[4px]">
          <span 
            className="text-[12.5px] px-[12px] py-[5px] rounded-[7.5px]"
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "#54656f",
              boxShadow: "0 1px 0.5px rgba(11, 20, 26, 0.13)"
            }}
          >
            Hoje
          </span>
        </div>

        {/* Messages */}
        {messages.map((message, index) => {
          if (message.isUser) {
            return <UserMessage key={index} text={message.text} />;
          }
          if (message.isPaymentButton && message.paymentUrl) {
            return <PaymentButton key={index} url={message.paymentUrl} onPaymentClick={handlePaymentClick} />;
          }
          if (message.isSupportButton && message.supportUrl) {
            return <SupportButton key={index} url={message.supportUrl} />;
          }
          if (message.isButtons && message.buttonOptions) {
            return (
              <InlineChatButtons 
                key={index} 
                options={message.buttonOptions} 
                onSelect={handleOptionSelect} 
              />
            );
          }
          if (message.isImage && message.imageUrl) {
            return <ChatImage key={index} imageUrl={message.imageUrl} caption={message.imageCaption} />;
          }
          return <ChatMessage key={index} text={message.text} />;
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && <TypingIndicator />}
        </AnimatePresence>

        <div ref={chatEndRef} />
      </div>

      {/* Chat input - only functional for name */}
      <ChatInput 
        onSubmit={handleNameSubmit}
        placeholder={waitingForInput ? "Digite seu nome..." : "Selecione uma opção acima"}
        disabled={!waitingForInput}
      />
    </div>
  );
};

export default Index;
