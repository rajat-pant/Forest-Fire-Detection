# Forest Fire Detection System using YOLOv10s

A real-time forest fire detection web application built with React and Flask, using the YOLOv10s model trained on a Roboflow dataset.
The system detects fire in images and live camera feeds, highlights affected areas with bounding boxes and confidence scores, and plays an alarm sound when fire is detected.

## Tech Stack

- **Frontend**: React (Vite), HTML, CSS
- **Backend**: Flask, Python, OpenCV
- **Model**: YOLOv10s (trained using Roboflow)
- **Others**: Detection History (JSON-based)

## Features

-  Real-time fire detection in uploaded images and live video stream  
-  Displays bounding boxes and confidence scores (87% model accuracy)  
-  Alarm sound triggered on detection  
-  Detection history with timestamps (stored in JSON)  
-  Clean and responsive UI with navigation: Home, About, Detect, Live Camera

##  Project Structure
forest-fire-detection/
│
├── forest-fire-backend/
│ ├── main.py # Flask backend serving predictions
│ ├── best.pt # Trained YOLOv10s weights
│ ├── requirements.txt # Python dependencies
│ ├── history/
│ │ └── detections.json # Detection history log
│ ├── predicted/ # Output predictions (images / metadata)
│ ├── results/ # Result artifacts
│ ├── runs/ # YOLO/Ultralytics run outputs
│ ├── uploads/ # Uploaded input images / video
│ └── venv/ # (Optional) Python virtual environment
│
├── forest-fire-frontend/
│ ├── public/ # Static assets
│ ├── src/ # React source code
│ ├── index.html # Entry HTML
│ ├── vite.config.js # Vite config
│ ├── package.json # Frontend dependencies & scripts
│ ├── package-lock.json
│ ├── eslint.config.js
│ ├── model.ipynb # Notebook (e.g., related analysis or demo)
│ └── README.md # Frontend-specific readme if any
│
├── .gitignore

**Model: YOLOv10s
Dataset Source: Roboflow
Accuracy: ~87%**

## Future Improvements
**1.Drone integration for wider area monitoring**
**2.Persistent/cloud storage for history**
**3.Dashboard for aggregated alerts**
