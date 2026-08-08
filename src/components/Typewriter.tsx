/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

interface TypewriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenWords?: number;
}

export default function Typewriter({
  words,
  typingSpeed = 100,
  deletingSpeed = 60,
  delayBetweenWords = 2000
}: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentFullText = words[currentWordIndex];

    const handleType = () => {
      if (!isDeleting) {
        // Typing characters
        const nextText = currentFullText.substring(0, currentText.length + 1);
        setCurrentText(nextText);

        if (nextText === currentFullText) {
          // Pause at the end of the word before starting to delete
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, delayBetweenWords);
          return;
        }

        timer = setTimeout(handleType, typingSpeed);
      } else {
        // Deleting characters
        const nextText = currentFullText.substring(0, currentText.length - 1);
        setCurrentText(nextText);

        if (nextText === '') {
          setIsDeleting(false);
          // Move to the next word
          setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
          timer = setTimeout(handleType, 300); // Small pause before typing next word
          return;
        }

        timer = setTimeout(handleType, deletingSpeed);
      }
    };

    timer = setTimeout(handleType, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, delayBetweenWords]);

  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="bg-gradient-to-r from-[#0B2545] to-[#134074] dark:from-[#3A86C8] dark:to-[#4895EF] bg-clip-text text-transparent">
        {currentText}
      </span>
      <span className="absolute -right-1 top-0 h-full w-[2px] bg-[#134074] dark:bg-[#4895EF] animate-[blink_1s_infinite]" />
      
      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
