from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from ultralytics import YOLO
import os
import uuid
import cv2
import json
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
RESULT_FOLDER = "results"
HISTORY_FOLDER = "history"
HISTORY_FILE = os.path.join(HISTORY_FOLDER, "detections.json")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)
os.makedirs(HISTORY_FOLDER, exist_ok=True)

model = YOLO("best.pt")

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    return []

def save_to_history(filename, predictions):
    history = load_history()
    history_entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "image": f"http://localhost:5000/results/{filename}",
        "prediction": predictions,
    }
    history.insert(0, history_entry)
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        results = model.predict(source=filepath, imgsz=640, conf=0.5)
        result = results[0]

        predictions = []

        if result.boxes is not None and len(result.boxes) > 0:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                predictions.append({
                    "class": result.names[cls_id],
                    "confidence": round(confidence * 100, 1),
                    "bbox": [x1, y1, x2, y2]
                })
        else:
            predictions.append({
                "class": "No fire detected",
                "confidence": 100
            })

        # Save annotated image (highlighted or original)
        annotated_frame = result.plot()
        result_filename = f"{uuid.uuid4().hex}_result.jpg"
        result_path = os.path.join(RESULT_FOLDER, result_filename)
        cv2.imwrite(result_path, annotated_frame)

        save_to_history(result_filename, predictions)

        return jsonify({
            "prediction": predictions,
            "result_image": f"http://localhost:5000/results/{result_filename}"
        })

    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@app.route('/history', methods=['GET'])
def get_history():
    return jsonify(load_history())

@app.route('/results/<filename>')
def serve_image(filename):
    return send_file(os.path.join(RESULT_FOLDER, filename), mimetype='image/jpeg')

# 🔴 LIVE CAMERA DETECTION ROUTE
@app.route('/live_feed')
def live_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

def generate_frames():
    cap = cv2.VideoCapture(0)
    while True:
        success, frame = cap.read()
        if not success:
            break

        results = model.predict(source=frame, imgsz=640, conf=0.5)
        result = results[0]

        if result.boxes is not None:
            for box in result.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                label = f"{result.names[cls_id]} {confidence*100:.1f}%"

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX,
                            0.6, (0, 255, 255), 2)

        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

if __name__ == "__main__":
    app.run(debug=True)