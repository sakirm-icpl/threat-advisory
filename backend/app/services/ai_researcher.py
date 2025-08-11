import os
import json
import re
from typing import Any, Dict, List, Optional


class AIResearcherService:
    """Calls an LLM to generate remediation/patching guidance for a CVE.

    This implementation uses OpenAI's Chat Completions API if OPENAI_API_KEY is configured.
    It follows the prompt and output structure provided in the spec.
    """

    def __init__(self):
        # Provider selection: default to Gemini if GOOGLE_API_KEY is set
        self.provider = os.getenv("AI_PROVIDER") or ("gemini" if os.getenv("GOOGLE_API_KEY") else "openai")

        # Common generation config
        self.max_tokens = int(os.getenv("AI_MAX_TOKENS", os.getenv("OPENAI_MAX_TOKENS", "2000")))
        self.temperature = float(os.getenv("AI_TEMPERATURE", os.getenv("OPENAI_TEMPERATURE", "0.1")))

        # Gemini config
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        self.google_model = os.getenv("GOOGLE_MODEL", "gemini-1.5-flash")
        self._genai = None
        if self.google_api_key:
            try:
                import google.generativeai as genai  # type: ignore
                genai.configure(api_key=self.google_api_key)
                self._genai = genai
            except Exception:
                self._genai = None

        # OpenAI (optional fallback)
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self._openai = None
        if self.openai_api_key and self.provider == "openai":
            try:
                import openai  # type: ignore
                openai.api_key = self.openai_api_key
                self._openai = openai
            except Exception:
                self._openai = None

    def is_configured(self) -> bool:
        if self.provider == "gemini":
            return bool(self._genai)
        if self.provider == "openai":
            return bool(self._openai)
        return False

    def _create_prompt(self, cve_id: str, description: str, reference_links: List[str]) -> str:
        """Create prompt as per provided specification."""
        refs = "\n".join([f"- {link}" for link in reference_links]) if reference_links else "No reference links available"
        prompt = f"""You are a cybersecurity expert specializing in vulnerability analysis and remediation.

Please analyze the following CVE and provide comprehensive patching and remediation guidance:

**CVE ID**: {cve_id}
**Description**: {description}

**Reference Links**:
{refs}

Please provide a detailed analysis in the following JSON format:

        {{
    "cve_id": "{cve_id}",
    "severity": "Critical/High/Medium/Low",
    "cvss_score": "X.X (if available)",
    "impact": "Detailed description of potential impact",
    "affected_systems": ["List of affected systems/components"],
    "patching_steps": [
        "Step 1: Detailed patching instruction",
        "Step 2: Detailed patching instruction",
        "..."
    ],
    "remediation_guide": {{
        "prerequisites": "List of prerequisites before patching",
        "steps": [
            "Detailed remediation step 1",
            "Detailed remediation step 2",
            "..."
        ],
        "verification": "How to verify the patch was successful",
        "rollback": "Rollback procedures if needed"
    }},
    "additional_resources": [
        "Additional resource link 1",
        "Additional resource link 2",
        "..."
    ],
            "notes": "Any additional important notes or warnings",
            "cli_commands": {{
                "linux": [
                    "sudo systemctl stop <SERVICE_NAME>",
                    "jar tf <APP_PATH>/log4j-core-*.jar | grep JndiLookup",
                    "sed -n '1p' /etc/*release 2>/dev/null"
                ],
                "windows": [
                    "Get-ChildItem -Recurse -Filter log4j-core-*.jar",
                    "Select-String -Path *.log -Pattern JndiLookup"
                ],
                "kubernetes": [
                    "kubectl get pods -A | grep <APP>",
                    "kubectl rollout restart deployment/<DEPLOYMENT> -n <NAMESPACE>"
                ],
                "verification": [
                    "curl -s http://<HOST>:<PORT>/health || true",
                    "grep -R 'jndi' /var/log -n || true"
                ],
                "rollback": [
                    "sudo cp <BACKUP_PATH>/log4j-core-*.jar <APP_PATH>/",
                    "kubectl rollout undo deployment/<DEPLOYMENT> -n <NAMESPACE>"
                ]
            }}
}}

Important guidelines:
1. Be specific and actionable in your patching steps
2. Consider different operating systems and environments
3. Include verification steps to ensure the patch is effective
4. Provide rollback procedures when applicable
5. Include relevant security best practices
6. Base your analysis on the CVE description and available references
7. Ensure all steps are practical and can be implemented by system administrators

        Also include the cli_commands section populated with practical, copy-paste ready commands using clear ALL-CAPS placeholders (e.g., <HOST>, <SERVICE_NAME>) where needed.

Please provide only the JSON response without any additional text or formatting."""
        return prompt

    def _strip_code_fences(self, text: str) -> str:
        t = text.strip()
        # Remove ```json ... ``` or ``` ... ``` fences if present
        if t.startswith("```json"):
            t = t[len("```json"):]
        if t.startswith("```"):
            t = t[len("```"):]
        if t.endswith("```"):
            t = t[: -len("```")]
        return t.strip()

    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        try:
            cleaned = self._strip_code_fences(text)
            return json.loads(cleaned)
        except Exception:
            return None

    def generate_ai_remediation(self, cve_summary: Dict[str, Any]) -> Dict[str, Any]:
        """Given a CVE summary dict (from CVEService), call LLM and return parsed JSON.

        Returns a dict with keys: data (parsed JSON) or error (string).
        """
        if not self.is_configured():
            return {"error": "LLM provider not configured. Set OPENAI_API_KEY to enable AI remediation."}

        cve_id = cve_summary.get("id") or cve_summary.get("cve_id") or ""
        description = cve_summary.get("description", "No description available")

        # References can be list[dict] with 'url' or list[str]
        references_raw = cve_summary.get("references", [])
        links: List[str] = []
        for ref in references_raw:
            if isinstance(ref, dict) and ref.get("url"):
                links.append(ref.get("url"))
            elif isinstance(ref, str):
                links.append(ref)

        prompt = self._create_prompt(cve_id, description, links)

        try:
            content: Optional[str] = None

            if self.provider == "gemini" and self._genai:
                model = self._genai.GenerativeModel(self.google_model)
                full_prompt = (
                    "You are a cybersecurity expert specializing in vulnerability analysis and remediation.\n\n"
                    + prompt
                )
                # Generation config structure differs by SDK version; pass dict to maximize compatibility
                resp = model.generate_content(
                    full_prompt,
                    generation_config={
                        "max_output_tokens": self.max_tokens,
                        "temperature": self.temperature,
                    },
                )
                # google-generativeai returns .text
                content = getattr(resp, "text", None)

            elif self.provider == "openai" and self._openai:
                resp = self._openai.ChatCompletion.create(
                    model=self.openai_model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a cybersecurity expert specializing in vulnerability analysis and remediation.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=self.max_tokens,
                    temperature=self.temperature,
                )
                content = resp["choices"][0]["message"]["content"] if resp else None

            if not content:
                return {"error": "No content returned from LLM"}

            parsed = self._extract_json(content)
            if not parsed:
                return {"error": "LLM response was not valid JSON"}

            # Minimal validation of required keys
            required_keys = [
                "cve_id",
                "severity",
                "impact",
                "patching_steps",
                "remediation_guide",
            ]
            for key in required_keys:
                if key not in parsed:
                    return {"error": f"LLM response missing required field: {key}"}

            return {"data": parsed}
        except Exception as e:
            return {"error": f"LLM call failed: {e}"}


