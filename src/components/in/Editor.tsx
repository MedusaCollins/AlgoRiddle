import React, { useEffect, useRef, useState } from 'react'
import Board from './Board'
import Panel from './modules/Panel';
import RulesetPopup from './popups/RulesetPopup';
import Palette from './modules/Palette';

import NotationList from './modules/NotationList';
import Functions from './modules/Functions';
import Commands from './modules/Commands';

type requiredRef = {
    cord: number[];
    color: string;
    required?: boolean;
}[]

type Map = {
    ruleset: {
        control: string[],
        color: string[],
        functions: { name: string; args: number }[];
    },
    player: {
        spawn: number[],
        direction: string,
    },
    board: {
        cord: number[],
        color: string,
        required?: true
    }[]
}

const Editor:React.FC = () => {
    const [args, setArgs] = useState<{f0: number, f1: number, f2: number}>({ f0: 0, f1: 0, f2: 0 });
    const [selectedBlock, setSelectedBlock] = useState<number[][]>([]);
    const [preview, setPreview] = useState<boolean>(false);
    const [notation, setNotation] = useState<string[][]>([]);
    const [list, setList] = useState<string[]>([]);
    const iterationRef = useRef<number>(0);
    const [selected, setSelected] = useState<number[] | null>(null);
    const [rulesetPopup, setRulesetPopup] = useState<boolean>(false);
    const [editorMap, setEditorMap] = useState<Map>({
        ruleset: {
            control: ['left', 'forward', 'right'],
            color: ['red', 'purple', 'blue'],
            functions: [{ name: 'f0', args: args.f0 }, { name: 'f1', args: args.f1 }, { name: 'f2', args: args.f2 }]
        },
        player: { spawn: [], direction: ''},
        board: []
    });
    const [player, setPlayer] = useState<{ cords: number[], direction: string | undefined }>({
        cords: [editorMap.player.spawn[0], editorMap.player.spawn[1]],
        direction: editorMap.player.direction
    });
    const [requiredRef, setRequiredRef] = useState<requiredRef>(editorMap.board.filter((item) => item.required === true));

    useEffect(() => { setRequiredRef(editorMap.board.filter((item) => item.required === true)); }, [editorMap]);
    useEffect(() => { 
        setEditorMap({ ...editorMap, 
            ruleset: { ...editorMap.ruleset, 
                functions: [{ name: 'f0', args: args.f0 }, { name: 'f1', args: args.f1 }, { name: 'f2', args: args.f2 }] 
            } 
        }); 
    }, [args]);
return (
    <div className='flex items-center justify-center relative'>
        <img 
            src='https://tailwindcss.com/_next/static/media/docs@30.8b9a76a2.avif' alt="Glow" 
            className='dark:blur-xl opacity-50 absolute top-0 left-0 overflow-hidden select-none -z-0'/>

    <div className='flex items-center text-white z-30'>
        {preview && 
            <div className='flex flex-col space-y-12 z-20'>
                <Functions {...{selectedMap: editorMap, selected, setSelected, notation}} />
                <Commands {...{selectedMap: editorMap, selected, notation, setNotation}} />
            </div>
        }
        <Board {...{selectedMap: editorMap, setEditorMap, requiredRef, setRequiredRef, player, selectedBlock, setSelectedBlock, preview}}/>        

        {!preview && <Panel {...{setRulesetPopup, setPreview, setSelectedBlock}}/>}

        {preview && <NotationList {...{selectedMap: editorMap, notation, list, setList, iterationRef, player, setPlayer, requiredRef, setRequiredRef, 
        preview, setPreview}}/>}
        
        {rulesetPopup && <RulesetPopup {...{setRulesetPopup, args, setArgs}}/>}
    </div>

    <div className='absolute bottom-5'>
        {selectedBlock.length > 0 && <Palette {...{selectedBlock, setSelectedBlock, editorMap, setEditorMap, setPlayer}}/>}
    </div>
    </div>
)
}

export default Editor