import { useState } from 'react';
import { X, Plus } from 'react-feather';
import PropTypes from 'prop-types';

const AddList = ({ getlist }) => {

    const [list,setlist] = useState('');
    const [show,setShow] = useState(false);

    const savelist = ()=>{
        if(!list){
            return;
        }
        getlist(list);
        setlist('');
        setShow(!show);
    }

    const closeBtn = ()=>{
        setlist('')
        setShow(!show)
    }


    
    return (
        <div>
            <div className="flex flex-col h-fit flex-shrink-0 w-72 min-w-[280px] max-w-[280px] rounded-xl p-2 bg-black/20 text-white">
            {show && <div>
                <textarea value={list} onChange={(e)=>setlist(e.target.value)} className='p-2 w-full rounded-md border border-slate-300 bg-white text-slate-800' name="" id="" cols="30" rows="2" placeholder='Enter list title...' />
                <div className='flex p-1 mt-1'>
                    <button onClick={()=>savelist()} className='px-2 py-1 rounded-md bg-[#579dff] text-slate-900 mr-2 text-sm font-medium'>Add list</button>
                    <button onClick={()=> closeBtn()} className='p-1 rounded hover:bg-white/20'><X size={16}></X></button>
                </div>
            </div>}
            {!show && <button onClick={()=> setShow(!show)} className='flex p-1 w-full justify-start rounded-md items-center mt-1 hover:bg-white/20 h-8 text-sm'>
                <Plus size={16}></Plus> Add a list
            </button>}
            </div>
        </div>
    );
}

export default AddList;

AddList.propTypes = {
    getlist: PropTypes.func.isRequired
};
