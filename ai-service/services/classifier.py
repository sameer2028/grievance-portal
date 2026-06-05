"""
Grievance Category Classifier
------------------------------
Model: TF-IDF vectorizer + Logistic Regression pipeline
Why: Fast inference (~1ms), no GPU needed, interpretable, >85% accuracy on
     this type of short-text classification with good training data.
     Can be upgraded to a fine-tuned BERT later if accuracy needs improvement.

Training data: keyword-based synthetic examples per department.
In production, replace with real labeled grievance data.
"""

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
import numpy as np
import joblib
import os
from utils.logger import get_logger
from utils.text_preprocessing import combine_title_description, clean_text
from config.settings import get_settings

logger = get_logger(__name__)
settings = get_settings()

# Path where trained model is cached
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../data/classifier_model.pkl")
ENCODER_PATH = os.path.join(os.path.dirname(__file__), "../data/label_encoder.pkl")

# ── Training Data ─────────────────────────────────────────────────────────────
# Each tuple: (text sample, department label)
# In production, load this from a CSV or DB with real labeled data.
TRAINING_DATA = [
    # water_supply
    ("no water supply taps dry borewell broken pipeline leaking", "water_supply"),
    ("water contamination dirty water smell pipeline burst no drinking water", "water_supply"),
    ("water tanker not coming water shortage colony no supply days", "water_supply"),
    ("sewage mixing with drinking water pipeline broken water pressure low", "water_supply"),
    ("overhead tank not filled water connection new apply", "water_supply"),
    ("yellow foul smelling water from tap diarrhea unsafe consumption", "water_supply"),
    ("water meter leak huge bill pipe crack flooding street", "water_supply"),

    # electricity
    ("power cut electricity no light transformer broken street light", "electricity"),
    ("electricity bill wrong overcharged meter reading incorrect", "electricity"),
    ("frequent power outages voltage fluctuation appliances damaged", "electricity"),
    ("new electricity connection apply meter installation pending", "electricity"),
    ("electric pole fallen dangerous wire hanging low", "electricity"),
    ("street lights not working area dark unsafe night", "electricity"),
    ("unscheduled power cuts residential block transformer", "electricity"),
    ("severe voltage fluctuations damaged refrigerator appliances", "electricity"),
    ("transformer blew up power supply cut off wiring issue", "electricity"),
    ("sparking overhead cables short circuit fire hazard grid failure", "electricity"),

    # roads_infrastructure
    ("road damaged pothole accident vehicle damage bad road", "roads_infrastructure"),
    ("road construction incomplete blocked digging not filled", "roads_infrastructure"),
    ("footpath encroached broken sidewalk pedestrian unsafe", "roads_infrastructure"),
    ("bridge damaged overloaded traffic diversion road repair", "roads_infrastructure"),
    ("drainage blocked road flooding waterlogging during rain", "roads_infrastructure"),
    ("catastrophic collapse bridge submerged river vehicles emergency disaster infrastructure", "roads_infrastructure"),
    ("highway cave-in sinkhole traffic gridlock pavement cracked unsafe", "roads_infrastructure"),
    ("flyover structural crack concrete falling hazard warning", "roads_infrastructure"),

    # sanitation
    ("garbage not collected waste pile up stench unhygienic area", "sanitation"),
    ("public toilet broken unclean unusable no water sanitation", "sanitation"),
    ("open defecation no toilet drainage blocked sewage smell", "sanitation"),
    ("garbage bin overflowing no sweeper cleaning area dirty", "sanitation"),
    ("drain choked sewage overflow smell disease mosquito breeding", "sanitation"),
    ("biomedical waste dumped open hazardous medical waste hospital", "sanitation"),
    ("dead animal rotting carcass street foul odor no removal", "sanitation"),

    # health
    ("hospital doctor absent medicine unavailable health center closed", "health"),
    ("ambulance not available emergency patient died hospital", "health"),
    ("vaccination camp not organized polio malaria dengue outbreak", "health"),
    ("government hospital dirty no staff no equipment", "health"),
    ("food adulteration contaminated food illness poisoning", "health"),
    ("clinic expired medicine given wrong treatment medical negligence", "health"),
    ("illegal ultrasound clinic quack fake doctor unregistered", "health"),

    # education
    ("school teacher absent no classes students affected education", "education"),
    ("school building dilapidated dangerous roof collapsed no classroom", "education"),
    ("midday meal not provided quality poor scholarship not received", "education"),
    ("no toilet in school girl students issue attendance dropping", "education"),
    ("teacher vacancy not filled school running without staff", "education"),
    ("illegal fees collected private school donation capitation fee", "education"),
    ("exams paper leaked cheating center mass copy board exam", "education"),

    # transport
    ("bus not running route cancelled public transport problem", "transport"),
    ("auto rickshaw overcharging meter tampering complaint", "transport"),
    ("bus stop broken no shelter rain waiting dangerous", "transport"),
    ("traffic jam signal not working road blocked no traffic police", "transport"),
    ("railway station problem platform crowd train late passenger", "transport"),
    ("metro train delay technical fault stranded passenger ticket issue", "transport"),
    ("drunk bus driver rash driving speeding public transport unsafe", "transport"),

    # revenue
    ("land record wrong mutation pending property tax issue", "revenue"),
    ("caste certificate income certificate not issued delay", "revenue"),
    ("ration card problem not issued benefits not received BPL", "revenue"),
    ("government scheme pension not received farmer compensation", "revenue"),
    ("land encroachment illegal construction complaint", "revenue"),
    ("bribe demanded official patwari registry property documents", "revenue"),
    ("survey plot boundary dispute government land grabbed", "revenue"),

    # police
    ("theft robbery crime no action police not responding FIR", "police"),
    ("harassment stalking threat safety fear police complaint", "police"),
    ("domestic violence abuse woman child safety complaint police", "police"),
    ("noise pollution illegal activity complaint police inaction", "police"),
    ("accident hit and run vehicle complaint police", "police"),
    ("cyber crime online fraud scam fake call police investigation", "police"),
    ("drug peddling illegal liquor shop antisocial elements gathering", "police"),

    # other
    ("general complaint miscellaneous issue problem not categorized", "other"),
    ("festival permission denied cultural event approval", "other"),
    ("animal stray dog menace attack colony complaint", "other"),
    ("website not working portal error online application fail", "other"),
    ("unidentified flying object strange noise mysterious event", "other"),
]


