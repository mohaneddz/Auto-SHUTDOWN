import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from "@tauri-apps/api/core";

interface ShutdownPromptProps {
  onCancel: () => void;
}

const ShutdownPrompt: React.FC<ShutdownPromptProps> = ({ onCancel }) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-trigger shutdown if no response within 5 seconds.
          invoke('shutdown_system');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleYes = () => {
    invoke('shutdown_system');
  };

  const handleNo = () => {
    onCancel();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white p-6 rounded-lg shadow-lg text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <h2 className="text-xl font-bold mb-4">Shutdown Confirmation</h2>
          <p className="mb-4">
            Your PC will shut down in {countdown} second{countdown !== 1 && 's'} unless canceled.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleYes}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Yes, Shutdown
            </button>
            <button
              onClick={handleNo}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              No, Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShutdownPrompt;
