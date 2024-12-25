






import React, { useState } from "react";

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [scenes, setScenes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE_URL = " https://3ee4-34-105-119-208.ngrok-free.app"; // Backend API
  const HUGGINGFACE_API_URL =
    "https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image"; // Hugging Face API
  const API_KEY = "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"; // Hugging Face API key

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setScenes([]);

    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch data.");
      }

      const data = await response.json();
      const updatedScenes = data.scenes || [];
      setScenes(updatedScenes);

      // Generate images sequentially for each scene
      for (let i = 0; i < updatedScenes.length; i++) {
        const scene = updatedScenes[i];
        const imageUrl = await generateImage(scene.scene);
        setScenes((prevScenes) => {
          const updatedScenes = [...prevScenes];
          updatedScenes[i] = { ...updatedScenes[i], image_url: imageUrl };
          return updatedScenes;
        });
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async (sceneText) => {
    try {
      const response = await fetch(HUGGINGFACE_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: sceneText }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const imageData = await response.blob();
      return URL.createObjectURL(imageData);
    } catch (error) {
      console.error(error);
      return "/path-to-placeholder-image.jpg"; // Fallback image
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 1,
          backgroundImage: "url('/path-to-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "2rem",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        ></div>
        <div style={{ position: "relative", zIndex: 2, color: "#fff", textAlign: "center" }}>
          <h1 className="fw-bold">Kathavachak</h1>
          <p className="lead">Unleash your imagination through stories</p>
          {isLoading && <h3>Loading...</h3>}
          {error && <h3 className="text-danger">{error}</h3>}
          <div style={{ overflowY: "auto", maxHeight: "70vh", margin: "1rem 0" }}>
            {scenes.map((scene, index) => (
              <div key={index} className="card mb-3" style={{ width: "100%" }}>
                <div className="card-body">
                  <h5 className="card-title">Scene {index + 1}</h5>
                  <p className="card-text">{scene.scene}</p>
                  {scene.image_url ? (
                    <img
                      src={scene.image_url}
                      alt={`Scene ${index + 1}`}
                      className="card-img-top"
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                  ) : (
                    <p>Generating image...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {!isLoading && !error && scenes.length === 0 && (
            <p>No scenes generated yet. Enter a prompt to start!</p>
          )}
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        style={{
          position: "sticky",
          bottom: 0,
          background: "#fff",
          boxShadow: "0 -2px 5px rgba(0,0,0,0.1)",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="Enter your story prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          style={{
            flex: 1,
            maxWidth: "600px",
            marginRight: "1rem",
            padding: "0.5rem",
            fontSize: "1rem",
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default App;







