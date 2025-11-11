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
      description: 'Ask model to show its reasoning process',
      color: 'amber',
      systemPrompt: 'You are a helpful AI assistant. Show your thinking process step by step.',
      transform: (p, ctx) => {
        const base = ctx ? `Context: ${ctx}\n\nTask: ${p}` : p;
        return `${base}\n\nLet's think through this step by step:`;
      }
    },
    fewshot: {
      name: 'Few-Shot Learning',
      icon: Zap,
      description: 'Provide examples before the actual task',
      color: 'green',
      systemPrompt: 'You are a helpful AI assistant. Follow the pattern shown in the examples.',
      transform: (p, ctx) => {
        const contextPart = ctx ? `\n\nContext for your task: ${ctx}` : '';
        return `Here are some examples:\n\nExample 1: Input: "analyze user feedback"\nOutput: Categorized into: Bugs (2), Feature Requests (3), Praise (1)\n\nExample 2: Input: "summarize quarterly report"\nOutput: Key metrics, Highlights, Action items in bullet format${contextPart}\n\nNow, for the following:\n${p}`;
      }
    },
    persona: {
      name: 'Persona Pattern',
      icon: Sparkles,
      description: 'Give the AI a specific role/expertise',
      color: 'pink',
      systemPrompt: 'You are an experienced product manager with 15 years at top tech companies. You ground your responses in specific details when context is provided, and clearly indicate when you need more information.',
      transform: (p, ctx) => {
        const contextPart = ctx ? `\n\nProduct/Company Context:\n${ctx}\n\n` : '\n\n';
        return `As a senior product manager,${contextPart}${p.toLowerCase()}`;
      }
    }
  };

  const togglePattern = (patternId) => {
    setSelectedPatterns(prev => 
      prev.includes(patternId) 
        ? prev.filter(id => id !== patternId)
        : [...prev, patternId]
    );
  };

  const runPattern = async (patternId) => {
    if (!prompt.trim()) return;
    
    setLoading(prev => ({ ...prev, [patternId]: true }));
    
    try {
      const pattern = patterns[patternId];
      const transformedPrompt = pattern.transform(prompt, context);
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: pattern.systemPrompt,
          messages: [
            { role: 'user', content: transformedPrompt }
          ]
        })
      });

      const data = await response.json();
      const text = data.content?.map(item => item.text || '').join('\n') || 'No response';
      
      setResults(prev => ({
        ...prev,
        [patternId]: {
          output: text,
          timestamp: new Date().toLocaleTimeString(),
          usedContext: !!context
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [patternId]: {
          output: `Error: ${error.message}`,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [patternId]: false }));
    }
  };

  const runAllSelected = async () => {
    for (const patternId of selectedPatterns) {
      await runPattern(patternId);
    }
  };

  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50',
    purple: 'border-purple-500 bg-purple-50',
    amber: 'border-amber-500 bg-amber-50',
    green: 'border-green-500 bg-green-50',
    pink: 'border-pink-500 bg-pink-50'
  };

  const selectedColorClasses = {
    blue: 'border-blue-500 bg-blue-100',
    purple: 'border-purple-500 bg-purple-100',
    amber: 'border-amber-500 bg-amber-100',
    green: 'border-green-500 bg-green-100',
    pink: 'border-pink-500 bg-pink-100'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-violet-600" />
            <h1 className="text-4xl font-bold text-slate-800">AI Feature Playground</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Experiment with different AI prompt patterns and see how they affect outputs
          </p>
        </div>

        {/* Context Alert */}
        {!context && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">💡 Pro Tip: Add Context</h3>
                <p className="text-sm text-amber-800">
                  Without context, AI will make up plausible-sounding details. Try adding your product/company info below to see more accurate, relevant responses. This is a key AI PM concept!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Context (Optional but Recommended)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Example: 'We're launching TaskFlow, a B2B project management tool for remote teams. Key features: real-time collaboration, AI-powered task prioritization, integrates with Slack and Google Workspace. Main competitors: Asana, Monday.com.'"
              className="w-full h-24 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Add details about your product, company, or situation. Compare results with and without context!
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Your Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here... (e.g., 'Write a product launch email' or 'Create a competitive positioning statement')"
              className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={runAllSelected}
              disabled={!prompt.trim() || selectedPatterns.length === 0}
              className="px-6 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Run Selected Patterns ({selectedPatterns.length})
            </button>
            {context && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                ✓ Using context in prompts
              </span>
            )}
          </div>
        </div>

        {/* Pattern Selection */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Select Patterns to Compare</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(patterns).map(([id, pattern]) => {
              const Icon = pattern.icon;
              const isSelected = selectedPatterns.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => togglePattern(id)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    isSelected 
                      ? selectedColorClasses[pattern.color] + ' ring-2 ring-offset-2 ring-violet-500' 
                      : colorClasses[pattern.color] + ' hover:shadow-md'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2 mx-auto" />
                  <div className="font-semibold text-sm mb-1">{pattern.name}</div>
                  <div className="text-xs text-slate-600">{pattern.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Grid */}
        {selectedPatterns.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedPatterns.map(patternId => {
              const pattern = patterns[patternId];
              const Icon = pattern.icon;
              const result = results[patternId];
              const isLoading = loading[patternId];

              return (
                <div
                  key={patternId}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className={`p-4 border-l-4 ${colorClasses[pattern.color]}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <h3 className="font-bold text-slate-800">{pattern.name}</h3>
                      </div>
                      {result && (
                        <div className="flex items-center gap-2">
                          {result.usedContext && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              With Context
                            </span>
                          )}
                          <span className="text-xs text-slate-500">{result.timestamp}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{pattern.description}</p>
                  </div>
                  
                  <div className="p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                      </div>
                    ) : result ? (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">
                          {result.output}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        Run this pattern to see results
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Educational Footer */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-slate-800 mb-3">💡 Key AI PM Concepts Demonstrated</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="border-l-4 border-violet-500 pl-4">
              <strong className="text-slate-800">Context is Critical</strong>
              <p className="mt-1 text-slate-600">Without specific context, AI will "hallucinate" plausible details. This is why RAG (Retrieval Augmented Generation) matters in production systems.</p>
            </div>
            <div className="border-l-4 border-violet-500 pl-4">
              <strong className="text-slate-800">Prompt Engineering Impact</strong>
              <p className="mt-1 text-slate-600">Different techniques produce vastly different outputs. PMs need to understand which patterns work best for specific use cases.</p>
            </div>
            <div className="border-l-4 border-violet-500 pl-4">
              <strong className="text-slate-800">Evaluation is Key</strong>
              <p className="mt-1 text-slate-600">Side-by-side comparison shows why AI PMs need systematic evaluation frameworks. What looks good at first glance may not be most accurate.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
