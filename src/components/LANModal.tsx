import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const isMobileDevice = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const [showLanGuide, setShowLanGuide] = useState(!isMobileDevice);

  // Sync latest stored keys whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setProvider(getStoredAiProvider());
      setDeepSeekKey(getStoredDeepSeekKey());
      setGeminiKey(getStoredGeminiKey());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProviderChange = (p: AiProvider) => {
    setProvider(p);
    setStoredAiProvider(p);
  };

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
    >
      <div className="bg-zinc-900 border-2 border-red-500/80 rounded-2xl max-w-sm w-full max-h-[calc(100dvh-24px)] overflow-y-auto p-4 sm:p-5 shadow-2xl relative text-zinc-100 space-y-3.5 my-auto flex flex-col min-w-0">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-2 text-red-400 pr-8">
          <Smartphone className="w-5 h-5 flex-shrink-0" />
          <h3 className="font-tech font-bold text-base sm:text-lg text-white truncate">
            {isMobileDevice ? '图鉴 AI 与连接设置' : '手机连接与 AI 设置'}
          </h3>
        </div>

        {/* 1. Primary Section: AI Vision Engine Selection & Keys */}
        <div className="bg-gradient-to-r from-blue-950/50 via-purple-950/50 to-indigo-950/50 p-3 rounded-xl border border-blue-700/60 space-y-2.5 min-w-0">
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
                使用 DeepSeek 官方多模态模型（国内直连秒级响应，支持真实毛绒玩具高精度识别）：
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

        {/* 2. Secondary Section: Mobile / LAN Wi-Fi Connection Guide */}
        <div className="space-y-2">
          {isMobileDevice && (
            <button
              type="button"
              onClick={() => setShowLanGuide(!showLanGuide)}
              className="text-[11px] font-tech text-zinc-400 hover:text-zinc-200 flex items-center justify-between w-full px-1 py-0.5"
            >
              <span>📶 查看局域网连接 / 网址信息</span>
              <span>{showLanGuide ? '收起 ▲' : '展开 ▼'}</span>
            </button>
          )}

          {showLanGuide && (
            <div className="space-y-2 text-xs font-tech text-zinc-300 min-w-0">
              <div className="flex items-start space-x-2.5 bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-700 min-w-0">
                <Wifi className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-[11px]">第 1 步：连上同一 Wi-Fi</p>
                  <p className="text-zinc-400 text-[10px] mt-0.5">确保手机与电脑连接在同一无线网络。</p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-700 min-w-0">
                <Share2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-[11px]">第 2 步：手机打开链接</p>
                  <div className="mt-1.5 flex items-center justify-between bg-black/70 px-2.5 py-1.5 rounded-lg border border-zinc-600 min-w-0 gap-2">
                    <code className="text-amber-300 font-mono text-[11px] select-all break-all min-w-0 flex-1">
                      {currentUrl}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="p-1 text-zinc-300 hover:text-white transition flex-shrink-0"
                      title="复制链接"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 bg-zinc-800/80 p-2.5 rounded-xl border border-zinc-700 min-w-0">
                <Smartphone className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-[11px]">第 3 步：全屏掌机体验（推荐）</p>
                  <p className="text-zinc-400 text-[10px] mt-0.5">
                    在 Safari 菜单选择<span className="text-yellow-300 font-bold">【添加到主屏幕】</span>即成全屏掌机！
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-500 font-tech font-bold text-white py-2 rounded-xl transition active:scale-95 shadow-lg text-xs sm:text-sm flex-shrink-0 cursor-pointer"
        >
          保存并开始体验
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};
