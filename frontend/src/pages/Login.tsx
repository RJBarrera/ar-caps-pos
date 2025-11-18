import React, { useState } from "react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "arcaps" && password === "123456") {
      onLogin();
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="relative bg-gray-900 rounded-3xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center border border-gray-700">
        
        {/* Logo con efecto glow */}
        <div className="mb-6 flex items-center justify-center">
          <img
            src="/img/logo-arcaps.png"
            alt="AR Caps Logo"
            className="h-20 w-auto object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.7)]"
          />
        </div>

        <h1 className="text-3xl font-extrabold text-white text-center mb-6 tracking-tight">
          🔐 Iniciar Sesión
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4 animate-shake">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            placeholder="Usuario"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-md w-full"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-md w-full"
            required
          />

          <button
            type="submit"
            className="py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:scale-105 transform transition-all shadow-lg mt-2"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400 text-center">
          © 2025 AR Caps. Todos los derechos reservados.
        </p>
      </div>

      <style>
        {`
          @keyframes shake {
            0% { transform: translateX(0); }
            20% { transform: translateX(-5px); }
            40% { transform: translateX(5px); }
            60% { transform: translateX(-5px); }
            80% { transform: translateX(5px); }
            100% { transform: translateX(0); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}
      </style>
    </div>
  );
}
