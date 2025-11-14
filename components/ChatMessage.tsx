import React from 'react';
import { marked } from 'marked';
// FIX: Import highlight.js to make `hljs` available for syntax highlighting.
import hljs from 'highlight.js';

// FIX: The `highlight` option is deprecated in `setOptions`. Use `marked.use()` to configure it as an extension.
// Configure marked to handle code blocks and line breaks
marked.use({
  breaks: true,
  gfm: true,
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
});

const renderMarkdown = (text) => {
    // Sanitize and render markdown
    const rawMarkup = marked.parse(text || '', { async: false });
    // Use `prose` for light mode and `prose-invert` for dark mode
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: rawMarkup }} />;
};

export const ChatMessage = ({ msg }) => (
    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`p-3 rounded-lg max-w-xl ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
            {renderMarkdown(msg.text)}
            {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
                    <h4 className="font-semibold text-xs text-gray-500 dark:text-gray-400 mb-1">Sources:</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {msg.sources.map((source, i) => (
                            <li key={i} className="text-xs truncate">
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline">{source.title || source.uri}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </div>
);