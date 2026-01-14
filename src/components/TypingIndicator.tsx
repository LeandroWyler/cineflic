import { motion } from "framer-motion";

const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="flex justify-start px-[10px] mb-[2px]"
    >
      <div
        className="relative bg-card rounded-[7.5px] rounded-tl-none px-[12px] py-[10px]"
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
        
        <div className="flex gap-[5px] items-center h-[19px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-[8px] h-[8px] bg-[#8696a0] rounded-full"
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.85, 1, 0.85],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
