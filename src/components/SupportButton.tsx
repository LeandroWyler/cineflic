import { motion } from "framer-motion";
import { Headphones } from "lucide-react";

interface SupportButtonProps {
  url: string;
}

const SupportButton = ({ url }: SupportButtonProps) => {
  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex justify-start px-3 mb-1"
    >
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
        className="font-semibold text-base py-3 px-6 rounded-xl shadow-md flex items-center gap-2 transition-colors"
        style={{
          backgroundColor: "#25d366",
          color: "white",
        }}
      >
        <Headphones className="w-5 h-5" />
        <span>🎧 Ir para o Suporte</span>
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
          />
        </svg>
      </motion.button>
    </motion.div>
  );
};

export default SupportButton;
