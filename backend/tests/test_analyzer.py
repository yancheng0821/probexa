from unittest.mock import patch, MagicMock

from app.analyzers.openai_analyzer import OpenAIAnalyzer


def test_analyzer_init():
    analyzer = OpenAIAnalyzer(api_key="test-key")
    assert analyzer.api_key == "test-key"


def test_build_prompt_pain_points():
    analyzer = OpenAIAnalyzer(api_key="test-key")
    contents = [
        {"title": "Bad battery", "body": "Battery dies in 2 hours"},
        {"title": "Great sound", "body": "But the case is cheap plastic"},
    ]
    prompt = analyzer.build_prompt("pain_points", "wireless earbuds", contents)
    assert "wireless earbuds" in prompt
    assert "pain" in prompt.lower()
    assert "Battery dies" in prompt


def test_build_prompt_trends():
    analyzer = OpenAIAnalyzer(api_key="test-key")
    contents = [{"title": "Trending item", "body": "Everyone wants this", "metrics": {"views": 1000}}]
    prompt = analyzer.build_prompt("trends", "gadgets", contents)
    assert "gadgets" in prompt
    assert "trend" in prompt.lower()


def test_build_prompt_unmet_needs():
    analyzer = OpenAIAnalyzer(api_key="test-key")
    contents = [{"title": "I wish", "body": "I wish it had noise canceling"}]
    prompt = analyzer.build_prompt("unmet_needs", "earbuds", contents)
    assert "earbuds" in prompt
    assert "need" in prompt.lower() or "wish" in prompt.lower()


def test_build_prompt_pricing():
    analyzer = OpenAIAnalyzer(api_key="test-key")
    contents = [{"title": "Too expensive", "body": "$200 is too much for this"}]
    prompt = analyzer.build_prompt("pricing", "earbuds", contents)
    assert "earbuds" in prompt
    assert "pric" in prompt.lower()


def test_chunk_contents():
    analyzer = OpenAIAnalyzer(api_key="test-key")
    contents = [{"body": f"item {i}"} for i in range(250)]
    chunks = analyzer.chunk_contents(contents, chunk_size=100)
    assert len(chunks) == 3
    assert len(chunks[0]) == 100
    assert len(chunks[2]) == 50


@patch("app.analyzers.openai_analyzer.OpenAI")
def test_analyze_calls_openai(mock_openai_class):
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = '{"pain_points": [{"issue": "battery", "frequency": 10}]}'
    mock_response.usage.prompt_tokens = 500
    mock_response.usage.completion_tokens = 200
    mock_client.chat.completions.create.return_value = mock_response

    analyzer = OpenAIAnalyzer(api_key="test-key")
    result = analyzer.analyze(
        analysis_type="pain_points",
        keyword="earbuds",
        contents=[{"title": "test", "body": "bad battery"}],
    )
    assert result["details"]["pain_points"][0]["issue"] == "battery"
    assert result["token_usage"]["prompt_tokens"] == 500
    assert result["model_used"] == "gpt-4o-mini"
