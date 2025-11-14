import React, { useState } from "react";
import Header from "./components/Header";
import Summarizer from "./components/Summarizer";
// import ImageGenerator from './components/ImageGenerator'; // Removed
import Chatbot from "./components/Chatbot";

type ActiveTool = "summarizer" | "chatbot"; // Removed 'imageGenerator'

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>("summarizer");

  const renderTool = () => {
    switch (activeTool) {
      case "summarizer":
        return <Summarizer />;
      // case 'imageGenerator': // Removed
      //   return <ImageGenerator />;
      case "chatbot":
        return <Chatbot />;
      default:
        return <Summarizer />;
    }
  };

  return (
    // bg-transparent allows the canvas background to show through
    <div className="min-h-screen bg-transparent text-slate-200">
      <div className="container mx-auto p-4 max-w-5xl">
        <header className="text-center my-8 md:my-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
            AI SUMMARIZER
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Summarize Documents and Chat with AI
          </p>
        </header>

        <Header activeTool={activeTool} setActiveTool={setActiveTool} />

        <main className="mt-8">{renderTool()}</main>
      </div>
    </div>
  );
};

export default App;
