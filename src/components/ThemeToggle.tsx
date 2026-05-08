import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { motion } from 'motion/react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-app-text" />
      ) : (
        <Sun className="w-5 h-5 text-white" />
      )}
    </motion.button>
  );
}
