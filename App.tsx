
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Wallet, Plus, Trash2, PieChart, TrendingUp, Activity, 
  AlertTriangle, Save, RefreshCw, Eye, EyeOff, Download, 
  Upload, Landmark, ArrowRightLeft, FileText, Database, 
  ShieldAlert, CheckCircle2, Info, ChevronRight, Calculator,
  Zap, Settings, BarChart3, Lock
} from 'lucide-react';
import { Asset, AssetType, FinanceData } from './types';
import { analyzeFinanceData } from './services/geminiService';

// --- 工具函數 ---
const fmt = (num: number, digits = 1) => Number(num.toFixed(digits)).toLocaleString();

// --- 擴展 Window 類型 ---
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    readonly aistudio: AIStudio;
  }
}

// --- 子組件: 專業數值卡片 ---
const StatBox = ({ icon: Icon, label, value, suffix, color, trend }: any) => (
  <div className="bg-slate-900/50 backdrop-blur-md p-6 rounded-[2rem] border border-slate-800 hover:border-blue-500/50 transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-[0.03