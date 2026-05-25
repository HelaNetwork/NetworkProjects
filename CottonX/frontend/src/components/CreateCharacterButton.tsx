'use client'
import { pixelify_sans } from '@/app/fonts';
import { Button } from "@/components/ui/button";
import { useCharacterSelect } from '@/contexts/CharacterSelectContext';

function CreateCharacterButton() {
    const { setIsOpen } = useCharacterSelect();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
    };

    return (
        <Button
            onClick={handleClick}
            variant="default"
            className={`${pixelify_sans.className} relative z-50 transition-colors hover:bg-primary/90`}
        >
            Create Character
        </Button>
    );
}

export default CreateCharacterButton; 