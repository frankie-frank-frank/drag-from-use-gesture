import { useRef, useState } from 'react'
import { useSprings, animated, config } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import clamp from 'lodash.clamp'
import swap from 'lodash-move'

import styles from './styles.module.css'

const fn =
  (order: number[], active = false, originalIndex = 0, curIndex = 0, y = 0, x0 = 0, xInitial=0) =>
  (index: number) =>
    active && index === originalIndex
      ? {
        xOffset: x0 +xInitial,
          y: 0,
          scale: 1.1,
          zIndex: 1,
          shadow: 15,
          immediate: (key: string) => key === 'zIndex',
          config: (key: string) => (key === 'y' ? config.stiff : config.default),
        }
      : {
        xOffset: 0,
          y: 0,
          scale: 1,
          zIndex: 0,
          shadow: 1,
          immediate: false,
        }

function DraggableList({ items }: { items: string[] }) {
  const order = useRef(items.map((_, index) => index)) // Store indicies as a local ref, this represents the item order
  const [xInitial, setXInitial] = useState(0)
  const [springs, api] = useSprings(items.length, fn(order.current)) // Create springs, each corresponds to an item, controlling its transform, scale, etc.
  let offSetXVal = 0;
  const bind = useDrag(({ args: [originalIndex], active, movement: [x, y], offset: [x0, x1] }) => {
    const curIndex = order.current.indexOf(originalIndex)
    const curRow = clamp(Math.round((curIndex * 100 + y) / 100), 0, items.length - 1)
    const newOrder = swap(order.current, curIndex, curRow)
    offSetXVal = x0
    api.start(fn(newOrder, active, originalIndex, curIndex, y, x0, xInitial)) // Feed springs new style data, they'll animate the view without causing a single render
    if (!active) order.current = newOrder
  }, {bounds: { left: -220, right: 0}})
  // setXInitial(offSetXVal+xInitial)
  
  return (
    <div className={styles.content} style={{ height: items.length * 100, backgroundColor: 'pink',display: 'flex', flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
      {springs.map(({ zIndex, shadow, y, scale, xOffset }, i) => (
        <animated.div
          {...bind(i)}
          key={i}
          style={{
            position: 'relative',
            zIndex,
            boxShadow: shadow.to(s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`),
            left: xOffset,
            y,
            scale,
            width: 100
          }}
          children={items[i]}
        />
      ))}
    </div>
  )
}

export default function InitialApp() {
  return (
    <div className="flex fill center">
      <DraggableList items={'Lorem ipsum dolor sit'.split(' ')} />
    </div>
  )
}
