import React, { useState } from 'react';
import { Sparkles, Loader2, Code, FileText, Lightbulb, Zap, AlertCircle } from 'lucide-react';

export default function AIPlayground() {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedPatterns, setSelectedPatterns] = useState(['basic', 'structured']);
  const [showVariability, setShowVariability] = useState(false);
  const [runCount, setRunCount] = useState(1);

  const patterns = {
    basic: {
      name: 'Basic Prompt',
      icon: FileText,
      description: 'Direct prompt without any special techniques',
      color: 'blue',
      systemPrompt: 'You are a helpful AI assistant.',
      transform: (p, ctx) => ctx ? `Context: ${ctx}\n\nTask: ${p}` : p
    },
    structured: {
      name: 'Structured Output',
      icon: Code,
      description: 'Request specific format (JSON, lists, etc.)',
      color: 'purple',
      systemPrompt: 'You are a helpful AI assistant. Provide responses in clear, structured formats.',
      transform: (p, ctx) => {
        const base = ctx ? `Context: ${ctx}\n\nTask: ${p}` : p;
        return `${base}\n\nProvide your response in a clear, structured format with headers and bullet points.`;
      }
    },
    cot: {
      name: 'Chain of Thought',
      icon: Lightbulb,
      description: 'Ask model to show its reasoning pro
