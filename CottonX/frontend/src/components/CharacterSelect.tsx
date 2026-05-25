'use client'

import { pixelify_sans } from '@/app/fonts'
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from "@/components/ui/skeleton"
import { useCharacterSelect } from '@/contexts/CharacterSelectContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import SkillSelect from './SkillSelect'

type Category = {
    character: number;
    skills: string[];
    model: string;
    prompt: string;
}

// Define character presets
const CHARACTER_PRESETS = [
    {
        id: 0,
        name: 'Rishi',
        skills: ['cdp', 'zora', 'ens'],
        prompt: 'I am Rishi, a blockchain expert specializing in DeFi protocols and NFT marketplaces.'
    },
    {
        id: 1,
        name: 'Harper',
        skills: ['uniswap', 'base', 'scroll'],
        prompt: 'I am Harper, focusing on Layer 2 solutions and DEX implementations.'
    },
    {
        id: 2,
        name: 'Eric',
        skills: ['tradingview'],
        prompt: 'I am Eric, a technical analyst with expertise in market trends and trading strategies.'
    },
    {
        id: 3,
        name: 'Yasmin',
        skills: ['twitter', 'grok'],
        prompt: 'I am Yasmin, an AI and social media specialist tracking Web3 trends.'
    }
]

function StyleSelector({
    title,
    current,
    onPrevious,
    onNext,
    isLoading = false
}: {
    title: string;
    current: number;
    onPrevious: () => void;
    onNext: () => void;
    isLoading?: boolean;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className={`${pixelify_sans.className} text-blue-900 font-bold text-lg`}>{title}</span>
                <div className="flex items-center gap-4 text-black">
                    <button
                        onClick={onPrevious}
                        className="p-2 hover:bg-gray-100 rounded-full text-black"
                        disabled={isLoading}
                    >
                        <ChevronLeft />
                    </button>
                    <span className="text-black">{current + 1}/{CHARACTER_PRESETS.length}</span>
                    <button
                        onClick={onNext}
                        className="p-2 hover:bg-gray-100 rounded-full text-black"
                        disabled={isLoading}
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>
            <div className="relative w-full h-[200px] bg-gray-100 rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <Skeleton className="w-32 h-32 rounded-lg" />
                    </div>
                ) : (
                    <div
                        className="absolute top-0 left-0 w-[400%] h-full flex transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${current * 25}%)` }}
                    >
                        {CHARACTER_PRESETS.map((char) => (
                            <div key={char.id} className="w-1/4 h-full flex flex-col items-center justify-center bg-gray-200">
                                <div className="relative w-32 h-32">
                                    <Image
                                        src={`/${char.name.toLowerCase()}_sprite.png`}
                                        alt={char.name}
                                        fill
                                        className="object-contain"
                                        priority
                                    />
                                </div>
                                <span className={`${pixelify_sans.className} mt-2 text-lg text-blue-900 font-bold`}>
                                    {char.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function CharacterSelect() {
    const { isOpen, setIsOpen } = useCharacterSelect()
    const [selected, setSelected] = useState<Category>({
        character: 0,
        skills: CHARACTER_PRESETS[0].skills,
        model: 'claude-3.5-sonnet',
        prompt: CHARACTER_PRESETS[0].prompt
    })
    const [isLoading, setIsLoading] = useState(false)

    // Simulate loading when character changes
    const handleCharacterChange = async (newCharacterIndex: number) => {
        setIsLoading(true)
        setSelected(prev => ({
            ...prev,
            character: newCharacterIndex,
            prompt: CHARACTER_PRESETS[newCharacterIndex].prompt
        }))

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))

        setSelected(prev => ({
            ...prev,
            skills: CHARACTER_PRESETS[newCharacterIndex].skills
        }))
        setIsLoading(false)
    }

    const handlePrevious = () => {
        const newIndex = selected.character === 0 ?
            CHARACTER_PRESETS.length - 1 :
            selected.character - 1
        handleCharacterChange(newIndex)
    }

    const handleNext = () => {
        const newIndex = selected.character === CHARACTER_PRESETS.length - 1 ?
            0 :
            selected.character + 1
        handleCharacterChange(newIndex)
    }

    const handleSkillsChange = (skills: string[]) => {
        setSelected(prev => ({ ...prev, skills }))
    }

    const handleModelChange = (model: string) => {
        setSelected(prev => ({ ...prev, model }))
    }

    const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelected(prev => ({ ...prev, prompt: event.target.value }))
    }

    const handleCreate = () => {
        console.log('Creating character with:', selected)
        setIsOpen(false)
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="left" className="w-[400px] sm:w-[540px] overflow-y-auto bg-card [&>button]:text-black">
                <SheetHeader>
                    <SheetTitle className={`${pixelify_sans.className} text-blue-900`}>
                        Create Your Character
                    </SheetTitle>
                    <p className="text-sm text-black">
                        Select your character and customize their attributes.
                    </p>
                </SheetHeader>

                <div className="space-y-8 py-6">
                    <StyleSelector
                        title="Character Selection"
                        current={selected.character}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        isLoading={isLoading}
                    />

                    {/* Model Selection */}
                    <div>
                        <span className={`${pixelify_sans.className} text-blue-900 font-bold text-lg block mb-2`}>
                            Model
                        </span>
                        <Select value={selected.model} onValueChange={handleModelChange}>
                            <SelectTrigger className="text-black">
                                <SelectValue placeholder="Select a model" className="text-black" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="claude-3.5-sonnet" className="text-black">Claude 3.5 Sonnet</SelectItem>
                                <SelectItem value="gpt-4" className="text-black">GPT-4</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Character Prompt */}
                    <div>
                        <span className={`${pixelify_sans.className} text-blue-900 font-bold text-lg block mb-2`}>
                            Character Prompt
                        </span>
                        <Input
                            value={selected.prompt}
                            onChange={handlePromptChange}
                            placeholder="Enter character prompt"
                            className="w-full text-black placeholder:text-gray-500"
                        />
                    </div>

                    {/* Skills Selection */}
                    <div>
                        <span className={`${pixelify_sans.className} text-blue-900 font-bold text-lg block mb-2`}>
                            Skills
                        </span>
                        <p className="text-sm text-black mb-4">
                            These are {CHARACTER_PRESETS[selected.character].name}&apos;s specialized skills
                        </p>
                        {isLoading ? (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-24" />
                                    <Skeleton className="h-8 w-24" />
                                    <Skeleton className="h-8 w-24" />
                                </div>
                                <Skeleton className="h-[100px] w-full" />
                            </div>
                        ) : (
                            <SkillSelect
                                onSkillsChange={handleSkillsChange}
                                initialSkills={selected.skills}
                            />
                        )}
                    </div>
                </div>

                <SheetFooter>
                    <button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                        onClick={handleCreate}
                        disabled={isLoading}
                    >
                        Select Character
                    </button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default CharacterSelect