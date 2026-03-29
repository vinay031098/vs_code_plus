import os
from enum import Enum

class TaskComplexity(Enum):
    SIMPLE = "simple"      # Autocomplete, small snippets
    MEDIUM = "medium"      # Function generation, bug fix
    COMPLEX = "complex"    # Full refactor, architecture

def estimate_complexity(prompt: str) -> TaskComplexity:
    """
    Estimate task complexity from the prompt to route to cheapest model.
    """
    prompt_lower = prompt.lower()
    complex_keywords = ["refactor", "architecture", "redesign", "optimize entire", "migrate"]
    simple_keywords = ["complete", "autocomplete", "next line", "finish this"]

    if any(kw in prompt_lower for kw in complex_keywords):
        return TaskComplexity.COMPLEX
    elif any(kw in prompt_lower for kw in simple_keywords):
        return TaskComplexity.SIMPLE
    else:
        return TaskComplexity.MEDIUM

def route_to_model(prompt: str) -> dict:
    """
    Route the prompt to the most cost-effective model.
    Returns model config dict.
    """
    complexity = estimate_complexity(prompt)

    routing_map = {
        TaskComplexity.SIMPLE: {
            "provider": "deepseek",
            "model": "deepseek-coder",
            "estimated_cost": "~$0.0001",
            "reason": "Simple task — using cheapest model"
        },
        TaskComplexity.MEDIUM: {
            "provider": "deepseek",
            "model": "deepseek-chat",
            "estimated_cost": "~$0.001",
            "reason": "Medium task — DeepSeek Chat"
        },
        TaskComplexity.COMPLEX: {
            "provider": "anthropic",
            "model": "claude-3-5-sonnet",
            "estimated_cost": "~$0.01",
            "reason": "Complex task — using Claude for best quality"
        }
    }

    config = routing_map[complexity]
    config["complexity"] = complexity.value
    print(f"[Router] {config['reason']} | Cost: {config['estimated_cost']}")
    return config


if __name__ == "__main__":
    test_prompts = [
        "complete this function",
        "create a login API endpoint",
        "refactor the entire authentication module"
    ]
    for p in test_prompts:
        result = route_to_model(p)
        print(f"Prompt: '{p}' → Model: {result['model']}\n")
