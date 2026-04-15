import { useContext, useMemo, useState } from 'react';
import { MoreHorizontal, UserPlus, Edit2, Trash2, Calendar, Tag, Users } from 'react-feather';
import CardAdd from './CardAdd';
import { BoardContext } from '../context/BoardContext';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import AddList from './AddList';
import Utils from '../utils/Utils';

const LIST_COLORS = ['#216E4E', '#9ACD32', '#7F5F01', '#000000'];
const LABEL_COLORS = ['#1d4ed8', '#059669', '#dc2626', '#7c3aed', '#0f766e', '#b45309'];

const getContrastingTextColor = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const normalized = hex.length === 3
        ? hex.split('').map((c) => c + c).join('')
        : hex;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 145 ? '#0f172a' : '#ffffff';
};

const colorFromText = (text, palette) => {
    const value = String(text || '');
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
};

const Main = () => {

    const { allboard, setAllBoard } = useContext(BoardContext);
    const bdata = allboard.boards[allboard.active];
    const [editingListId, setEditingListId] = useState('');
    const [editingListTitle, setEditingListTitle] = useState('');
    const [activeCardRef, setActiveCardRef] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState({ label: '', member: '', dueOnly: false });

    const withBoardUpdate = (updater) => {
        const next = structuredClone(allboard);
        updater(next.boards[next.active]);
        setAllBoard(next);
    };

    const hasDueDate = (card) => Boolean(card.dueDate);
    const matchFilters = (card) => {
        const q = search.trim().toLowerCase();
        const titleOk = !q || card.title.toLowerCase().includes(q);
        const labelOk = !filter.label || (card.labels || []).includes(filter.label);
        const memberOk = !filter.member || (card.members || []).includes(filter.member);
        const dueOk = !filter.dueOnly || hasDueDate(card);
        return titleOk && labelOk && memberOk && dueOk;
    };

    const availableLabels = useMemo(() => {
        const labels = new Set();
        bdata.lists?.forEach((list) => {
            list.cards?.forEach((card) => (card.labels || []).forEach((l) => labels.add(l)));
        });
        return [...labels];
    }, [bdata]);

    function onDragEnd(res) {
        if (!res.destination) {
            return;
        }

        withBoardUpdate((board) => {
            if (res.type === 'LIST') {
                const [removed] = board.lists.splice(res.source.index, 1);
                board.lists.splice(res.destination.index, 0, removed);
                return;
            }
            const sourceListId = String(res.source.droppableId);
            const destListId = String(res.destination.droppableId);
            const sourceList = board.lists.find((list) => String(list.id) === sourceListId);
            const destList = board.lists.find((list) => String(list.id) === destListId);
            if (!sourceList || !destList) return;
            const [removed] = sourceList.cards.splice(res.source.index, 1);
            destList.cards.splice(res.destination.index, 0, removed);
        });
    }

    const cardData = (e, ind) => {
        withBoardUpdate((board) => {
            board.lists[ind].cards.push({
                id: Utils.makeid(6),
                title: e,
                description: '',
                labels: [],
                dueDate: '',
                checklist: [],
                members: []
            });
        });
    };

    const listData = (e) => {
        withBoardUpdate((board) => {
            board.lists.push({ id: Utils.makeid(6), title: e, cards: [] });
        });
    };

    const deleteList = (listId) => {
        withBoardUpdate((board) => {
            board.lists = board.lists.filter((list) => list.id !== listId);
        });
    };

    const startEditList = (list) => {
        setEditingListId(list.id);
        setEditingListTitle(list.title);
    };

    const saveEditList = () => {
        if (!editingListId || !editingListTitle.trim()) return;
        withBoardUpdate((board) => {
            const target = board.lists.find((list) => list.id === editingListId);
            if (target) target.title = editingListTitle.trim();
        });
        setEditingListId('');
        setEditingListTitle('');
    };

    const deleteCard = (listId, cardId) => {
        withBoardUpdate((board) => {
            const targetList = board.lists.find((list) => list.id === listId);
            if (!targetList) return;
            targetList.cards = targetList.cards.filter((card) => card.id !== cardId);
        });
    };

    const openCard = (listId, cardId) => setActiveCardRef({ listId, cardId });
    const closeCard = () => setActiveCardRef(null);

    const selectedCard = useMemo(() => {
        if (!activeCardRef) return null;
        const list = bdata?.lists?.find((x) => x.id === activeCardRef.listId);
        if (!list) return null;
        const card = list.cards.find((x) => x.id === activeCardRef.cardId);
        return card ? { list, card } : null;
    }, [activeCardRef, bdata]);

    const updateSelectedCard = (updater) => {
        if (!selectedCard) return;
        withBoardUpdate((board) => {
            const list = board.lists.find((x) => x.id === selectedCard.list.id);
            if (!list) return;
            const card = list.cards.find((x) => x.id === selectedCard.card.id);
            if (!card) return;
            updater(card);
        });
    };

    const addChecklistItem = () => {
        updateSelectedCard((card) => {
            card.checklist.push({ id: Utils.makeid(6), text: 'New item', completed: false });
        });
    };

    if (!bdata) {
        return null;
    }

    return (
        <div className='flex flex-col w-full min-w-0 h-full' style={{ backgroundColor: bdata.bgcolor || '#0079bf' }}>
            <div className='p-3 bg-black/20 flex justify-between w-full text-white'>
                <h2 className='text-lg font-semibold'>{bdata.name}</h2>
                <div className='flex items-center justify-center'>
                    <button className='bg-white/90 h-8 text-slate-800 px-3 py-1 mr-2 rounded-md flex justify-center items-center text-sm font-medium'>
                        <UserPlus size={16} className='mr-2' />
                        Share
                    </button>
                    <button className='hover:bg-white/20 px-2 py-1 h-8 rounded-md'>
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>
            <div className='px-3 py-2 bg-black/10 border-t border-white/10 flex flex-wrap gap-2 items-center'>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search cards' className='bg-white/90 text-slate-800 px-2 py-1 rounded-md text-sm' />
                <select value={filter.label} onChange={(e) => setFilter({ ...filter, label: e.target.value })} className='bg-white/90 text-slate-800 px-2 py-1 rounded-md text-sm'>
                    <option value=''>All labels</option>
                    {availableLabels.map((label) => <option key={label} value={label}>{label}</option>)}
                </select>
                <select value={filter.member} onChange={(e) => setFilter({ ...filter, member: e.target.value })} className='bg-white/90 text-slate-800 px-2 py-1 rounded-md text-sm'>
                    <option value=''>All members</option>
                    {allboard.members?.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
                <label className='text-sm flex items-center gap-1 text-white'>
                    <input type='checkbox' checked={filter.dueOnly} onChange={(e) => setFilter({ ...filter, dueOnly: e.target.checked })} />
                    Due only
                </label>
            </div>
            <div className='w-full flex-grow min-h-0'>
                <div className='h-full px-3 pb-3 pt-2 overflow-x-auto overflow-y-hidden trello-scrollbar'>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId={String('lists')} direction='horizontal' type='LIST'>
                            {(providedLists) => (
                                <div ref={providedLists.innerRef} {...providedLists.droppableProps} className='flex flex-nowrap h-full items-start gap-3 min-w-max'>
                                    {(bdata.lists || []).map((list, ind) => {
                                        const listBg = LIST_COLORS[ind % LIST_COLORS.length];
                                        const listTextColor = getContrastingTextColor(listBg);
                                        return (
                                       <Draggable
                                            key={list.id}
                                            draggableId={String(list.id)}
                                            index={ind}
                                            disableInteractiveElementBlocking
                                        >
                                            {(providedList) => (
                                                <div
                                                    ref={providedList.innerRef}
                                                    {...providedList.draggableProps}
                                                    className='w-72 min-w-[280px] max-w-[280px] h-fit rounded-xl p-2 flex-shrink-0 shadow-sm'
                                                    style={{
                                                        ...providedList.draggableProps.style,
                                                        backgroundColor: listBg,
                                                        color: listTextColor
                                                    }}
                                                >
                                                    <div className='list-body'>
                                                        <div className='flex justify-between p-1 gap-1 items-center' {...providedList.dragHandleProps}>
                                                            {editingListId === list.id ? (
                                                                <input value={editingListTitle} onChange={(e) => setEditingListTitle(e.target.value)} onBlur={saveEditList} onKeyDown={(e) => e.key === 'Enter' && saveEditList()} className='bg-white/95 px-2 py-1 rounded-md text-sm w-full border border-slate-300 text-slate-800' />
                                                            ) : (
                                                                <button className='text-left w-full font-semibold text-sm' style={{ color: listTextColor }} onDoubleClick={() => startEditList(list)}>{list.title}</button>
                                                            )}
                                                            <button onClick={() => startEditList(list)} className='hover:bg-white/20 p-1 rounded-sm'><Edit2 size={14} color={listTextColor} /></button>
                                                            <button onClick={() => deleteList(list.id)} className='hover:bg-white/20 p-1 rounded-sm'><Trash2 size={14} color={listTextColor} /></button>
                                                        </div>
                                                        <Droppable droppableId={String(list.id)}>
                                                            {(providedCards, snapshot) => (
                                                                <div className='py-1 min-h-2' ref={providedCards.innerRef} style={{ backgroundColor: snapshot.isDraggingOver ? '#dfe1e6' : 'transparent' }} {...providedCards.droppableProps}>
                                                                    {(list.cards || []).filter(matchFilters).map((card, index) => (
                                                                        <Draggable
                                                                            key={card.id}
                                                                            draggableId={String(card.id)}
                                                                            index={index}
                                                                            disableInteractiveElementBlocking
                                                                        >
                                                                            {(providedCard) => (
                                                                                <div ref={providedCard.innerRef} {...providedCard.draggableProps} {...providedCard.dragHandleProps} className='mb-2'>
                                                                                    <div className='item flex justify-between items-start bg-white p-2 cursor-pointer rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-slate-200'>
                                                                                        <button className='text-left w-full min-w-0 text-slate-800' onClick={() => openCard(list.id, card.id)}>
                                                                                            <div className='text-sm leading-5 break-words whitespace-pre-wrap text-slate-800'>{card.title}</div>
                                                                                            <div className='mt-1 flex gap-1 flex-wrap'>
                                                                                                {(card.labels || []).map((label) => {
                                                                                                    const labelBg = colorFromText(label, LABEL_COLORS);
                                                                                                    const labelText = getContrastingTextColor(labelBg);
                                                                                                    return (
                                                                                                        <span
                                                                                                            key={label}
                                                                                                            className='text-[10px] px-1.5 py-0.5 rounded font-medium'
                                                                                                            style={{ backgroundColor: labelBg, color: labelText }}
                                                                                                        >
                                                                                                            {label}
                                                                                                        </span>
                                                                                                    );
                                                                                                })}
                                                                                            </div>
                                                                                        </button>
                                                                                        <span className='flex justify-start items-start shrink-0'>
                                                                                            <button onClick={() => openCard(list.id, card.id)} className='hover:bg-black/10 p-1 rounded-sm text-slate-700'><Edit2 size={16} /></button>
                                                                                            <button onClick={() => deleteCard(list.id, card.id)} className='hover:bg-black/10 p-1 rounded-sm text-slate-700'><Trash2 size={16} /></button>
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </Draggable>
                                                                    ))}
                                                                    {providedCards.placeholder}
                                                                </div>
                                                            )}
                                                        </Droppable>
                                                        <CardAdd getcard={(e) => cardData(e, ind)} />
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                    {providedLists.placeholder}
                                    <AddList getlist={(e) => listData(e)} />
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>
            {selectedCard && (
                <div className='fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50' onClick={closeCard}>
                    <div className='w-full max-w-2xl bg-zinc-900 rounded p-4' onClick={(e) => e.stopPropagation()}>
                        <div className='flex justify-between items-center'>
                            <input className='bg-zinc-800 p-2 rounded w-full mr-2' value={selectedCard.card.title} onChange={(e) => updateSelectedCard((card) => { card.title = e.target.value; })} />
                            <button onClick={closeCard} className='px-2 py-1 bg-zinc-700 rounded'>Close</button>
                        </div>
                        <textarea className='bg-zinc-800 p-2 rounded w-full mt-3' rows='3' value={selectedCard.card.description} onChange={(e) => updateSelectedCard((card) => { card.description = e.target.value; })} placeholder='Description' />
                        <div className='grid grid-cols-2 gap-3 mt-3'>
                            <div className='bg-zinc-800 p-2 rounded'>
                                <div className='text-sm mb-2 flex items-center gap-1'><Tag size={14} /> Labels</div>
                                <input className='bg-zinc-700 px-2 py-1 rounded text-sm w-full' placeholder='comma separated' value={(selectedCard.card.labels || []).join(',')} onChange={(e) => updateSelectedCard((card) => { card.labels = e.target.value.split(',').map((x) => x.trim()).filter(Boolean); })} />
                            </div>
                            <div className='bg-zinc-800 p-2 rounded'>
                                <div className='text-sm mb-2 flex items-center gap-1'><Calendar size={14} /> Due Date</div>
                                <input type='date' className='bg-zinc-700 px-2 py-1 rounded text-sm w-full' value={selectedCard.card.dueDate || ''} onChange={(e) => updateSelectedCard((card) => { card.dueDate = e.target.value; })} />
                            </div>
                        </div>
                        <div className='bg-zinc-800 p-2 rounded mt-3'>
                            <div className='text-sm mb-2 flex items-center gap-1'><Users size={14} /> Members</div>
                            <div className='flex gap-2 flex-wrap'>
                                {allboard.members?.map((member) => {
                                    const selected = (selectedCard.card.members || []).includes(member.id);
                                    return (
                                        <button key={member.id} onClick={() => updateSelectedCard((card) => {
                                            const cur = new Set(card.members || []);
                                            if (cur.has(member.id)) cur.delete(member.id); else cur.add(member.id);
                                            card.members = [...cur];
                                        })} className={`px-2 py-1 rounded text-xs ${selected ? 'bg-blue-700' : 'bg-zinc-700'}`}>
                                            {member.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className='bg-zinc-800 p-2 rounded mt-3'>
                            <div className='flex justify-between items-center mb-2'>
                                <div className='text-sm'>Checklist</div>
                                <button onClick={addChecklistItem} className='text-xs bg-zinc-700 px-2 py-1 rounded'>Add Item</button>
                            </div>
                            <div className='space-y-2'>
                                {(selectedCard.card.checklist || []).map((item) => (
                                    <div key={item.id} className='flex items-center gap-2'>
                                        <input type='checkbox' checked={item.completed} onChange={(e) => updateSelectedCard((card) => {
                                            const target = card.checklist.find((x) => x.id === item.id);
                                            if (target) target.completed = e.target.checked;
                                        })} />
                                        <input className='bg-zinc-700 px-2 py-1 rounded text-sm w-full' value={item.text} onChange={(e) => updateSelectedCard((card) => {
                                            const target = card.checklist.find((x) => x.id === item.id);
                                            if (target) target.text = e.target.value;
                                        })} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Main;
