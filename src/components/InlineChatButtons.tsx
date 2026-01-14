import { motion } from "framer-motion";

interface InlineChatButtonsProps {
  options: string[];
  onSelect: (option: string) => void;
}

const InlineChatButtons = ({ options, onSelect }: InlineChatButtonsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="px-[10px] mb-[6px]"
    >
      <div className="flex flex-wrap gap-[8px] max-w-[85%]">
        {options.map((option, index) => (
          <motion.button
            key={option}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15, delay: index * 0.05 }}
            onClick={() => onSelect(option)}
            className="border text-[14px] font-medium px-[16px] py-[8px] rounded-full transition-all active:scale-95"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#00a884",
              color: "#00a884",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#00a884";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.color = "#00a884";
            }}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default InlineChatButtons;
