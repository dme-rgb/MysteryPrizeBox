import { useState } from 'react';
import MysteryBox from '../MysteryBox';

export default function MysteryBoxExample() {
  const [isOpening, setIsOpening] = useState(false);
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = () => {
    console.log('Opening mystery box...');
    setIsOpening(true);
    setTimeout(() => {
      setIsOpening(false);
      setIsOpened(true);
      console.log('Box opened!');
    }, 800);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <MysteryBox onOpen={handleOpen} isOpening={isOpening} isOpened={isOpened} />
    </div>
  );
}
