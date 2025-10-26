import React, { useState, useEffect } from "react";
import { FaGithub } from "react-icons/fa";
import Loader from "./components/Loader";
import Query from "./components/Query";
import Response from "./components/Response";

const loadingMessages = [
  "Warming up the local brain 🧠",
  "Fetching the repo from GitHub... 🚀",
  "Unpacking the code treasures 🗃️",
  "LLM is reading every line carefully 📖",
  "Summoning the AI wisdom... ✨",
  "Cross-referencing files for accuracy 🔍",
  "Analyzing repo structure... 🏗️",
  "Compiling insights... 🔧",
  "Almost there! Aligning neurons ⚡",
  "Finishing touches and polishing the answer 🎨",
  "Preparing your answer with extra clarity 📝",
  "Patience, the AI is thinking deeply... 🤔",
  "Initializing local environment... 🖥️",
  "Syncing branches and commits 🌿",
  "Parsing functions and dependencies 🔩",
  "Extracting logic from spaghetti 🍝",
  "Checking for missing semicolons 😬",
  "Decoding developer thoughts 💭",
  "Peeking inside nested loops 🌀",
  "Collecting context from README 🧾",
  "Examining import statements 📦",
  "Letting the LLM stretch its neurons 🧘‍♂️",
  "Looking for the main character: index.js 🎯",
  "Inspecting suspicious TODOs 👀",
  "Sweeping through modules like a detective 🕵️‍♂️",
  "Buffering a few extra IQ points 🤓",
  "Waiting for git pull to finish... still waiting... ⏳",
  "Skimming commit history for gossip 🗞️",
  "De-minifying minified files 😵‍💫",
  "Sanitizing variable names 🧼",
  "Running code through mental linters ✅",
  "Building dependency graph 🕸️",
  "Assembling context puzzle pieces 🧩",
  "Untangling async functions ⏱️",
  "Converting caffeine to computation ☕",
  "Refactoring in its mind... just because 🧠",
  "Verifying logic against the README promises 📚",
  "Resolving merge conflicts of existence 🧨",
  "Loading too much code... regretting life choices 😅",
  "Sniffing out hidden bugs 🐛",
  "Thinking in binary, dreaming in JSON 💭",
  "Hashing thoughts for version control 🪄",
  "Re-indexing its memory cache 🧮",
  "Reconfirming with the local LLM overlord 🤖",
  "Spinning up a few more neurons for safety 🧬",
  "Counting closing brackets for peace of mind 🧩",
  "Chasing missing dependencies 🐾",
  "One more check... because AI paranoia 😐",
  "Almost done! Packaging insights 🎁",
  "Finalizing the masterpiece... 🪶",
  "CodeLens is ready to respond 💡",
];

