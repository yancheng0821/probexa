from datetime import datetime, timezone


class ReportGenerator:
    def generate_markdown(self, keyword: str, analyses: list[dict]) -> str:
        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        lines = [
            f"# Market Research Report: {keyword}",
            "",
            f"**Generated:** {now}",
            "",
            "---",
            "",
        ]

        title_map = {
            "pain_points": "Pain Points Analysis",
            "trends": "Trends Analysis",
            "unmet_needs": "Unmet Needs Analysis",
            "pricing": "Pricing Analysis",
        }

        for analysis in analyses:
            atype = analysis["analysis_type"]
            summary = analysis.get("summary", "")
            details = analysis.get("details", {})

            lines.append(f"## {title_map.get(atype, atype)}")
            lines.append("")
            lines.append(f"**Summary:** {summary}")
            lines.append("")

            if atype == "pain_points":
                points = details.get("pain_points", [])
                if points:
                    lines.append("| Issue | Frequency | Severity |")
                    lines.append("|-------|-----------|----------|")
                    for p in sorted(points, key=lambda x: x.get("frequency", 0), reverse=True):
                        lines.append(f"| {p.get('issue', '')} | {p.get('frequency', '')} | {p.get('severity', '')} |")
                    lines.append("")

            elif atype == "trends":
                trends = details.get("trends", [])
                if trends:
                    lines.append("| Topic | Momentum | Score |")
                    lines.append("|-------|----------|-------|")
                    for t in trends:
                        lines.append(f"| {t.get('topic', '')} | {t.get('momentum', '')} | {t.get('engagement_score', '')} |")
                    lines.append("")

            elif atype == "unmet_needs":
                needs = details.get("unmet_needs", [])
                if needs:
                    lines.append("| Need | Mentions | Potential |")
                    lines.append("|------|----------|-----------|")
                    for n in needs:
                        lines.append(f"| {n.get('need', '')} | {n.get('mentions', '')} | {n.get('market_potential', '')} |")
                    lines.append("")

            elif atype == "pricing":
                r = details.get("expected_range", {})
                if r:
                    lines.append(f"**Expected Price Range:** ${r.get('min', '?')} - ${r.get('max', '?')}")
                    lines.append("")

            lines.append("---")
            lines.append("")

        return "\n".join(lines)
