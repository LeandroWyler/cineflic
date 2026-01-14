import { motion } from "framer-motion";
import { useMemo, useState } from "react";

interface ChatImageProps {
  imageUrl: string;
  caption?: string;
}

const ChatImage = ({ imageUrl, caption }: ChatImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
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
      className="flex justify-start px-[10px] mb-[2px]"
    >
      <div
        className="relative max-w-[75%] bg-card rounded-[7.5px] rounded-tl-none overflow-hidden"
        style={{
          boxShadow: "0 1px 0.5px rgba(11, 20, 26, 0.13)",
        }}
      >
        {/* WhatsApp-style tail - pointing left */}
        <svg 
          className="absolute -left-[8px] top-0 text-card z-10"
          width="8" 
          height="13" 
          viewBox="0 0 8 13"
        >
          <path 
            fill="currentColor" 
            d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"
          />
        </svg>
        
        {/* Image container */}
        <div className="p-[3px]">
          {!imageLoaded && (
            <div className="w-full aspect-video bg-[#e9edef] animate-pulse rounded-[4px] flex items-center justify-center min-h-[150px]">
              <svg className="w-10 h-10 text-[#8696a0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <img
            src={imageUrl}
            alt="Luna TV"
            className={`w-full rounded-[4px] ${imageLoaded ? 'block' : 'hidden'}`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        
        {/* Caption and time */}
        <div className="px-[9px] pb-[8px] pt-[4px]">
          {caption && (
            <p className="text-[#111b21] text-[14.2px] leading-[19px] break-words whitespace-pre-wrap mb-1">
              {caption}
            </p>
          )}
          <span className="text-[11px] text-[#667781] float-right leading-[15px]">
            {currentTime}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatImage;