function App() {
  const [healthData, setHealthData] = useState(null);
  const [cacheData, setCacheData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [query, setQuery] = useState("");
  const [showRepoWarning, setShowRepoWarning] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [lastAIStats, setLastAIStats] = useState(null);

  const handleCleanCache = async () => {
    if (!window.confirm("Are you sure you want to clear all cached repos?"))
      return;

    try {
      const res = await fetch("http://localhost:5000/api/cache", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Cache cleared successfully ✅");
        // Refresh cache stats
        const cacheResponse = await fetch(
          "http://localhost:5000/api/cache/stats/"
        );
        const cache = await cacheResponse.json();
        setCacheData(cache);
      } else {
        alert(`Failed to clear cache: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error clearing cache:", err);
      alert("Network error while clearing cache ❌");
    }
  };

  useEffect(() => {
    // Load chat history from sessionStorage
    const savedChats = sessionStorage.getItem("chatHistory");
    if (savedChats) {
      setChatHistory(JSON.parse(savedChats));
    }

    let isMounted = true;

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchData = async (showLoader = false) => {
      try {
        if (showLoader) setLoading(true);

        const startTime = Date.now();
        const minLoadTime = 7000;

        const healthResponse = await fetch("http://localhost:5000/api/health/");
        const health = await healthResponse.json();
        const cacheResponse = await fetch(
          "http://localhost:5000/api/cache/stats/"
        );
        const cache = await cacheResponse.json();

        if (showLoader) {
          const elapsed = Date.now() - startTime;
          if (elapsed < minLoadTime) {
            await sleep(minLoadTime - elapsed);
          }
        }

        if (isMounted) {
          setHealthData(health);
          setCacheData(cache);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError("Failed to fetch data from API");
        console.error("Error fetching data:", err);
      } finally {
        if (showLoader && isMounted) setLoading(false);
      }
    };

    fetchData(true);

    const interval = setInterval(() => fetchData(false), 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Loading message rotation effect
  useEffect(() => {
    if (isQuerying) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isQuerying]);

  // Save chat history to sessionStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const bytesToMB = (bytes) => (bytes / (1024 * 1024)).toFixed(2);

  const handleSendQuery = async () => {
    const trimmedRepo = repoUrl.trim();
    const trimmedQuery = query.trim();

    // Check if repo is empty
    if (!trimmedRepo) {
      setShowRepoWarning(true);
      return;
    }

    // Check if query is empty
    if (!trimmedQuery) {
      return;
    }

    setShowRepoWarning(false);

    // Add query to chat history immediately
    const newChat = {
      query: trimmedQuery,
      response: null,
      error: null,
      isLoading: true,
    };

    setChatHistory((prev) => [...prev, newChat]);
    setQuery("");
    setIsQuerying(true);
    setLoadingMessageIndex(0);

    try {
      const response = await fetch("http://localhost:5000/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl: trimmedRepo,
          query: trimmedQuery,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the last chat entry with the response
        setChatHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            query: trimmedQuery,
            response: data.response,
            error: null,
            isLoading: false,
          };
          return updated;
        });

        // Update AI stats
        if (data.metadata) {
          setLastAIStats(data.metadata);
        }
      } else {
        // Handle error response
        setChatHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            query: trimmedQuery,
            response: null,
            error: data.error || "Failed to get response from API",
            isLoading: false,
          };
          return updated;
        });
      }
    } catch (err) {
      // Handle network error
      setChatHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          query: trimmedQuery,
          response: null,
          error: "Network error: Failed to connect to API",
          isLoading: false,
        };
        return updated;
      });
      console.error("Error sending query:", err);
    } finally {
      setIsQuerying(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Loader />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="topbar">
        <FaGithub className="icon" size={26} />
        <p>repo:</p>
        <input
          type="text"
          placeholder="enter the github repo link"
          id="input-repo"
          value={repoUrl}
          onChange={(e) => {
            setRepoUrl(e.target.value);
            if (showRepoWarning && e.target.value.trim()) {
              setShowRepoWarning(false);
            }
          }}
        />
        {showRepoWarning && (
          <p className="repo-missing">
            Share the repo before I start guessing!
          </p>
        )}
      </div>

      <div className="main-section">
        <div className="left-panel">
          {error ? (
            <p style={{ color: "red" }}>Error: {error}</p>
          ) : (
            <>
              <p>
                Status: <span>{healthData?.status || "unknown"}</span>
              </p>
              <p>
                MCP server:{" "}
                <span>{healthData?.services?.api || "offline"}</span>
              </p>
              <p>
                ollama: <span>{healthData?.services?.ollama || "offline"}</span>
              </p>
              <p>
                ollama model:{" "}
                <span>
                  {healthData?.services?.details?.ollama?.models?.[0]?.name ||
                    "N/A"}
                </span>
              </p>
              <p>
                github:{" "}
                <span>
                  {healthData?.services?.github || "not authenticated"}
                </span>
              </p>
              <p>
                user:{" "}
                <span>
                  {healthData?.services?.details?.github?.user || "N/A"}
                </span>
              </p>
              <p>
                Cached Repos: <span>{cacheData?.cache?.totalRepos || 0}</span>{" "}
                shallow cloned
              </p>
              <p>
                totalSize:{" "}
                <span>
                  {cacheData?.cache?.totalSize
                    ? bytesToMB(cacheData.cache.totalSize)
                    : 0}{" "}
                  MB
                </span>
              </p>
              <div className="clean-btn" onClick={handleCleanCache}>
                Clean Cache
              </div>
            </>
          )}

          {/* AI stat section */}
          <div className="Ai-response-data">
            <h3>Last AI Reply Stats</h3>
            <p>
              filesAnalyzed: <span>{lastAIStats?.filesAnalyzed || 0}</span>
            </p>
            <p>
              totalFiles: <span>{lastAIStats?.totalFiles || 0}</span>
            </p>
            <p>
              tokensUsed: <span>{lastAIStats?.tokensUsed || 0}</span>
            </p>
            <p>
              repository: <span>{lastAIStats?.repository || "N/A"}</span>
            </p>
          </div>
        </div>
        <div className="chat-panel">
          <div className="chat-messages">
            {chatHistory.map((chat, index) => (
              <React.Fragment key={index}>
                <Query value={chat.query} />
                {chat.isLoading ? (
                  <div className="msg-container">
                    <div className="response loading-response">
                      <p className="loading-message">
                        {loadingMessages[loadingMessageIndex]}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Response
                    error={chat.error || ""}
                    resmsg={chat.response || ""}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="chat-input">
            <textarea
              type="text"
              placeholder="Type your message..."
              id="chat-input-field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={1500}
              required
            />
            <button
              id="send-button"
              onClick={handleSendQuery}
              disabled={isQuerying}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
