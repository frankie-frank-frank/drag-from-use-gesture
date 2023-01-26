import React, { useEffect, useRef, useState } from 'react'
import { useDrag } from '@use-gesture/react'

import styles from './styles.module.css'

const mainAnswerDivWidth = 700
const mainAnswerDivHeight = 150
const gapValue = 10
const buttonHeight = 100
const buttonWidth = 120

interface IDraggableButton {
  index: number
  setCurrKey: React.Dispatch<React.SetStateAction<number>>
  setCurrButtonInnerHTML: React.Dispatch<React.SetStateAction<string>>
  setParentCurrButtonCoordinates: React.Dispatch<
    React.SetStateAction<{ xStart: number; xEnd: number; yStart: number; yEnd: number } | null>
  >
}

function keyLogic(input: number){
  if(input == 0){ return '1st'}
  if(input == 1){ return '2nd'}
  if(input == 2){ return '3rd'}
  if(input == 3){ return '4th'}
  if(input == 4){ return '5th'}
}

function DraggableButton({ index, setCurrKey, setParentCurrButtonCoordinates, setCurrButtonInnerHTML }: IDraggableButton) {
  const [currButtonOffset, setCurrButtonOffset] = useState({ x: 0, y: 0 })
  const [currButtonCoordinates, setCurrButtonCoordinates] = useState({ xStart: 0, xEnd: 0, yStart: 0, yEnd: 0 })

  function handleMouseDown(e: React.MouseEvent<HTMLButtonElement>){
    setCurrKey(index)    
  }

  function handleMouseUp(e: React.MouseEvent<HTMLButtonElement>) {
    const currButtonGet = document.getElementById(`currButton-${index}`)
    if (!currButtonGet) return
    const { top: t, left: l } = currButtonGet.getBoundingClientRect()
    setCurrButtonCoordinates({ xStart: l, xEnd: l + buttonWidth, yStart: t, yEnd: t + buttonHeight })
    setParentCurrButtonCoordinates({ xStart: l, xEnd: l + buttonWidth, yStart: t, yEnd: t + buttonHeight })
    setCurrButtonInnerHTML(e.currentTarget.innerText)
  }

  useEffect(() => {
    const currButtonGet = document.getElementById(`currButton-${index}`)
    if (!currButtonGet) return
    const { top: t, left: l } = currButtonGet.getBoundingClientRect()
    setCurrButtonCoordinates({ xStart: l, xEnd: l + buttonWidth, yStart: t, yEnd: t + buttonHeight })
  }, [])

  const bind = useDrag(({ offset: [x0, x1] }) => {
    setCurrButtonOffset({
      x: x0,
      y: x1,
    })
  })

  return (
    <button
      {...bind()}
      className={styles.content}
      style={{
        height: buttonHeight,
        width: buttonWidth,
        backgroundColor: 'pink',
        position: 'relative',
        top: currButtonOffset.y,
        left: currButtonOffset.x,
      }}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      id={`currButton-${index}`}>
      {index}
    </button>
  )
}

