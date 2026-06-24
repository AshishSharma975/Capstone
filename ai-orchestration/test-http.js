import axios from "axios";

try {
  console.log("Sending POST request via k8s ingress...");
  const response = await axios.post("http://localhost/api/ai/invoke", {
    message: "change src/App.jsx and show Hello Ashish"
  }, {
    timeout: 360000 // 6 min timeout
  });
  console.log("Success:", JSON.stringify(response.data, null, 2));
} catch (error) {
  if (error.response) {
    console.error("HTTP Error:", error.response.status, JSON.stringify(error.response.data));
  } else {
    console.error("Error:", error.message);
  }
}
