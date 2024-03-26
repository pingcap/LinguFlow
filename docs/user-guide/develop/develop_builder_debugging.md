---
title: Debugging
sidebar_label: Debugging
sidebar_position: 4.4
---

# Debugging

Debugging is a crucial step after completing the construction of a LinguFlow application.

LinguFlow facilitates direct use of debugging features within the Builder UI.

## Prerequisites

After building a LinguFlow application, ensure to save it.

The application should at least have one Input block and one Output block, with all blocks interconnected by logical data lines.

## Debugging Process

1. Click the `Debugging` button located at the bottom left corner to open the `Debugging` popup window.
2. Enter input data in the provided field and click the `Send` button to start running the application.
3. The Builder UI will dynamically display the output results for each block. A block's output is highlighted in green upon successful execution (note that green indicates successful execution, not necessarily the accuracy of the output); if a block encounters an error during execution, the error message will be displayed in red, indicating the need for further investigation.
4. Review the output results of each block to ensure they meet the application's requirements: if the results are unsatisfactory, modify the application, save it, and repeat the debugging process; if the results are satisfactory, save the edits and consider whether the version needs to be published.