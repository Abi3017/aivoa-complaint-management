"""
Thin wrapper around Groq's OpenAI-compatible chat completions API.

Why a wrapper instead of calling groq.Client() everywhere: gemma2-9b-it is a
small, fast model that occasionally returns malformed JSON on complex
extraction prompts. `call_json` retries once against the larger
llama-3.3-70b-versatile model if the primary model's output fails to parse --
that's the "you may also consider llama-3.3-70b-versatile for context" line
in the assignment, made concrete.
"""
import json
import logging

from groq import Groq

from app.config import settings

logger = logging.getLogger(__name__)

_client: Groq | None = None


def get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.groq_api_key)
    return _client


def call_json(system_prompt: str, user_prompt: str, temperature: float = 0.2) -> dict:
    """Call the LLM and parse a JSON object out of the response.

    Tries the mandatory primary model first; falls back to the larger model
    once if parsing fails. Raises if both attempts fail so the caller can
    decide how to degrade gracefully.
    """
    for model in (settings.groq_primary_model, settings.groq_fallback_model):
        try:
            response = get_client().chat.completions.create(
                model=model,
                temperature=temperature,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as exc:  # noqa: BLE001 - deliberately broad, we retry/fallback
            logger.warning("Groq call failed on model %s: %s", model, exc)
            last_error = exc
    raise RuntimeError(f"Both Groq models failed: {last_error}")
