# Smart Fuel Station GHG Tracker 🚗⛽🌍

## Overview

This project is an AI-powered system that tracks vehicles at fuel stations, predicts their monthly carbon emissions, and generates engaging, humorous-yet-serious personalized reports to help users reduce their environmental impact.

The pipeline combines **computer vision, vehicle data enrichment, deep learning, and LLM-generated communication** to deliver sustainability insights in an easy-to-understand format.

---

## Features

* 📸 **License Plate Recognition**: Captures vehicle registration number via camera.
* 🚙 **Vehicle Data Fetching**: Retrieves fuel type, engine capacity, vehicle age, seating capacity, and PUC (Pollution Under Control) details.
* 🌦️ **Contextual Data**: Considers weather conditions, region type (urban/rural), and station metadata.
* ⛽ **Fuel Usage Tracking**: Records litres filled and visit frequency.
* 🤖 **Deep Learning Prediction**: Estimates monthly **CO₂ emissions** and **GHG impact** based on combined features.
* ✉️ **Personalized Messaging**: Uses an **LLM** to craft humorous yet informative reports with actionable recommendations, delivered directly via email.

---

## System Architecture

1. **Data Capture**

   * Vehicle reg no via camera (ALPR).
   * Fuel station logs (fuel litres, visits).
   * Contextual APIs (weather, region type).

2. **Feature Engineering**

   * Merge static (vehicle details, engine CC, fuel type, age) and dynamic data (PUC readings, weather, fuel logs).

3. **Model Training**

   * Deep learning regression model to predict monthly emissions (CO₂, GHG).
   * Training dataset: Vehicle & fuel usage datasets enriched with emissions benchmarks.

4. **Prediction & Messaging**

   * Predictions sent to LLM.
   * LLM crafts user-friendly, humorous, but serious sustainability reports.
   * Reports automatically emailed to the vehicle owner.

---

## Tech Stack

* **Backend**: Python (Flask/FastAPI)
* **Computer Vision**: OpenCV, EasyOCR/ALPR
* **Machine Learning**: TensorFlow / PyTorch, scikit-learn
* **Data Handling**: Pandas, NumPy
* **APIs**: Weather API, Vehicle API (RTO/PUC sources)
* **Messaging**: OpenAI/GPT API for crafting reports
* **Email Service**: SMTP / SendGrid / AWS SES

---

## Example Workflow

1. Car visits a fuel station.

2. Camera captures **MH12AB1234** → Fetch vehicle details (Tata Nexon, LPG, 1498cc, age 3 yrs).

3. Logs **12 litres fuel filled**, **urban region**, **humid weather**.

4. Deep learning model predicts:

   * **CO₂: 165 kg/month**
   * **GHG index: 3.2 tons/year (projected)**

5. LLM generates message:

   > "Your Nexon’s appetite this month = 165 kg CO₂ 🍔🌫️. That’s like running 100 ACs for 24 hours! Try carpooling, champ 🚗🤝."

6. Email sent to the user.

---

## Setup

### Prerequisites

* Python 3.9+
* Node.js (optional, for dashboard)
* MongoDB/Postgres (for data storage)

### Installation

```bash
git clone https://github.com/yourusername/ghg-tracker.git
cd ghg-tracker
pip install -r requirements.txt
```

### Run Backend

```bash
node server.js
```

### Train Model

```bash
python train_model.py
```

---

## Future Enhancements

* 📱 Mobile app dashboard for real-time tracking.
* 🛰️ Integration with IoT fuel meters.
* 📊 Regional emission comparison & leaderboards.
* 🌱 Gamified incentives for low emitters.

---

## License

MIT License

---

## Contributors

* **Aryan Giri**
* **Aayush Gattani**
* **Harshal Bankhele**
* **Vedant Manvelikar**
