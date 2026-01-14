import { motion } from "framer-motion";
import { useMemo } from "react";

interface UserMessageProps {
  text: string;
}

const UserMessage = ({ text }: UserMessageProps) => {
  const currentTime = useMemo(() => 
    new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }), 
  []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="flex justify-end px-[10px] mb-[2px]"
    >
      <div
        className="relative max-w-[80%] rounded-[7.5px] rounded-tr-none pl-[9px] pr-[7px] pt-[6px] pb-[8px]"
        style={{
          backgroundColor: "#d9fdd3",
          boxShadow: "0 1px 0.5px rgba(11, 20, 26, 0.13)",
        }}
      >
        {/* WhatsApp-style tail - pointing right */}
        <svg 
          className="absolute -right-[8px] top-0"
          width="8" 
          height="13" 
          viewBox="0 0 8 13"
        >
          <path 
            fill="#d9fdd3" 
            d="M6.467 3.568L0 12.193V1h5.188C6.958 1 7.526 2.156 6.467 3.568z"
          />
        </svg>
        
        <p className="text-[#111b21] text-[14.2px] leading-[19px] break-words whitespace-pre-wrap">
          {text}
        </p>
        
        <div className="flex items-center justify-end gap-[3px] -mb-[4px] mt-[3px]">
          <span className="text-[11px] text-[#667781] leading-[15px]">
            {currentTime}
          </span>
          {/* Double check marks - WhatsApp blue */}
          <svg 
            className="w-[16px] h-[11px]" 
            viewBox="0 0 16 11" 
            fill="none"
          >
            <path 
              d="M11.071 0.653a0.457 0.457 0 0 0-0.304-0.102 0.493 0.493 0 0 0-0.381 0.178l-6.19 7.636-2.405-2.272a0.463 0.463 0 0 0-0.336-0.142 0.481 0.481 0 0 0-0.347 0.142l-0.633 0.622a0.477 0.477 0 0 0-0.14 0.347c0 0.133 0.047 0.246 0.14 0.34l3.467 3.395c0.094 0.093 0.2 0.14 0.32 0.14 0.146 0 0.273-0.066 0.38-0.197l6.588-8.126a0.545 0.545 0 0 0 0.134-0.32 0.46 0.46 0 0 0-0.138-0.34l-0.156-0.3z" 
              fill="#53bdeb"
            />
            <path 
              d="M15.071 0.653a0.457 0.457 0 0 0-0.304-0.102 0.493 0.493 0 0 0-0.381 0.178l-6.19 7.636-1.2-1.136a0.463 0.463 0 0 0-0.336-0.142 0.481 0.481 0 0 0-0.347 0.142l-0.633 0.622a0.477 0.477 0 0 0-0.14 0.347c0 0.133 0.047 0.246 0.14 0.34l2.262 2.215c0.094 0.093 0.2 0.14 0.32 0.14 0.146 0 0.273-0.066 0.38-0.197l6.588-8.126a0.545 0.545 0 0 0 0.134-0.32 0.46 0.46 0 0 0-0.138-0.34l-0.156-0.3z" 
              fill="#53bdeb"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default UserMessage;