class GrievanceClassifier:
    """
    Wraps the sklearn pipeline with load/save and predict methods.
    Instantiated once at app startup and reused for all requests.
    """

    def __init__(self):
        self.pipeline: Pipeline | None = None
        self.label_encoder: LabelEncoder | None = None
        self.is_trained = False

    def _build_pipeline(self) -> Pipeline:
        """
        TF-IDF with character n-grams helps with misspellings common in
        citizen grievances. Logistic Regression gives probability scores
        we use as confidence values.
        """
        return Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 2),       # unigrams + bigrams
                max_features=15000,
                sublinear_tf=True,        # log(1+tf) dampens frequent terms
                analyzer="word",
                min_df=1,
            )),
            ("clf", LogisticRegression(
                max_iter=1000,
                C=20,
                solver="lbfgs",
                multi_class="multinomial",
                class_weight="balanced",  # handles imbalanced classes
            )),
        ])

    def train(self):
        """Train on built-in data and cache the model to disk."""
        texts = [clean_text(t, stem=True) for t, _ in TRAINING_DATA]
        labels = [label for _, label in TRAINING_DATA]

        self.label_encoder = LabelEncoder()
        encoded_labels = self.label_encoder.fit_transform(labels)

        self.pipeline = self._build_pipeline()
        self.pipeline.fit(texts, encoded_labels)
        self.is_trained = True

        # Persist so we don't retrain on every cold start
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(self.pipeline, MODEL_PATH)
        joblib.dump(self.label_encoder, ENCODER_PATH)
        logger.info("Classifier trained and saved to disk")

    def load(self):
        """Load pre-trained model from disk."""
        if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
            self.pipeline = joblib.load(MODEL_PATH)
            self.label_encoder = joblib.load(ENCODER_PATH)
            self.is_trained = True
            logger.info("Classifier loaded from disk")
        else:
            logger.info("No cached model found — training from scratch")
            self.train()

    def predict(self, title: str, description: str) -> dict:
        """
        Returns:
            {
                "category": "water_supply",
                "confidence": 0.87,
                "all_scores": {"water_supply": 0.87, "electricity": 0.05, ...}
            }
        """
        if not self.is_trained:
            raise RuntimeError("Classifier not trained or loaded")

        combined = clean_text(combine_title_description(title, description), stem=True)
        proba = self.pipeline.predict_proba([combined])[0]
        classes = self.label_encoder.classes_

        scores = dict(zip(classes, proba.tolist()))
        best_label_idx = int(np.argmax(proba))
        best_label = classes[best_label_idx]
        confidence = float(proba[best_label_idx])

        # Fall back to "other" if confidence is too low
        if confidence < settings.classification_threshold:
            best_label = "other"

        return {
            "category": best_label,
            "confidence": round(confidence, 4),
            "all_scores": {k: round(v, 4) for k, v in scores.items()},
        }


# Singleton instance
_classifier_instance: GrievanceClassifier | None = None


def get_classifier() -> GrievanceClassifier:
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = GrievanceClassifier()
        _classifier_instance.load()
    return _classifier_instance
