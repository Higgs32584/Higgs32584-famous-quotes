import json
import os
import random
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

QUOTES_FILE = os.path.join(os.path.dirname(__file__), "quotes.json")


def load_quotes():
    """Loads quotes from the quotes.json file."""
    with open(QUOTES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# Load dataset in memory at startup
QUOTES_DATA = load_quotes()


@app.route("/")
def index():
    """Serves the main single-page web interface."""
    return render_template("index.html")


@app.route("/api/quotes/random", methods=["GET"])
def get_random_quote():
    """Returns a random quote, optionally filtered by category or author."""
    author_query = request.args.get("author", "").strip().lower()
    category_query = request.args.get("category", "").strip().lower()

    pool = QUOTES_DATA

    if author_query:
        pool = [q for q in pool if author_query in q["author"].lower()]
    if category_query:
        pool = [q for q in pool if category_query == q["category"].lower()]

    if not pool:
        return jsonify({
            "error": "No quotes found matching the specified criteria."
        }), 404

    chosen = random.choice(pool)
    return jsonify(chosen)


@app.route("/api/quotes/search", methods=["GET"])
def search_quotes():
    """Searches quotes based on author, category, or general query text."""
    author_query = request.args.get("author", "").strip().lower()
    category_query = request.args.get("category", "").strip().lower()
    general_query = request.args.get("q", "").strip().lower()

    results = QUOTES_DATA

    if author_query:
        results = [q for q in results if author_query in q["author"].lower()]

    if category_query and category_query != "all":
        results = [q for q in results if category_query == q["category"].lower()]

    if general_query:
        results = [
            q for q in results
            if general_query in q["quote"].lower()
            or general_query in q["author"].lower()
            or general_query in q["category"].lower()
        ]

    return jsonify({
        "total": len(results),
        "quotes": results
    })


@app.route("/api/categories", methods=["GET"])
def get_categories():
    """Returns a list of all distinct categories along with quote counts."""
    category_counts = {}
    for q in QUOTES_DATA:
        cat = q["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1

    sorted_categories = sorted(
        [{"name": k, "count": v} for k, v in category_counts.items()],
        key=lambda item: item["name"]
    )
    return jsonify(sorted_categories)


@app.route("/api/authors", methods=["GET"])
def get_authors():
    """Returns a sorted list of unique authors."""
    authors = sorted(list({q["author"] for q in QUOTES_DATA}))
    return jsonify(authors)


@app.route("/api/quotes", methods=["GET"])
def get_all_quotes():
    """Returns all quotes."""
    return jsonify({
        "total": len(QUOTES_DATA),
        "quotes": QUOTES_DATA
    })


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
