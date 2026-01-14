import { useState } from "react";
import { Send, Smile } from "lucide-react";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Common greetings and support requests to detect
const INVALID_NAME_PATTERNS = [
  /^(oi|olá|ola|hey|hi|hello|bom dia|boa tarde|boa noite|e aí|eai|salve|fala)\b/i,
  /^(quero|preciso|falar|atendente|suporte|ajuda|humano|pessoa|alguem|alguém)\b/i,
  /^(sim|não|nao|ok|tá|ta|blz|beleza|pode|claro)\b/i,
];

const isValidName = (text: string): boolean => {
  const trimmed = text.trim();
  
  // Must be at least 2 characters
  if (trimmed.length < 2) return false;
  
  // Must not match greeting/support patterns
  for (const pattern of INVALID_NAME_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }
  
  // Should contain mostly letters (allow spaces for full names)
  const letterCount = (trimmed.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  if (letterCount < 2) return false;
  
  return true;
};

const ChatInput = ({ onSubmit, placeholder = "Digite uma mensagem...", disabled = false }: ChatInputProps) => {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    const trimmed = text.trim();
    
    if (!trimmed) return;
    
    if (!isValidName(trimmed)) {
      setError("Por favor, digite seu nome 😊");
      return;
    }
    
    setError(null);
    onSubmit(trimmed);
    setText("");
  };

  return (
    <div 
      className="px-[10px] py-[5px]"
      style={{ backgroundColor: "#f0f2f5" }}
    >
      {error && (
        <div className="mb-2 mx-1 px-4 py-2 bg-[#fee2e2] text-[#dc2626] text-[13px] rounded-lg text-center">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-[8px]">
        {/* Emoji button placeholder */}
        <button 
          type="button" 
          className="w-[24px] h-[24px] flex items-center justify-center text-[#54656f] hover:text-[#3b4a54] transition-colors"
          disabled={disabled}
        >
          <Smile className="w-[24px] h-[24px]" />
        </button>
        
        {/* Input field */}
        <div 
          className="flex-1 rounded-[8px] px-[12px] py-[9px]"
          style={{ backgroundColor: "#ffffff" }}
        >
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-transparent text-[#111b21] text-[15px] outline-none placeholder:text-[#667781] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        {/* Send button */}
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all disabled:opacity-40"
          style={{ 
            backgroundColor: text.trim() && !disabled ? "#00a884" : "#8696a0",
          }}
        >
          <Send className="w-[20px] h-[20px] text-white" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
