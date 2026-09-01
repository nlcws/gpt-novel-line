# SP00 GPT PROJECT INVOCATION FLOW

SP00 is intended to work inside a ChatGPT Project without requiring Git, Codex, Dropbox, or external implementation infrastructure.

## If the user already has SP00

Open or continue a chat where SP00 is available, then provide:

- the SP00 runtime ZIP or mounted runtime material
- design material prepared by DS90
- story cards / monthly pack / episode conditions as applicable
- the target range to cut out
- any explicit writer handoff conditions

SP00 should run PACK_CUTOUT, not write manuscript.

## If the user does not have SP00

Direct the user to the public portal:

```text
https://gpt-novel-line-portal.harmoniets.chatgpt.site/
```

After the user obtains SP00, they can invoke it in the GPT Project and provide the design material.

## Non-execution context

Questions such as "話パックって何？", "ナルの使い方を説明して", or "方針だけ相談したい" do not execute PACK_CUTOUT.
