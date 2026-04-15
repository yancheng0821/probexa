import json

from openai import OpenAI

PROMPTS = {
    "pain_points": """Analyze the following user-generated content about "{keyword}" from social media.
Identify the main pain points and complaints users have with existing products.

For each pain point, provide:
- issue: short description
- frequency: estimated number of mentions (from the data provided)
- severity: 1-10 scale
- sample_quotes: 1-2 direct quotes

Content to analyze:
{content_text}

Respond in JSON format:
{{"pain_points": [{{"issue": "...", "frequency": N, "severity": N, "sample_quotes": ["..."]}}]}}""",

    "trends": """Analyze the following user-generated content about "{keyword}" from social media.
Identify trending topics, popular features, and emerging patterns.

For each trend, provide:
- topic: short description
- momentum: "rising", "stable", or "declining"
- engagement_score: relative score 1-100 based on views/likes/shares
- evidence: 1-2 supporting observations

Content to analyze:
{content_text}

Respond in JSON format:
{{"trends": [{{"topic": "...", "momentum": "...", "engagement_score": N, "evidence": ["..."]}}]}}""",

    "unmet_needs": """Analyze the following user-generated content about "{keyword}" from social media.
Identify unmet needs — things users wish existed, features they want, problems without solutions.
Look for phrases like "I wish", "why can't", "if only", "someone should make".

For each need, provide:
- need: short description
- mentions: number of times similar requests appear
- market_potential: "high", "medium", or "low"
- sample_quotes: 1-2 direct quotes

Content to analyze:
{content_text}

Respond in JSON format:
{{"unmet_needs": [{{"need": "...", "mentions": N, "market_potential": "...", "sample_quotes": ["..."]}}]}}""",

    "pricing": """Analyze the following user-generated content about "{keyword}" from social media.
Identify pricing-related insights — what users think about pricing, their expected price range,
and value-for-money sentiments.

Provide:
- expected_range: {{"min": N, "max": N, "currency": "USD"}}
- value_concerns: list of specific value/price complaints
- willingness_signals: what features users would pay more for

Content to analyze:
{content_text}

Respond in JSON format:
{{"expected_range": {{"min": N, "max": N, "currency": "USD"}}, "value_concerns": ["..."], "willingness_signals": ["..."]}}""",
}


class OpenAIAnalyzer:
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model = model
        self._client = None

    @property
    def client(self):
        if self._client is None:
            self._client = OpenAI(api_key=self.api_key)
        return self._client

    def build_prompt(self, analysis_type: str, keyword: str, contents: list[dict]) -> str:
        template = PROMPTS[analysis_type]
        content_lines = []
        for c in contents:
            title = c.get("title", "")
            body = c.get("body", "")
            metrics = c.get("metrics", {})
            line = f"- {title}: {body}"
            if metrics:
                line += f" (metrics: {metrics})"
            content_lines.append(line)
        content_text = "\n".join(content_lines)
        return template.format(keyword=keyword, content_text=content_text)

    def chunk_contents(self, contents: list[dict], chunk_size: int = 100) -> list[list[dict]]:
        return [contents[i : i + chunk_size] for i in range(0, len(contents), chunk_size)]

    def analyze(
        self,
        analysis_type: str,
        keyword: str,
        contents: list[dict],
        model: str | None = None,
    ) -> dict:
        use_model = model or self.model
        prompt = self.build_prompt(analysis_type, keyword, contents)

        response = self.client.chat.completions.create(
            model=use_model,
            messages=[
                {"role": "system", "content": "You are a market research analyst. Respond only in valid JSON."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )

        content = response.choices[0].message.content
        details = json.loads(content)

        return {
            "analysis_type": analysis_type,
            "summary": self._generate_summary(analysis_type, details),
            "details": details,
            "model_used": use_model,
            "token_usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
            },
        }

    def _generate_summary(self, analysis_type: str, details: dict) -> str:
        if analysis_type == "pain_points":
            points = details.get("pain_points", [])
            top = [p["issue"] for p in sorted(points, key=lambda x: x.get("frequency", 0), reverse=True)[:3]]
            return f"Top pain points: {', '.join(top)}" if top else "No pain points identified."

        if analysis_type == "trends":
            trends = details.get("trends", [])
            rising = [t["topic"] for t in trends if t.get("momentum") == "rising"][:3]
            return f"Rising trends: {', '.join(rising)}" if rising else "No clear trends identified."

        if analysis_type == "unmet_needs":
            needs = details.get("unmet_needs", [])
            high = [n["need"] for n in needs if n.get("market_potential") == "high"][:3]
            return f"High-potential needs: {', '.join(high)}" if high else "No unmet needs identified."

        if analysis_type == "pricing":
            r = details.get("expected_range", {})
            return f"Expected price range: ${r.get('min', '?')}-${r.get('max', '?')}"

        return ""
