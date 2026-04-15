import { useState } from 'react';
import { X, Plus } from 'react-feather';
import PropTypes from 'prop-types';

const CardAdd = ({ getcard }) => {

    const [card,setCard] = useState('');
    const [show,setShow] = useState(false);

    const saveCard = ()=>{
        if(!card){
            return;
        }
        getcard(card);
        setCard('');
        setShow(!show);
    }

    const closeBtn = ()=>{
        setCard('')
        setShow(!show)
    }


    
    return (
        <div>
            <div className="flex flex-col">
            {show && <div>
                <textarea value={card} onChange={(e)=>setCard(e.target.value)} className='p-2 w-full rounded-md border border-slate-300 bg-white text-slate-800' name="" id="" cols="30" rows="2" placeholder='Enter card title...' />
                <div className='flex p-1 mt-1'>
                    <button onClick={()=>saveCard()} className='px-2 py-1 rounded-md bg-[#579dff] text-slate-900 mr-2 text-sm font-medium'>Add card</button>
                    <button onClick={()=> closeBtn()} className='p-1 rounded hover:bg-black/10'><X size={16}></X></button>
                </div>
            </div>}
            {!show && <button onClick={()=> setShow(!show)} className='flex p-1 w-full justify-start rounded-md items-center mt-1 hover:bg-white/20 h-8 text-sm text-white/95'>
                <Plus size={16}></Plus> Add a card
            </button>}
            </div>
        </div>
    );
}

export default CardAdd;

CardAdd.propTypes = {
    getcard: PropTypes.func.isRequired
};
