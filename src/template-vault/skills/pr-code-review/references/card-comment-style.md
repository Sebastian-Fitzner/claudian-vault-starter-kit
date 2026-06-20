# Card Comment Style

Use this file as the tone reference for `pr-comment` bodies.

Target style:
- short
- direct
- conversational
- one issue per comment
- main ask in the first sentence
- optional short follow-up sentence for impact or context

Preferred openings when they sound natural:

Question-led:
- `Why not...`
- `Can we...`
- `Could we...`
- `What about...`
- `Do we want to...`
- `Does it make sense to...`
- `Any reason not to...`

Personal reviewer voice:
- `I think we could...`
- `I would...`
- `I would just...`
- `I would probably...`
- `I wonder if we should...`
- `I am not sure we need...`
- `I am wondering if...`

Direct but still conversational:
- `This could probably...`
- `This might be simpler if...`
- `This looks like a good place to...`
- `It might be cleaner to...`
- `It would be safer to...`
- `Worth aligning this with...`
- `Worth extracting this into...`

Use them as starting points, not as fixed templates. The goal is variety with the same short, direct reviewer voice.

## Good examples

```text
Why not use `setErrors` + inline display here like `CreditEditForm` does? Shows a toast for the same validation, which makes the UX inconsistent.
```

```text
Can we remove `payoutType` and `customerType` from `signContractFormFields` in the same PR? Otherwise API errors on removed fields can get swallowed silently.
```

```text
I think we could extract this parser into a shared util. The same threshold check now uses different parsing paths across the forms.
```

```text
I would add tests for the `<1000` and `>=1000` paths here as well. This guard changes submission behavior and only one flow is covered right now.
```

## Not the target style

Too report-like:

```text
This change introduces an inconsistency in the validation approach between the leasing and credit forms. The current implementation should likely be revisited to align both patterns.
```

Too vague:

```text
This feels a bit messy. Maybe refactor later.
```

Too long:

```text
Could we potentially consider moving this into a separate helper because there are multiple places where similar logic may eventually be needed and it would probably improve maintainability over time if we centralised the implementation now?
```
