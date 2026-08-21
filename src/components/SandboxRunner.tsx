import React, { useEffect, useRef } from 'react';
import type { ConsoleLog } from '../types/app';

interface SandboxRunnerProps {
  html: string;
  css: string;
  js: string;
  theme?: 'dark' | 'light';
  autoRun?: boolean;
  onConsoleLog?: (log: ConsoleLog) => void;
  onClearConsole?: () => void;
  height?: string;
  title?: string;
}

export const SandboxRunner: React.FC<SandboxRunnerProps> = ({
  html,
  css,
  js,
  theme = 'dark',
  onConsoleLog,
  onClearConsole,
  height = '100%',
  title = 'DifiNest App Sandbox'
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // PostMessage listener to intercept console logs from inside the iframe sandbox
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'difinest-sandbox-console') {
        const { type, message, timestamp } = event.data;
        if (onConsoleLog) {
          onConsoleLog({
            id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
            type: type || 'log',
            message: typeof message === 'object' ? JSON.stringify(message, null, 2) : String(message),
            timestamp: timestamp || new Date().toLocaleTimeString()
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleLog]);

  const updateIframeContent = () => {
    if (!iframeRef.current) return;
    if (onClearConsole) onClearConsole();

    const consoleScript = `
      (function() {
        function sendLog(type, args) {
          try {
            var msg = Array.from(args).map(function(arg) {
              if (typeof arg === 'object') {
                try { return JSON.stringify(arg); } catch(e) { return String(arg); }
              }
              return String(arg);
            }).join(' ');
            
            window.parent.postMessage({
              source: 'difinest-sandbox-console',
              type: type,
              message: msg,
              timestamp: new Date().toLocaleTimeString()
            }, '*');
          } catch (err) {}
        }

        var origLog = console.log;
        var origWarn = console.warn;
        var origError = console.error;
        var origInfo = console.info;

        console.log = function() { sendLog('log', arguments); origLog.apply(console, arguments); };
        console.warn = function() { sendLog('warn', arguments); origWarn.apply(console, arguments); };
        console.error = function() { sendLog('error', arguments); origError.apply(console, arguments); };
        console.info = function() { sendLog('info', arguments); origInfo.apply(console, arguments); };

        window.onerror = function(msg, url, line, col, error) {
          sendLog('error', ['Uncaught Error: ' + msg + ' (Line ' + line + ')']);
          return false;
        };
      })();
    `;

    const isLight = theme === 'light';
    const defaultBg = isLight ? '#ffffff' : '#000000';
    const defaultColor = isLight ? '#0f172a' : '#f8fafc';

    const fullDoc = `<!DOCTYPE html>
<html lang="en" class="${isLight ? 'light' : 'dark'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    /* Default resets inside sandbox respecting theme */
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: ${defaultBg};
      color: ${defaultColor};
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    ${css}
  </style>
  <script>${consoleScript}</script>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch(err) {
      console.error('Runtime JS Error: ' + err.message);
    }
  </script>
</body>
</html>`;

    const blob = new Blob([fullDoc], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    iframeRef.current.src = blobUrl;
  };

  useEffect(() => {
    updateIframeContent();
  }, [html, css, js, theme]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
      style={{
        width: '100%',
        height,
        border: 'none',
        borderRadius: 'inherit',
        backgroundColor: theme === 'light' ? '#ffffff' : '#000000'
      }}
    />
  );
};
