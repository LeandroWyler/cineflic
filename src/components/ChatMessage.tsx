import { motion } from "framer-motion";
import { useMemo } from "react";

interface ChatMessageProps {
  text: string;
  isLink?: boolean;
  linkUrl?: string;
}

const ChatMessage = ({ text, isLink = false, linkUrl }: ChatMessageProps) => {
  const currentTime = useMemo(() => 
    new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }), 
  []);

  // Parse text for line breaks
  const formattedText = text.split("\n").map((line, index) => (
    <span key={index}>
      {line}
      {index < text.split("\n").length - 1 && <br />}
    </span>
  ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="flex justify-start px-[10px] mb-[2px]"
    >
      <div
        className="relative max-w-[80%] bg-card rounded-[7.5px] rounded-tl-none pl-[9px] pr-[7px] pt-[6px] pb-[8px]"
        style={{
          boxShadow: "0 1px 0.5px rgba(11, 20, 26, 0.13)",
        }}
      >
        {/* WhatsApp-style tail - pointing left */}
        <svg 
          className="absolute -left-[8px] top-0 text-card"
          width="8" 
          height="13" 
          viewBox="0 0 8 13"
        >
          <path 
            fill="currentColor" 
            d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"
          />
        </svg>
        
        {isLink && linkUrl ? (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#027eb5] underline text-[14.2px] leading-[19px] break-words"
          >
            {formattedText}
          </a>
        ) : (
          <p className="text-[#111b21] text-[14.2px] leading-[19px] break-words whitespace-pre-wrap">
            {formattedText}
          </p>
        )}
        
        <span className="text-[11px] text-[#667781] float-right ml-[4px] -mb-[4px] mt-[3px] leading-[15px]">
          {currentTime}
        </span>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
