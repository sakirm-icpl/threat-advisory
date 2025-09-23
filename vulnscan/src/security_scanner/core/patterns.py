import os
import json
import re
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Pattern

@dataclass
class RegexPattern:
    name: str
    pattern: str
    test_cases: List[Dict]
    # Additional metadata fields for extensibility
    category: Optional[str] = None
    vendor: Optional[str] = None
    product: Optional[str] = None
    version_group: Optional[int] = None
    priority: Optional[int] = None
    confidence: Optional[float] = None
    metadata: Optional[Dict] = None
    compiled: Optional[Pattern] = field(init=False, default=None)

    def __post_init__(self):
        self.compiled = re.compile(self.pattern)

def load_patterns(patterns_dir: str) -> List[RegexPattern]:
    patterns = []
    for filename in os.listdir(patterns_dir):
        if filename.endswith('.json'):
            with open(os.path.join(patterns_dir, filename), 'r', encoding='utf-8') as f:
                data = json.load(f)
                for entry in data.get('patterns', []):
                    patterns.append(RegexPattern(
                        name=entry.get('name', ''),
                        pattern=entry['pattern'],
                        test_cases=entry.get('test_cases', []),
                        category=entry.get('category'),
                        vendor=entry.get('vendor'),
                        product=entry.get('product'),
                        version_group=entry.get('version_group'),
                        priority=entry.get('priority'),
                        confidence=entry.get('confidence'),
                        metadata=entry.get('metadata'),
                    ))
    return patterns

def validate_patterns(patterns: List[RegexPattern]) -> Dict[str, List[str]]:
    results = {}
    for pat in patterns:
        failed = []
        for case in pat.test_cases:
            test_str = case['input']
            expected = case['expected']
            match = pat.compiled.search(test_str)
            got = match.group(1) if match and match.lastindex else None
            if got != expected:
                failed.append(f"Input: {test_str} | Expected: {expected} | Got: {got}")
        if failed:
            results[pat.name] = failed
    return results