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
          // Custom styling for different markdown elements
          h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-bold mb-1" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-sm font-bold mb-1" {...props} />,
          p: ({node, ...props}) => <p className="mb-2 text-gray-700" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
          li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
          em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
          code: ({node, inline, ...props}) => 
            inline ? (
              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block bg-gray-100 p-2 rounded text-sm font-mono overflow-x-auto" {...props} />
            ),
          pre: ({node, ...props}) => <pre className="bg-gray-100 p-2 rounded text-sm font-mono overflow-x-auto mb-2" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-2" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
          table: ({node, ...props}) => <table className="min-w-full border border-gray-300 mb-2" {...props} />,
          th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100 font-bold" {...props} />,
          td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 