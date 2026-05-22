import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from utils.logger import get_logger

logger = get_logger(__name__)

# Download NLTK data on first use (idempotent)
def ensure_nltk_data():
    for resource in ["stopwords", "punkt"]:
        try:
            nltk.data.find(f"tokenizers/{resource}" if resource == "punkt" else f"corpora/{resource}")
        except LookupError:
            logger.info(f"Downloading NLTK resource: {resource}")
            nltk.download(resource, quiet=True)


ensure_nltk_data()

_stemmer = PorterStemmer()
_stop_words = set(stopwords.words("english"))

# Common Indian English contractions that stopwords miss
_EXTRA_STOP_WORDS = {
    "kindly", "please", "sir", "madam", "dear", "respected",
    "regarding", "hereby", "forthwith", "henceforth",
}
_stop_words.update(_EXTRA_STOP_WORDS)


def clean_text(text: str, stem: bool = False) -> str:
    """
    Standard text cleaning pipeline.

    Steps:
    1. Lowercase
    2. Remove URLs, emails, phone numbers
    3. Remove punctuation and special chars
    4. Remove extra whitespace
    5. Remove stopwords
    6. (Optional) Stem tokens

    Args:
        text: Raw input string
        stem: Whether to apply Porter stemming (good for TF-IDF, bad for embeddings)

    Returns:
        Cleaned string
    """
    if not text or not isinstance(text, str):
        return ""

    text = text.lower()

    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+", "", text)

    # Remove email addresses
    text = re.sub(r"\S+@\S+\.\S+", "", text)

    # Remove phone numbers (Indian format)
    text = re.sub(r"(?:\+91|0)?[6-9]\d{9}", "", text)

    # Remove punctuation and digits
    text = text.translate(str.maketrans("", "", string.punctuation + string.digits))

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    tokens = text.split()

    # Remove stopwords
    tokens = [t for t in tokens if t not in _stop_words and len(t) > 2]

    if stem:
        tokens = [_stemmer.stem(t) for t in tokens]

    return " ".join(tokens)


def combine_title_description(title: str, description: str) -> str:
    """
    Merge title and description into a single string for models.
    Title is repeated to give it higher weight.
    """
    cleaned_title = clean_text(title)
    cleaned_desc = clean_text(description)
    # Repeat title twice: gives it 2x weight in TF-IDF space
    return f"{cleaned_title} {cleaned_title} {cleaned_desc}".strip()
