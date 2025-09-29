import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({ content, className = "" }) => {
  if (!content) return null;

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom styling for different markdown elements with dark theme
          h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 text-slate-100" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 text-slate-200" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-bold mb-1 text-slate-300" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-sm font-bold mb-1 text-slate-400" {...props} />,
          p: ({node, ...props}) => <p className="mb-2 text-slate-300" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1 text-slate-300" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1 text-slate-300" {...props} />,
          li: ({node, ...props}) => <li className="text-slate-300" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-slate-100" {...props} />,
          em: ({node, ...props}) => <em className="italic text-slate-200" {...props} />,
          code: ({node, inline, ...props}) => 
            inline ? (
              <code className="bg-slate-700/50 px-1 py-0.5 rounded text-sm font-mono text-cyber-400 border border-slate-600" {...props} />
            ) : (
              <code className="block bg-slate-800/90 p-2 rounded text-sm font-mono overflow-x-auto text-cyber-400 border border-slate-600" {...props} />
            ),
          pre: ({node, ...props}) => <pre className="bg-slate-800/90 p-2 rounded text-sm font-mono overflow-x-auto mb-2 border border-slate-600" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-cyber-500 pl-4 italic text-slate-400 mb-2" {...props} />,
          a: ({node, ...props}) => <a className="text-cyber-400 hover:text-cyber-300 underline" {...props} />,
          table: ({node, ...props}) => <table className="min-w-full border border-slate-600 mb-2 bg-slate-800/50" {...props} />,
          th: ({node, ...props}) => <th className="border border-slate-600 px-2 py-1 bg-slate-700 text-slate-200 font-bold" {...props} />,
          td: ({node, ...props}) => <td className="border border-slate-600 px-2 py-1 text-slate-300" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;