export default function App() {
  const answerDivRef = useRef(null)
  const inputSet = [0, 1, 2, 3, 4]
  const answerSet = [2,1,0,4,3]
  const [currKey, setCurrKey] = useState<number>(0)
  const [parentCurrButtonCoordinates, setParentCurrButtonCoordinates] = useState<{
    xStart: number
    xEnd: number
    yStart: number
    yEnd: number
  } | null>(null)
  // const [currButtonInAnswer, setCurrButtonInAnswer] = useState<boolean>(false)
  const [currButtonInnerHTML, setCurrButtonInnerHTML] = useState<string>("")
  const [mainAnswerDivCoordinates, setMainAnswerDivCoordinates] = useState({ xStart: 0, xEnd: 0, yStart: 0, yEnd: 0 })
  const [correctOrder, setCorrectOrder] = useState<boolean>(false)
  const [visited, setVisited] = useState<boolean[]>([false, false, false, false, false])
  // const [newXVals, setNewXVals] = useState<{xStart: number, xEnd: number}>({xStart: 0, xEnd: 0})
  const [correctCount, setCorrectCount] = useState<number>(0)
  //delete when done
  const [notVisited, setNotVisited] = useState<string>("")
  useEffect(() => {
    const currMainDivGet = document.getElementById('mainAnswerDiv')
    if (!currMainDivGet) return
    const { top: t, left: l } = currMainDivGet.getBoundingClientRect()
    setMainAnswerDivCoordinates({ xStart: l, xEnd: l + mainAnswerDivWidth, yStart: t, yEnd: t + mainAnswerDivHeight })
  }, [])

  useEffect(() => {
    if (!parentCurrButtonCoordinates) return
    const { xStart: buttonX, yStart: buttonY } = parentCurrButtonCoordinates
    const { xStart: ansXStart, xEnd: ansXEnd, yStart: ansYStart, yEnd: ansYEnd } = mainAnswerDivCoordinates
    if (buttonX > ansXStart && buttonX < ansXEnd && buttonY > ansYStart && buttonY < ansYEnd) {
      const newXStart = (ansXStart + ((currKey + 1) * gapValue) + (currKey * buttonWidth)) - 10 
      const newXEnd = newXStart + buttonWidth + 10
      // setNewXVals({xStart: newXStart, xEnd: newXEnd})
      if(buttonX > newXStart && buttonX < newXEnd ){
        // setCurrButtonInAnswer(true) //you can delete this later
        if(visited[currKey] === true) {setNotVisited("visited"); return;}
        setNotVisited("not visited")
        if(parseInt(currButtonInnerHTML) === answerSet[correctCount]) setCorrectCount(prev => prev + 1)
        setVisited((prev) => (prev.map((item, key) => {return key === currKey ? true : item})))
      }
    } else {
      // setCurrButtonInAnswer(false)
    }
    if(correctCount === answerSet.length) setCorrectOrder(true)
  }, [setParentCurrButtonCoordinates, parentCurrButtonCoordinates])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${gapValue}px` }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: `${gapValue}px`,
          padding: `${gapValue}px`,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <div
          style={{ backgroundColor: 'blue', width: `${mainAnswerDivWidth}px`, height: `${mainAnswerDivHeight}px`, display: 'flex', flexDirection: "row", justifyContent: 'center', alignItems: 'center', gap: `${gapValue}px` }}
          ref={answerDivRef}
          id="mainAnswerDiv">
            {
              inputSet.map((item, key) => {
                return (
                  <div style={{height: buttonHeight, width: buttonWidth, backgroundColor: 'pink', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: "center", fontSize: '14px', color: 'white', fontWeight: 'bolder'}} key={key}>
                    {keyLogic(item)} answer here
                  </div>
                )
              })
            }
          </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${gapValue}px`,
            backgroundColor: 'red',
            width: '200px',
            height: `700px`,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {inputSet.map((item, key) => {
            return (
              <DraggableButton
                index={item}
                setCurrKey={setCurrKey}
                key={key}
                setParentCurrButtonCoordinates={setParentCurrButtonCoordinates}
                setCurrButtonInnerHTML={setCurrButtonInnerHTML}
              />
            )
          })}
        </div>
      </div>
      <p>currKey: {currKey}</p>
      <p>{notVisited}</p>
      <p>currInnerHTML: {parseInt(currButtonInnerHTML)}</p>
      <p>currAnswer: {answerSet[correctCount]}</p>
      <p>{correctOrder===true && "correct order"}</p>
      {/* <div
        style={{
          height: 800,
          width: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: `${gapValue}px`,
          alignItems: 'center',
        }}> */}
        {/* <p>
          {currKey} {currButtonInAnswer === true ? 'true' : 'false'}
        </p> */}
        {/* <p>{currKey} {currKey && (currButtonInAnswer===true ? "true" : "false")}</p> */}
        {/* <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          <section>
            <p>{'x start: ' + parentCurrButtonCoordinates?.xStart}</p>
            <p>{'x end: ' + parentCurrButtonCoordinates?.xEnd}</p>
            <p>{'y start: ' + parentCurrButtonCoordinates?.yStart}</p>
            <p>{'y end: ' + parentCurrButtonCoordinates?.yEnd}</p>
          </section>
          <section>
            <p>{'x start: ' + mainAnswerDivCoordinates.xStart}</p>
            <p>{'x end: ' + mainAnswerDivCoordinates.xEnd}</p>
            <p>{'y start: ' + mainAnswerDivCoordinates.yStart}</p>
            <p>{'y end: ' + mainAnswerDivCoordinates.yEnd}</p>
          </section>
          <section>
            <p>{newXVals.xStart}</p>
            <p>{newXVals.xEnd}</p>
          </section>
        </div> */}
      {/* </div> */}
    </div>
  )
}
