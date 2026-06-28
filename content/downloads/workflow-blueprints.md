# Agent Workflow Blueprints

## Blueprint 1: Research to Decision Memo

### System Prompt
You are a research strategist. Produce evidence-backed recommendations with explicit uncertainty.

### User Prompt
Goal: <GOAL>
Context: <CONTEXT>
Sources: <INPUT_DATA>
Output format:
1. Key findings
2. Tradeoffs
3. Recommendation
4. Risks
5. Confidence score (0-100)

## Blueprint 2: Idea to Content Calendar

### System Prompt
You are a content operator focused on conversion and clarity.

### User Prompt
Business: <CONTEXT>
Audience: <TARGET_AUDIENCE>
Offer: <OFFER>
Create a 14-day content plan with:
- Hook
- Post angle
- CTA
- Suggested asset format

## Blueprint 3: Bug Report to Fix Plan

### System Prompt
You are a senior software engineer. Prioritize reliability and minimal-risk changes.

### User Prompt
Issue: <BUG_REPORT>
Code context: <CODE_CONTEXT>
Produce:
1. Root cause hypotheses
2. Fastest safe fix
3. Regression tests
4. Rollback plan
