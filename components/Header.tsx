import React from "react";
import { SummarizeIcon, ChatIcon } from "./icons/Icons"; // Removed ImageIcon

type ActiveTool = "summarizer" | "chatbot"; // Removed 'imageGenerator'

interface HeaderProps {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTool, setActiveTool }) => {
  const navItems = [
    { id: "summarizer", label: "Summarizer", icon: <SummarizeIcon /> },
    // { id: 'imageGenerator', label: 'Image Generator', icon: <ImageIcon /> }, // Removed
    { id: "chatbot", label: "Chatbot", icon: <ChatIcon /> },
  ] as const;

  return (
    <nav className="bg-slate-800/80 backdrop-blur-sm rounded-full p-2 flex justify-center space-x-2 md:space-x-4 shadow-lg max-w-sm mx-auto border border-slate-700">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTool(item.id)}
          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-full text-sm md:text-base font-semibold transition-all duration-300 w-1/2
            ${
              activeTool === item.id
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md"
                : "text-slate-300 hover:bg-slate-700"
            }
          `}
        >
          {item.icon}
          <span className="hidden sm:inline">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Header;
