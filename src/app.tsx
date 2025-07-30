import { useState } from "react";
import ChatMessages from "./chat";



export default function Chat() {

  const [sessionId, setSessionId] = useState(Math.random() > 0.5 ? "1" : "2");


  return (<div className="h-[100vh] w-full p-4 flex justify-center items-center bg-fixed overflow-hidden">
    <div className="flex items-center gap-2">
      <label htmlFor="sessionId" className="text-sm text-neutral-600 dark:text-neutral-400">
        Session ID:
      </label>
      <input
        id="sessionId"
        type="text"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
        placeholder="Enter session ID"
        className="px-2 py-1 text-xs border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 min-w-0 w-24"
      />
    </div>
    <ChatMessages key={sessionId} sessionId={sessionId} />
  </div>)

}

