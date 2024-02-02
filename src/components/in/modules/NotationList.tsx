import { faPlay, faReply, faRotateRight, faShare, faStop, faUpLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { playground } from '../maps';

type Props = {
    notation: string[][];
    list: string[];
    setList: React.Dispatch<React.SetStateAction<string[]>>;
    iterationRef: React.MutableRefObject<number>;
    player: { cords: number[], direction: string | undefined };
    setPlayer: React.Dispatch<React.SetStateAction<{ cords: number[]; direction: string | undefined; }>>;
};

const whichIcon = (direction: string) => {
    switch (direction) {
        case "left":
            return faReply;
        case "right":
            return faShare;
        case "forward":
            return faUpLong;
        default:
            return faReply;
    };
};

const NotationList: React.FC<Props> = ({ notation, list, setList, iterationRef, player, setPlayer }) => {
    

    const calcTurn = (direction: string | undefined, turn: string ) => {
        if (turn.includes("-")){
            turn = turn.split("-")[1];
        }
        // console.log(direction, turn)
        switch (direction) {
            case 'right':
                // console.log(turn)
                return turn === "left" ? 'up' : turn === "right" ? 'down' : direction;
            case 'left':
                // console.log(turn)
                return turn === "left" ? 'down' : turn === "right" ? 'up' : direction;
            case 'up':
                // console.log(turn)
                return turn === "left" ? 'left' : turn === "right" ? 'right' : direction;
            case 'down':
                // console.log(turn)
                return turn === "left" ? 'right' : turn === "right" ? 'left' : direction;
            default:
                return direction;
        }
    }
    const calcCords = (item: string, playerRef: any) => {
        const cords = playerRef.cords;
        const direction = calcTurn(playerRef.direction, item);
        const move = 1;
        switch (direction) {
            case 'right':
                return [cords[0] + move, cords[1]];
            case 'left':
                // console.log(cords[0] - move, cords[1])
                return [cords[0] - move, cords[1]];
            case 'up':
                return [cords[0], cords[1] - move];
            case 'down':
                return [cords[0], cords[1] + move];
            default:
                return cords;
        }
    }
    const checkBlock = (playerRef: any, color: string) => {
        if(color.includes("-")){
        const splitColor = color.split("-")[0];
        const matchingColorLocation = playground[0].board.find(select =>
            select.cord[0] === playerRef.cords[0] && select.cord[1] === playerRef.cords[1] && select.color === splitColor);
            return !!matchingColorLocation
        } else {
            return true
        }
    }
    const ReadNotation = (i: number, playerClone: any, notationClone: any) => {
        const delayBetweenSteps = 100;
        const notationRef = cloneDeep(notationClone);
        const notationArray = notationRef[i];
        let playerRef = cloneDeep(playerClone);
        let index = 0;
        const processItem = (index: number, notationArray: string[], currentIteration: number) => {
            if (notationArray && index < notationArray.length && currentIteration === iterationRef.current) {
                const item = notationArray[index];
                console.log(notationRef[0].slice(index + 1))
    
                if (item) {
                    if(item.includes("forward")){
                        playerRef.cords = calcCords(item, playerRef);
                    }
                    playerRef.direction = calcTurn(playerRef.direction, item);
                    // console.log(playerRef.direction)
                    setList((prevList) => [...prevList, item])
                    
                    // && checkBlock(playerRef, item.split("-")[0])
                    if (item.includes("f") && !item.includes("forward") && !item.includes("left") && checkBlock(playerRef, item)) {
                        let test = notation[0].slice(index + 1)
                        notationRef[0].push(...test);
                        iterationRef.current += 1;

                        // Bunu yapmak fonksiyonu iptal ederken sıkıntı çıkartıyor bir sonraki update de bakılacak
                        setTimeout(()=> {
                            ReadNotation(parseInt(item.split("f")[1]), playerRef, notationRef);
                        }, delayBetweenSteps);
                    }
                    
                }

                index++;
                setTimeout(() => {
                    processItem(index, notationArray, currentIteration);
    
                    // Scroll to bottom after each step
                    const element = document.querySelector(".scroll-smooth");
                    element?.scrollTo({
                        top: element.scrollHeight,
                        behavior: "smooth"
                    });
    
                }, delayBetweenSteps);
            }
        };
    
        processItem(index, notationArray, iterationRef.current);
    };

    useEffect(() => {
        const lastAction = list[list.length - 1];
        
        const turnOrMovePlayer = (direction: string | undefined, x: number, y: number) => {
            if (direction !== undefined) {
                console.log(lastAction, x, y)
                if ((!!lastAction.split("-") && lastAction.split("-")[1] === "forward") || lastAction === "forward") {
                    if (player.direction === 'up') {
                        movePlayer(0, -1);
                    } else if (player.direction === 'down') {
                        movePlayer(0, 1);
                    } else if (player.direction === 'left') {
                        movePlayer(-1, 0);
                    } else if (player.direction === 'right') {
                        movePlayer(1, 0);
                    }
                } else {
                    turnPlayer(lastAction);
                }
            }
        };

        switch (lastAction) {
            case "left":
                turnOrMovePlayer("left", 0, 0);
                break;
            case "right":
                turnOrMovePlayer("right", 0, 0);
                break;
            case "forward":
                switch (player.direction) {
                    case 'right':
                        turnOrMovePlayer("right", 1, 0);
                        break;
                    case 'left':
                        turnOrMovePlayer("left", -1, 0);
                        break;
                    case 'up':
                        turnOrMovePlayer("up", 0, -1);
                        break;
                    case 'down':
                        turnOrMovePlayer("down", 0, 1);
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }

        if (list.length === 0) {
            const [cords, direction] = [playground[0].player.spawn, playground[0].player.direction]
            setPlayer({ cords, direction });

        } else if (lastAction.includes("-")) {
            const color = lastAction.split("-")[0];
            const matchingColorLocation = playground[0].board.find(select =>
                select.cord[0] === player.cords[0] && select.cord[1] === player.cords[1] && select.color === color);
            if (!!matchingColorLocation) {
                // const action = calcTurn(player.direction, lastAction.split("-")[1]);
                const action = lastAction.split("-")[1];
                console.log("direction+action : " + player.direction, action)
                if (action.includes("forward")) {
                    turnOrMovePlayer(player.direction, player.direction === "right" ? 1 : -1, 0);
                } else {
                    turnOrMovePlayer(player.direction, 0, player.direction === "right" ? 1 : -1);
                }
            }
        } // eslint-disable-next-line
    }, [list]);

    const movePlayer = (x:number,y:number) => {
        !isValid(player.cords[0] + x, player.cords[1] + y) && (iterationRef.current += 1);
        // console.log(playground[0].board.find(select => select.cord[0] === player.cords[0] + x && select.cord[1] === player.cords[1] + y))
        setPlayer((prevPlayer) => ({ ...prevPlayer, cords: [prevPlayer.cords[0] + x, prevPlayer.cords[1] + y] }));
    } 
    const turnPlayer = (direction: string) => {
        let mixedDirection = direction.includes("-") ? direction.split("-")[1] : direction; 
        // console.log(player.cords)
        switch (mixedDirection) {
            case "left":
                setPlayer((prevPlayer) => {
                    switch (prevPlayer.direction) {
                        case 'right':
                            return { ...prevPlayer, direction: 'up' };
                        case 'left':
                            return { ...prevPlayer, direction: 'down' };
                        case 'up':
                            return { ...prevPlayer, direction: 'left' };
                        case 'down':
                            return { ...prevPlayer, direction: 'right' };
                        default:
                            return prevPlayer;
                    }
                });
                break;
            case "right":
                setPlayer((prevPlayer) => {
                    switch (prevPlayer.direction) {
                        case 'right':
                            return { ...prevPlayer, direction: 'down' };
                        case 'left':
                            return { ...prevPlayer, direction: 'up' };
                        case 'up':
                            return { ...prevPlayer, direction: 'right' };
                        case 'down':
                            return { ...prevPlayer, direction: 'left' };
                        default:
                            return prevPlayer;
                    }
                });
                break;
            default: break;
        }
    }

    function isValid(x:number, y:number) {
        return (playground[0].board.some((select) => select.cord[0] === x && select.cord[1] === y))
    }


    const startProcess = () => {
        setList([]);
        iterationRef.current += 1; 
        ReadNotation(0, player, notation);
    };

    const stopProcess = () => { 
        iterationRef.current += 1;
    };

    const resetProcess = () => { 
        setList([]);
        iterationRef.current += 1;
    };

    return (
        <div className='z-20'>
            <div className='border-x border-t dark:border-slate-800 p-2 rounded-t-md text-slate-300 h-60 overflow-auto scroll-smooth'>
                <ul className='grid grid-cols-4 items-center gap-1 w-[18rem]'>
                    {list.map((item, index) => (
                        <li key={index} className='dark:bg-[#162137] bg-slate-100 hover:bg-slate-200 dark:hover:bg-[#243047] text-slate-800 dark:text-slate-300 
                         hover:cursor-pointer text-sm flex justify-between p-1 h-8'>
                            <p className='pl-0.5 text-left text-slate-700 dark:text-slate-500'>{index + 1}.</p>
                            <div className='flex justify-end items-center pl-1'>
                                {item === "left" || item === "right" || item === "forward" ?
                                <FontAwesomeIcon icon={whichIcon(item)} className='p-2.5'/> : 
                                (!!item.split("-")[1] && !item.split("-")[1].includes("0" || "1" || "2")) ?                              
                                    <div className='p-0.5 w-7 h-7'>
                                        
                                    <div className={`bg-${item.split("-")[0]}-500 w-full h-full rounded-md flex items-center justify-center`}>
                                        <FontAwesomeIcon icon={whichIcon(item.split("-")[1])} />
                                    </div>
                                    </div>
                                :
                                    <div className='p-0.5 w-7 h-7'>
                                        <div className={`bg-${item.split("-")[0]}-500 w-full h-full rounded-md flex items-center justify-center`}>
                                            {!!item.split("-")[1] && !!item.split("-")[1].includes("0" || "1" || "2") ? item.split("-")[1] : item.includes("f0" || "f1" || "f2") ? item : null}
                                        </div>
                                    </div>
                                }
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className='border-x border-b dark:border-slate-800 p-2 justify-between flex rounded-b-md'>
                <FontAwesomeIcon icon={faPlay} className='border dark:border-slate-800 rounded-md w-10 p-2 text-lg hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 text-green-500 hover:text-green-600' onClick={startProcess}/>
                <FontAwesomeIcon icon={faRotateRight} className='border dark:border-slate-800 rounded-md w-10 p-2 text-lg hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 text-blue-500 hover:text-blue-600' onClick={resetProcess}/>
                <FontAwesomeIcon icon={faStop} className='border dark:border-slate-800 rounded-md w-10 p-2 text-lg hover:cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 text-red-500 hover:text-red-600' onClick={stopProcess}/>
            </div>
        </div>
    );
};

export default NotationList;