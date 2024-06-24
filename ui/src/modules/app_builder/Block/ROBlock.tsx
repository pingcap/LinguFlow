import { forwardRef } from 'react'
import { BlockNode, BlockNodeProps } from '.'

export const ROBlock = forwardRef<HTMLDivElement, BlockNodeProps & { onClick?: () => void }>(
  ({ schema, node, onClick }, ref) => {
    return (
      <BlockNode
        ref={ref}
        onClick={onClick}
        id="read_only_block"
        readonly={true}
        data={{ schema, node }}
        selected={false}
        dragging={false}
        type=""
        zIndex={0}
        isConnectable={false}
        xPos={0}
        yPos={0}
      />
    )
  }
)
