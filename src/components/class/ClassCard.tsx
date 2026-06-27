import { Users, BookOpen, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Class } from '@/types';

interface ClassCardProps {
  cls: Class;
  onClick?: () => void;
  showCode?: boolean;
}

export default function ClassCard({ cls, onClick, showCode = true }: ClassCardProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cls.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border bg-white p-4 sm:p-5 hover:shadow-md hover:border-emerald-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-emerald-50 text-emerald-700`}>
          <BookOpen className="h-5 w-5" />
        </div>
        {showCode && (
          <div className="flex items-center gap-1.5 bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full text-xs font-mono font-medium">
            {cls.code}
            <button
              onClick={copyCode}
              className="hover:text-sky-900 transition-colors"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-foreground mb-1">{cls.name}</h3>
      <p className="text-sm text-muted-foreground mb-3">{cls.teacherName}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {cls.students.length} students
        </span>
        <span>{cls.term}</span>
      </div>
    </button>
  );
}
