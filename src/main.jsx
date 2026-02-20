import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { Buffer } from 'buffer';
import { Send, Copy, Shield, ShieldAlert, User, Zap, Activity } from 'lucide-react';
import MatrixRain from './MatrixRain';

// Critical polyfill for simple-peer
window.Buffer = Buffer;

// 1. Signaling Server
const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:3000';
const socket = io(SIGNALING_SERVER);

function App() {
  const [me, setMe] = useState('');
  const [connected, setConnected] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  
  const connectionRef = useRef();
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on('me', (id) => setMe(id));
    socket.on('callUser', (data) => {
      setCallerSignal(data.signal);
      setIdToCall(data.from);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(me);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const callUser = (id) => {
    if (!id) return;
    const peer = new Peer({ initiator: true, trickle: false, stream: false });
    
    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: me });
    });

    peer.on('connect', () => {
      setConnected(true);
    });

    peer.on('data', (data) => {
      let msg;
      if (typeof data === 'string') {
        msg = data;
      } else {
        msg = new TextDecoder().decode(data);
      }
      setChatHistory(prev => [...prev, { from: 'peer', text: msg, time: new Date() }]);
    });
    
    peer.on('error', (err) => console.error('Peer Error:', err));
    
    peer.on('close', () => {
        setConnected(false);
        setCallAccepted(false);
        setChatHistory([]); 
        window.location.reload(); // Hard reset for security
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream: false });
    
    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: idToCall });
    });

    peer.on('connect', () => {
      setConnected(true);
    });
    
    peer.on('data', (data) => {
      let msg;
      if (typeof data === 'string') {
        msg = data;
      } else {
        msg = new TextDecoder().decode(data);
      }
      setChatHistory(prev => [...prev, { from: 'peer', text: msg, time: new Date() }]);
    });
    
    peer.on('error', (err) => console.error('Peer Error:', err));
    
    peer.on('close', () => {
        setConnected(false);
        setCallAccepted(false);
        setChatHistory([]);
        window.location.reload();
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    if (!connectionRef.current) return;
    
    try {
        connectionRef.current.send(message);
        setChatHistory(prev => [...prev, { from: 'me', text: message, time: new Date() }]);
        setMessage('');
    } catch (err) {
        console.error("Send Error:", err);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#050505] text-gray-200 font-sans overflow-hidden selection:bg-cyan-900 selection:text-cyan-100">
      
      {/* Matrix Rain Background */}
      <MatrixRain />
      
      {/* Vignette Overlay for focus */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col h-full md:h-[90vh] md:my-auto md:border md:border-gray-800/50 md:rounded-2xl md:shadow-2xl md:backdrop-blur-xl md:bg-[#0a0a0a]/80 overflow-hidden transition-all duration-500">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0a0a0a]/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${connected ? 'bg-cyan-500/10' : 'bg-red-500/10'}`}>
                {connected ? <Shield className="w-5 h-5 text-cyan-400" /> : <ShieldAlert className="w-5 h-5 text-red-400" />}
            </div>
            <div>
                <h1 className="font-bold text-lg tracking-tight text-white">GHOST<span className="text-cyan-500">NET</span></h1>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                        {connected ? 'SECURE_CHANNEL_ACTIVE' : 'WAITING_FOR_PEER'}
                    </span>
                </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-gray-600">
            <span>E2E ENCRYPTED</span>
            <span>NO LOGS</span>
            <span>EPHEMERAL</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
            
            {!connected ? (
                /* Connection Screen */
                <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-in fade-in zoom-in duration-500">
                    
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center p-4 bg-gray-900 rounded-full mb-4 border border-gray-800 shadow-xl shadow-black/50">
                            <Activity className="w-8 h-8 text-cyan-500 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Establish Uplink</h2>
                        <p className="text-gray-500 max-w-sm mx-auto">Share your ID securely. Once connected, a direct P2P tunnel is formed. No servers will see your messages.</p>
                    </div>

                    <div className="w-full max-w-md space-y-4">
                        <div className="bg-gray-900/50 p-1 rounded-lg border border-gray-800 flex items-center">
                            <div className="px-4 text-gray-500 font-mono text-sm select-none">ID</div>
                            <input 
                                readOnly 
                                value={me} 
                                className="bg-transparent flex-1 p-3 font-mono text-cyan-400 text-sm outline-none truncate" 
                            />
                            <button 
                                onClick={copyToClipboard}
                                className="p-3 hover:text-white transition text-gray-500 active:scale-95"
                            >
                                {copyFeedback ? <span className="text-green-400 text-xs font-bold">COPIED</span> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1 bg-gray-900/50 p-1 rounded-lg border border-gray-800 flex items-center focus-within:border-cyan-500/50 transition">
                                <User className="w-4 h-4 ml-4 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Paste Partner ID" 
                                    className="bg-transparent flex-1 p-3 font-mono text-white text-sm outline-none placeholder:text-gray-700"
                                    value={idToCall}
                                    onChange={(e) => setIdToCall(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={() => callUser(idToCall)}
                                disabled={!idToCall}
                                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-6 rounded-lg transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Zap className="w-4 h-4" /> CONNECT
                            </button>
                        </div>
                    </div>

                    {callerSignal && !callAccepted && (
                        <div className="absolute bottom-10 left-0 right-0 mx-auto w-max max-w-[90%]">
                            <div className="bg-gray-900 border border-cyan-500/30 p-4 rounded-xl shadow-2xl shadow-cyan-500/10 flex items-center gap-4 animate-bounce-slight">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Incoming Connection Request</h3>
                                    <p className="text-xs text-gray-400 font-mono">{idToCall ? `From: ${idToCall.slice(0,8)}...` : 'Unknown Source'}</p>
                                </div>
                                <button 
                                    onClick={answerCall}
                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold tracking-wide shadow-lg shadow-green-500/20"
                                >
                                    ACCEPT
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Chat Screen */
                <>
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                        <div className="flex justify-center py-4">
                            <div className="bg-cyan-950/30 border border-cyan-900/50 text-cyan-400 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-mono">
                                Session Encrypted • Direct P2P
                            </div>
                        </div>
                        
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`max-w-[85%] md:max-w-[70%] group`}>
                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.from === 'me' 
                                        ? 'bg-cyan-600 text-white rounded-br-none' 
                                        : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                                    }`}>
                                        {msg.text}
                                    </div>
                                    <div className={`text-[10px] text-gray-600 mt-1 font-mono flex opacity-0 group-hover:opacity-100 transition-opacity ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.time?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    <div className="p-4 bg-[#0a0a0a] border-t border-gray-800">
                        <div className="flex items-center gap-2 bg-gray-900/80 p-1.5 rounded-xl border border-gray-800 focus-within:border-gray-600 transition-colors">
                            <input 
                                type="text" 
                                className="flex-1 bg-transparent px-4 py-2 text-white outline-none placeholder:text-gray-600 text-sm"
                                placeholder="Decrypting message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                autoFocus
                            />
                            <button 
                                onClick={sendMessage}
                                disabled={!message.trim()}
                                className="p-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 text-white rounded-lg transition-all shadow-lg shadow-cyan-900/20 active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
