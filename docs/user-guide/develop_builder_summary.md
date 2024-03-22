# Builder Summary

The Builder is a tool designed for constructing LinguFlow application logic using a Directed Acyclic Graph (DAG) approach. With a basic understanding of Blocks and Lines, you can quickly create an LinguFlow application.

## Core Capabilities

Within the Builder interface, you can:
- Export the existing Blocks and Lines as a `.yaml` file. The export process anonymizes any keys.
- Import an existing `.yaml` file and visualize it.
- Save the current content.
- Publish a saved version.

## Information

The bottom right corner of the Builder interface displays essential information, including the application name and version name.

Clicking the `info` button reveals detailed information:
- App Name & App ID
- Version Name & Version ID, where you can modify the version name.

## Canvas

The foundation of the Builder is a canvas. You can drag, zoom, or center the canvas to suit your needs.

## Block

Right-clicking or pressing the `space` key on the canvas brings up the block selection box. Selecting a specific block will place it on the canvas.

Blocks are the nodes within the DAG, each representing a specific processing logic. Block types include input, output, LLM, third-party tools, numerical processing, and invoking other LinguFlow applications. For a detailed introduction to block content, refer to the [Builder - Block]() documentation.

## Line

With two blocks on the canvas, you can connect them using a line.

There are two types of lines:
- Data lines: These lines transfer information from the outport of one block to the import of another block. Note that a connection is only possible if the field types of the outport and import match exactly.
- Conditional lines: Produced by special `condition` blocks, these lines carry results of True or False, allowing for the selection of subsequent blocks to run under different conditions.

## Debugging

The `Debugging` button, located at the bottom left corner of the Builder interface, opens the [Debugging]() window when clicked.