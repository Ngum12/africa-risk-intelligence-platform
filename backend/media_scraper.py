from newspaper import Article
from textblob import TextBlob
import requests
from bs4 import BeautifulSoup

# Basic conflict keyword list
CONFLICT_TERMS = [
    "clash", "protest", "killed", "attack", "violence", "unrest", "riot",
    "ambush", "militant", "insurgency", "abduction", "gunmen", "bomb", "massacre"
]

# Simple news search using Bing (unofficial + no API key)
def fetch_news_links(query):
    headers = {"User-Agent": "Mozilla/5.0"}
    search_url = f"https://www.bing.com/news/search?q={query.replace(' ', '+')}+site:bbc.com+OR+aljazeera.com+OR+reuters.com"
    resp = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(resp.text, 'html.parser')
    links = []
    for a in soup.select("a")[:10]:
        href = a.get("href")
        if href and ('http' in href and 'news' in href):
            links.append(href)
    return list(set(links))[:5]  # Return top 5 unique links

def analyze_article(url):
    try:
        article = Article(url)
        article.download()
        article.parse()
        article.nlp()

        blob = TextBlob(article.text)
        sentiment = blob.sentiment.polarity

        matched_terms = [term for term in CONFLICT_TERMS if term in article.text.lower()]
        tension_score = round((len(matched_terms) / len(CONFLICT_TERMS)) + sentiment, 2)

        return {
            "title": article.title,
            "summary": article.summary,
            "keywords": matched_terms,
            "tension_score": tension_score,
            "sentiment": round(sentiment, 2),
            "link": url
        }
    except Exception as e:
        return {"error": str(e), "link": url}

def media_signals(query):
    links = fetch_news_links(query)
    return [analyze_article(link) for link in links]
