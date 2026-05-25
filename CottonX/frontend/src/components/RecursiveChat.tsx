"use client"

import React from 'react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings2, Plus, Trash2, RotateCcw } from "lucide-react"

import { pixelify_sans } from '@/app/fonts';

export const LLM_PROVIDERS = [
    { id: 'gemini', name: 'Google (Gemini)' },
    { id: 'featherless', name: 'Featherless (DeepSeek)' },
    { id: 'groq', name: 'Groq (Llama/Mixtral)' }
];

export const MODELS_BY_PROVIDER: Record<string, { id: string, name: string }[]> = {
    gemini: [
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
        { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' }
    ],
    featherless: [
        { id: 'deepseek-ai/DeepSeek-V3-0324', name: 'DeepSeek V3' },
        { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3 (Auto)' }
    ],
    groq: [
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Instant)' },
        { id: 'llama3-8b-8192', name: 'Llama 3 8B (Fast)' }
    ]
};

interface RecursiveChatProps {
    chatMode: 'STANDARD' | 'RECURSIVE';
    setChatMode: (mode: 'STANDARD' | 'RECURSIVE') => void;
    llmProvider: string;
    setLlmProvider: (provider: string) => void;
    llmModelId: string;
    setLlmModelId: (model: string) => void;
    modelsByProvider: Record<string, { id: string, name: string }[]>;
    setModelsByProvider: (models: Record<string, { id: string, name: string }[]>) => void;
}

export default function RecursiveChat({
    chatMode,
    setChatMode,
    llmProvider,
    setLlmProvider,
    llmModelId,
    setLlmModelId,
    modelsByProvider,
    setModelsByProvider
}: RecursiveChatProps) {

    const [isManageOpen, setIsManageOpen] = React.useState(false);
    const [newModelId, setNewModelId] = React.useState('');
    const [newModelName, setNewModelName] = React.useState('');

    const handleProviderChange = (newProvider: string) => {
        setLlmProvider(newProvider);
        const firstModel = modelsByProvider[newProvider]?.[0]?.id;
        if (firstModel) setLlmModelId(firstModel);
    };

    const handleAddModel = () => {
        if (!newModelId || !newModelName) return;
        const currentModels = modelsByProvider[llmProvider] || [];
        const updatedModels = [...currentModels, { id: newModelId, name: newModelName }];
        setModelsByProvider({ ...modelsByProvider, [llmProvider]: updatedModels });
        setNewModelId('');
        setNewModelName('');
    };

    const handleDeleteModel = (id: string) => {
        const updatedModels = (modelsByProvider[llmProvider] || []).filter(m => m.id !== id);
        setModelsByProvider({ ...modelsByProvider, [llmProvider]: updatedModels });
        // If we deleted the current model, pick another one
        if (llmModelId === id && updatedModels.length > 0) {
            setLlmModelId(updatedModels[0].id);
        }
    };

    const handleReset = () => {
        if (confirm('Reset all models to defaults?')) {
            setModelsByProvider(MODELS_BY_PROVIDER);
        }
    };

    return (
        <Card className={`${pixelify_sans.className} w-full border-gray-200 shadow-sm bg-card/80 backdrop-blur-sm rounded-lg`}>
            <CardHeader className="py-2.5 px-3 flex flex-row items-center justify-between space-y-0 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-blue-100">
                        <Settings2 className="h-3 w-3 text-blue-900" />
                    </div>
                    <CardTitle className="text-sm font-bold tracking-tight uppercase text-blue-900">Brain Settings</CardTitle>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={chatMode} onValueChange={setChatMode}>
                        <SelectTrigger
                            className="w-[85px] h-7 text-[10px] font-medium bg-transparent border-solid border-navy-600/20 text-blue-900 hover:bg-gray-50 transition-colors"
                        >
                            <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent className={pixelify_sans.className}>
                            <SelectItem value="STANDARD" className="text-[10px]">Standard</SelectItem>
                            <SelectItem value="RECURSIVE" className="text-[10px]">Recursive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-blue-50">
                                <Plus className="h-4 w-4 text-blue-900" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className={`${pixelify_sans.className} sm:max-w-[425px]`}>
                            <DialogHeader>
                                <DialogTitle className="text-xl text-blue-900 font-bold">Manage Models</DialogTitle>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-500 uppercase">
                                        {llmProvider} Models
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                        <RotateCcw className="h-3 w-3" />
                                        Reset to Defaults
                                    </Button>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                    {(modelsByProvider[llmProvider] || []).map((m) => (
                                        <div key={m.id} className="flex items-center justify-between gap-2 p-2 rounded-md border border-gray-100 bg-gray-50/50">
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-sm font-medium truncate text-blue-900">{m.name}</span>
                                                <span className="text-[10px] text-gray-400 truncate font-mono">{m.id}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                onClick={() => handleDeleteModel(m.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                    {(!modelsByProvider[llmProvider] || modelsByProvider[llmProvider].length === 0) && (
                                        <p className="text-center text-sm text-gray-400 py-4">No models added.</p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100 space-y-3">
                                    <h4 className="text-sm font-bold text-blue-900">Add Custom Model</h4>
                                    <div className="grid gap-2">
                                        <Input
                                            placeholder="Model Name"
                                            value={newModelName}
                                            onChange={(e) => setNewModelName(e.target.value)}
                                            className="h-9 truncate border-gray-200 focus:ring-blue-500"
                                        />
                                        <Input
                                            placeholder="Model ID"
                                            value={newModelId}
                                            onChange={(e) => setNewModelId(e.target.value)}
                                            className="h-9 font-mono text-xs border-gray-200 focus:ring-blue-500"
                                        />
                                        <Button onClick={handleAddModel} disabled={!newModelId || !newModelName} className="w-full h-9 bg-blue-900 hover:bg-blue-800 text-white gap-2 font-bold">
                                            <Plus className="h-4 w-4" />
                                            Add Model
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-blue-900/60 ml-0.5 tracking-wider">Engine</label>
                        <Select value={llmProvider} onValueChange={handleProviderChange}>
                            <SelectTrigger className="w-full h-8 text-[11px] bg-white/50 border-solid border-navy-600/20 text-blue-900 hover:bg-white transition-colors">
                                <SelectValue placeholder="Engine" />
                            </SelectTrigger>
                            <SelectContent className={pixelify_sans.className}>
                                {LLM_PROVIDERS.map(p => (
                                    <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-blue-900/60 ml-0.5 tracking-wider">Model</label>
                        <Select value={llmModelId} onValueChange={setLlmModelId}>
                            <SelectTrigger className="w-full h-8 text-[11px] bg-white/50 border-solid border-navy-600/20 text-blue-900 hover:bg-white transition-colors">
                                <SelectValue placeholder="Model" />
                            </SelectTrigger>
                            <SelectContent className={pixelify_sans.className}>
                                {(modelsByProvider[llmProvider] || []).map(m => (
                                    <SelectItem key={m.id} value={m.id} className="text-xs">{m.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
