
import React from 'react';
import { StickyNote, Edit3 } from 'lucide-react';

interface NotesSectionProps {
  notes: string;
  setNotes: (val: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, setNotes }) => {
  return (
    <div className="bg-white rounded-[1.2rem] sm:rounded-[2.5rem] border border-rose-100 shadow-xl overflow-hidden mt-8">
      <div className="p-4 sm:p-8 border-b border-rose-50 bg-rose-50/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500 p-2 rounded-xl shadow-lg shadow-rose-100">
              <StickyNote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-black text-slate-900 uppercase tracking-tight">戰略備註與備忘錄</h3>
              <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strategic Notes & Insights</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-rose-400 no-print">
            <Edit3 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">點擊下方區域開始撰寫</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 sm:p-8">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="在此記錄您的投資戰略、調整心得或未來佈局計畫..."
          className="w-full min-h-[300px] sm:min-h-[400px] bg-rose-50/20 border border-rose-100 rounded-[1.5rem] p-6 sm:p-8 text-sm sm:text-base font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all resize-y leading-relaxed"
        />
      </div>
      
      <div className="px-8 pb-8 flex justify-end no-print">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
          內容將自動隨資料同步儲存於本地端
        </p>
      </div>
    </div>
  );
};

export default NotesSection;
