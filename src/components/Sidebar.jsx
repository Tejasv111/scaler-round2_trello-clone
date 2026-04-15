import { useContext, useState } from 'react';
import { ChevronRight, ChevronLeft, Plus, X, Edit2, Trash2 } from 'react-feather';
import { Popover } from 'react-tiny-popover';
import { BoardContext } from '../context/BoardContext';
import Utils from '../utils/Utils';

const Sidebar = () => {

    const blankBoard = {
        id: '',
        name:'',
        bgcolor:'#f60000',
        lists:[]
    };
    const [boardData,setBoarddata] = useState(blankBoard);
    const [collapsed,setCollapsed] = useState(false);
    const [showpop,setShowpop] = useState(false);
    const {allboard,setAllBoard} = useContext(BoardContext);
    const setActiveboard = (i) => {
        let newBoard = {...allboard}
        newBoard.active = i;
        setAllBoard(newBoard);
    }
    const addBoard = () => {
        if (!boardData.name.trim()) {
            return;
        }
        let newB = {...allboard};
        newB.boards.push({
            ...boardData,
            id: Utils.makeid(6),
            lists: []
        });
        setAllBoard(newB);
        setBoarddata(blankBoard);
        setShowpop(!showpop);
    }

    const editBoard = (index) => {
        const currentBoard = allboard.boards[index];
        if (!currentBoard) return;
        const updatedName = window.prompt('Edit board title', currentBoard.name);
        if (!updatedName || !updatedName.trim()) return;
        const updatedColor = window.prompt('Edit board color hex', currentBoard.bgcolor || '#0079bf');
        const safeColor = updatedColor && updatedColor.trim() ? updatedColor.trim() : currentBoard.bgcolor;
        const next = structuredClone(allboard);
        next.boards[index].name = updatedName.trim();
        next.boards[index].bgcolor = safeColor;
        setAllBoard(next);
    };

    const deleteBoard = (index) => {
        if (allboard.boards.length <= 1) {
            window.alert('At least one board is required.');
            return;
        }
        if (!window.confirm('Delete this board?')) return;
        const next = structuredClone(allboard);
        next.boards.splice(index, 1);
        if (next.active >= next.boards.length) {
            next.active = next.boards.length - 1;
        }
        setAllBoard(next);
    };
    return (
        <div className={`hidden md:block bg-[#161a20] h-[calc(100vh-3rem)] border-r border-white/20 transition-all linear duration-500 flex-shrink-0 ${collapsed ? 'w-[42px]' : 'w-[280px]'}`} >
            {collapsed && <div className='p-2'>
                <button onClick={()=> setCollapsed(!collapsed)} className='hover:bg-white/20 rounded-sm'>
                    <ChevronRight size={18}></ChevronRight>
                </button>
            </div>}
            {!collapsed && <div>
                <div className="workspace p-3 flex justify-between border-b border-white/20">
                    <h4>Remote Dev&apos;s Workspace</h4>
                    <button onClick={()=> setCollapsed(!collapsed)} className='hover:bg-white/20 rounded-sm p-1'>
                        <ChevronLeft size={18}></ChevronLeft>
                    </button>
                </div>
                <div className="boardlist">
                    <div className='flex justify-between px-3 py-2'>
                        <h6>Your Boards</h6>
                        

                        <Popover
                        isOpen={showpop}
                        align='start'
                        positions={['right','top', 'bottom', 'left']} // preferred positions by priority
                        content={
                            <div className='ml-2 p-2 w-60 flex flex-col justify-center items-center bg-[#1d2125] text-white rounded-xl border border-white/10'>
                                <button onClick={() => setShowpop(!showpop)} className='absolute right-2 top-2 hover:bg-white/20 p-1 rounded'><X size={16}></X></button>
                                <h4 className='py-3'>Create Board</h4>
                                <img  src="https://placehold.co/200x120/png" alt="" />
                                <div className="mt-3 flex flex-col items-start w-full">
                                    <label htmlFor="title">Board Title <span>*</span></label>
                                    <input value={boardData.name} onChange={(e)=>setBoarddata({...boardData,name:e.target.value})} type="text" className='mb-2 h-8 px-2 w-full bg-black/30 rounded' />
                                    <label htmlFor="Color">Board Color</label>
                                    <input value={boardData.bgcolor} onChange={(e)=>setBoarddata({...boardData,bgcolor:e.target.value})} type="color" className='mb-2 h-8 px-2 w-full bg-black/30 rounded' />
                                    <button onClick={()=>addBoard()} className='w-full rounded h-8 bg-[#579dff] mt-2 hover:bg-[#85b8ff] text-slate-900 font-medium'>Create</button>
                                </div>
                            </div>
                        }
                        >
                        <button onClick={() => setShowpop(!showpop)} className='hover:bg-white/20 p-1 rounded-sm'>
                            <Plus size={16}></Plus>
                        </button>
                        </Popover>

                    </div>
                </div>
                <ul>
                    {allboard.boards && allboard.boards.map((x,i)=>{
                        return <li key={i}>
                            <div className='px-2 py-1 flex items-center gap-1 hover:bg-white/10 rounded'>
                                <button onClick={()=>setActiveboard(i)} className='px-1 py-1 flex-1 text-sm flex justify-start items-center'>
                                    <span className='w-6 h-max rounded-sm mr-2' style={{backgroundColor:`${x.bgcolor}`}}>&nbsp;</span>
                                    <span className='truncate'>{x.name}</span>
                                </button>
                                <button onClick={() => editBoard(i)} className='p-1 rounded hover:bg-white/20'><Edit2 size={14} /></button>
                                <button onClick={() => deleteBoard(i)} className='p-1 rounded hover:bg-white/20'><Trash2 size={14} /></button>
                            </div>
                        </li>
                    })
                    }
                    
                </ul>
            </div>}
        </div>
    );
}

export default Sidebar;
