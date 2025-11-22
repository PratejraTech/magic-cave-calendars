import { motion, AnimatePresence } from 'framer-motion';

interface SurprisePortalProps {
  isOpen: boolean;
  videoUrl: string | null;
  onClose: () => void;
}

// Convert YouTube URLs to embed format
function getEmbedUrl(url: string): string {
  if (!url) return '';

  // Handle different YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^"&?/\s]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
  }

  // If it's already an embed URL, just add autoplay
  if (url.includes('youtube.com/embed/')) {
    return url.includes('?') ? `${url}&autoplay=1&rel=0` : `${url}?autoplay=1&rel=0`;
  }

  // Return original URL if not recognized as YouTube
  return url;
}

export function SurprisePortal({ isOpen, videoUrl, onClose }: SurprisePortalProps) {
  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;

  return (
    <AnimatePresence>
      {isOpen && embedUrl && (
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
              src={embedUrl}
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
