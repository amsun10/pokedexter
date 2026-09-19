import React, { useState } from 'react';
import { Smartphone, X, Copy, Check, Wifi, Share2 } from 'lucide-react';
import {
  getStoredGeminiKey,
  setStoredGeminiKey,
  getStoredDeepSeekKey,
  setStoredDeepSeekKey,
  getStoredAiProvider,
  setStoredAiProvider,
  type AiProvider
} from '../services/detector';

interface LANModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LANModal: React.FC<LANModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [provider, setProvider] = useState<AiProvider>(getStoredAiProvider());
  const [deepSeekKey, setDeepSeekKey] = useState(getStoredDeepSeekKey());
  const [geminiKey, setGeminiKey] = useState(getStoredGeminiKey());

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProviderChange = (p: AiProvider) => {
    setProvider(p);
    setStoredAiProvider(p);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-red-500/80 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative text-zinc-100 space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-2.5 text-red-400">
          <Smartphone className="w-6 h-6" />
          <h3 className="font-tech font-bold text-lg text-white">手机/平板连接指南</h3>
        </div>

        {/* Step-by-step instructions */}
        <div className="space-y-3 text-xs font-tech text-zinc-300">
          <div className="flex items-start space-x-2.5 bg-zinc-800/80 p-3 rounded-xl border border-zinc-700">
            <Wifi className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">第 1 步：连上同一 Wi-Fi</p>
              <p className="text-zinc-400 text-[11px] mt-0.5">确保手机/iPad与这台电脑连接在同一个家庭无线网络。</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 bg-zinc-800/80 p-3 rounded-xl border border-zinc-700">
            <Share2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="w-full">
              <p className="font-bold text-white">第 2 步：手机浏览器打开链接</p>
              <p className="text-zinc-400 text-[11px] mt-0.5">在手机 Safari 或 Chrome 浏览器输入：</p>
              
              <div className="mt-2 flex items-center justify-between bg-black/70 px-2.5 py-1.5 rounded-lg border border-zinc-600">
                <code className="text-amber-300 font-mono text-xs select-all truncate">{currentUrl}</code>
                <button
                  onClick={handleCopy}
                  className="ml-2 p-1 text-zinc-300 hover:text-white transition flex-shrink-0"
                  title="复制链接"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 bg-zinc-800/80 p-3 rounded-xl border border-zinc-700">
            <Smartphone className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">第 3 步：全屏掌机体验（推荐）</p>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                在手机浏览器菜单中选择<span className="text-yellow-300 font-bold">【添加到主屏幕】</span>，即可去掉浏览器网址栏，变成全屏掌机图鉴！
              </p>
            </div>
          </div>

          {/* AI Vision Engine Selection & Keys */}
          <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-indigo-950/40 p-3 rounded-xl border border-blue-700/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-blue-300 font-bold text-xs flex items-center">
                ✨ AI 多模态视觉引擎
              </span>
              <span className="text-[10px] text-emerald-400 font-tech">
                {provider === 'deepseek' && deepSeekKey
                  ? '已启用 DeepSeek'
                  : provider === 'gemini' && geminiKey
                  ? '已启用 Gemini'
                  : '使用本地算法'}
              </span>
            </div>

            {/* Provider Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 bg-black/60 p-1 rounded-lg border border-zinc-700">
              <button
                type="button"
                onClick={() => handleProviderChange('deepseek')}
                className={`py-1 text-xs font-tech rounded-md transition flex items-center justify-center space-x-1 ${
                  provider === 'deepseek'
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>⚡ DeepSeek</span>
                <span className="text-[9px] text-blue-200 bg-blue-900/60 px-1 rounded">国内推荐</span>
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange('gemini')}
                className={`py-1 text-xs font-tech rounded-md transition flex items-center justify-center space-x-1 ${
                  provider === 'gemini'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>✨ Gemini</span>
                <span className="text-[9px] text-purple-200 bg-purple-900/60 px-1 rounded">海外/代理</span>
              </button>
            </div>

            {/* Key Input per Provider */}
            {provider === 'deepseek' ? (
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-400">
                  使用 DeepSeek 官方多模态模型（支持浏览器直接调用，低延迟毫秒级响应）：
                </p>
                <input
                  type="password"
                  placeholder="粘贴 DeepSeek API Key (sk-...)"
                  value={deepSeekKey}
                  onChange={(e) => {
                    setDeepSeekKey(e.target.value);
                    setStoredDeepSeekKey(e.target.value);
                  }}
                  className="w-full bg-black/70 border border-blue-600/60 rounded-lg px-2.5 py-1.5 text-xs text-blue-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-400"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-400">
                  使用 Google Gemini 3.6 Flash 模型（海外网络直连或配合科学网络）：
                </p>
                <input
                  type="password"
                  placeholder="粘贴 Google AI Studio API Key..."
                  value={geminiKey}
                  onChange={(e) => {
                    setGeminiKey(e.target.value);
                    setStoredGeminiKey(e.target.value);
                  }}
                  className="w-full bg-black/70 border border-purple-600/60 rounded-lg px-2.5 py-1.5 text-xs text-purple-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-400"
                />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-500 font-tech font-bold text-white py-2.5 rounded-xl transition active:scale-95 shadow-lg"
        >
          知道了，开始体验！
        </button>
      </div>
    </div>
  );
};
