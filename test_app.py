import json
import os
import unittest
from app import app, QUOTES_DATA, QUOTES_FILE


class TestQuoteApp(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_quotes_file_contains_100_items(self):
        """Verify quotes.json has exactly 100 quotes with required fields."""
        with open(QUOTES_FILE, "r", encoding="utf-8") as f:
            quotes = json.load(f)

        self.assertEqual(len(quotes), 100, f"Expected 100 quotes, found {len(quotes)}")
        ids = set()
        for idx, item in enumerate(quotes):
            self.assertIn("id", item, f"Quote at index {idx} missing 'id'")
            self.assertIn("quote", item, f"Quote at index {idx} missing 'quote'")
            self.assertIn("author", item, f"Quote at index {idx} missing 'author'")
            self.assertIn("category", item, f"Quote at index {idx} missing 'category'")
            self.assertTrue(item["quote"].strip(), f"Quote text is empty at index {idx}")
            self.assertTrue(item["author"].strip(), f"Author is empty at index {idx}")
            self.assertTrue(item["category"].strip(), f"Category is empty at index {idx}")
            ids.add(item["id"])

        self.assertEqual(len(ids), 100, "All quote IDs should be unique")

    def test_index_route(self):
        """Verify the main route serves HTML."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Wisdom Vault", response.data)
        self.assertIn(b"Random Quote of the Moment", response.data)

    def test_get_all_quotes_api(self):
        """Verify /api/quotes returns 100 quotes."""
        response = self.client.get("/api/quotes")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["total"], 100)
        self.assertEqual(len(data["quotes"]), 100)

    def test_random_quote_api(self):
        """Verify /api/quotes/random returns a single valid quote."""
        response = self.client.get("/api/quotes/random")
        self.assertEqual(response.status_code, 200)
        quote = response.get_json()
        self.assertIn("id", quote)
        self.assertIn("quote", quote)
        self.assertIn("author", quote)
        self.assertIn("category", quote)

    def test_random_quote_with_category_filter(self):
        """Verify /api/quotes/random?category=Philosophy respects the filter."""
        response = self.client.get("/api/quotes/random?category=Philosophy")
        self.assertEqual(response.status_code, 200)
        quote = response.get_json()
        self.assertEqual(quote["category"].lower(), "philosophy")

    def test_random_quote_with_author_filter(self):
        """Verify /api/quotes/random?author=Einstein respects the filter."""
        response = self.client.get("/api/quotes/random?author=Einstein")
        self.assertEqual(response.status_code, 200)
        quote = response.get_json()
        self.assertIn("einstein", quote["author"].lower())

    def test_search_quotes_by_author(self):
        """Verify search by author returns only matching quotes."""
        response = self.client.get("/api/quotes/search?author=Jobs")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreater(data["total"], 0)
        for q in data["quotes"]:
            self.assertIn("jobs", q["author"].lower())

    def test_search_quotes_by_category(self):
        """Verify search by category returns only matching quotes."""
        response = self.client.get("/api/quotes/search?category=Wisdom")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreater(data["total"], 0)
        for q in data["quotes"]:
            self.assertEqual(q["category"].lower(), "wisdom")

    def test_search_quotes_by_keyword(self):
        """Verify general text search matches quote contents."""
        response = self.client.get("/api/quotes/search?q=stupidity")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreater(data["total"], 0)
        self.assertTrue(any("human stupidity" in q["quote"].lower() for q in data["quotes"]))

    def test_get_categories_api(self):
        """Verify /api/categories returns non-empty list summing to 100."""
        response = self.client.get("/api/categories")
        self.assertEqual(response.status_code, 200)
        categories = response.get_json()
        self.assertGreater(len(categories), 0)
        total_counted = sum(c["count"] for c in categories)
        self.assertEqual(total_counted, 100)

    def test_get_authors_api(self):
        """Verify /api/authors returns a non-empty sorted list of authors."""
        response = self.client.get("/api/authors")
        self.assertEqual(response.status_code, 200)
        authors = response.get_json()
        self.assertGreater(len(authors), 0)
        self.assertEqual(authors, sorted(authors))


if __name__ == "__main__":
    unittest.main()
