import { motion, AnimatePresence } from 'framer-motion';

interface SurprisePortalProps {
  isOpen: boolean;
  videoUrl: string | null;
  onClose: () => void;
}

export function SurprisePortal({ isOpen, videoUrl, onClose }: SurprisePortalProps) {
  return (
    <AnimatePresence>
      {isOpen && videoUrl && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur"
          data-testid="surprise-portal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-black rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] w-11/12 max-w-3xl aspect-video"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <iframe
              src={videoUrl}
              title="Holiday Surprise"
              className="w-full h-full"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
