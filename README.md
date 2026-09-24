# Wisdom Vault — 100 Famous Quotes Explorer

A modern, responsive web application built with **Python Flask**, **Vanilla JavaScript**, **HTML5**, and **CSS3** that displays random quotes from a curated dataset of 100 well-known quotes, with real-time search by author, filtering by category, and one-click clipboard copying.

![Wisdom Vault](https://img.shields.io/badge/Status-Completed-success)
![Python](https://img.shields.io/badge/Python-3.13-blue)
![Flask](https://img.shields.io/badge/Flask-3.1-black)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES6-yellow)

---

## ✨ Features

- **🎲 Random Quote of the Moment**: Spotlight card featuring dynamic quote rendering, author attribution, and category pill.
- **🔍 Real-Time Search**: Substring search across author names and quote keywords with instant debouncing.
- **🏷️ Category Filtering**: Filter quotes across 10 categories (*Inspiration*, *Philosophy*, *Science*, *Leadership*, *Wisdom*, *Creativity*, *Literature*, *Humor*, *Courage*, *Life*).
- **⭐ Spotlight Any Quote**: Pin any quote card directly into the spotlight view.
- **📋 One-Click Copy**: Copy formatted quote text directly to clipboard with visual toast confirmation.
- **🎨 Zero External JS Dependencies**: Built purely with plain Vanilla JavaScript (DOM manipulation and modern Fetch API).
- **🧪 Automated Tests**: Full test suite covering dataset integrity and all REST API endpoints.

---

## 📁 Project Structure

```
quote_app/
├── .gitignore
├── app.py                  # Flask backend server & REST API
├── quotes.json             # Curated dataset of 100 quotes
├── README.md               # Documentation
├── requirements.txt        # Flask dependencies
├── test_app.py             # Automated unit tests (11 test cases)
├── templates/
│   └── index.html          # Semantic HTML5 layout
└── static/
    ├── css/
    │   └── style.css       # Responsive dark-slate styling & typography
    └── js/
        └── app.js          # Plain vanilla JavaScript application
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Git

### 2. Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Higgs32584/Higgs32584-famous-quotes.git
   cd Higgs32584-famous-quotes
   ```

2. **Create a virtual environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask server**:
   ```bash
   python app.py
   ```

5. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

---

## 🧪 Running Tests

Run the automated unit test suite:

```bash
python -m unittest test_app.py
```

All 11 tests verify:
- Exact count and non-empty schema of the 100 quotes.
- HTML rendering of the main route.
- API endpoints (`/api/quotes`, `/api/quotes/random`, `/api/quotes/search`, `/api/categories`, `/api/authors`).
- Substring filtering by author, exact filtering by category, and query matching.

---

## 📜 License

MIT License. Free to use and modify.
