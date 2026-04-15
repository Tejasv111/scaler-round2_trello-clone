import { useEffect, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import { BoardContext } from './context/BoardContext';
import { fetchBoard, saveBoard } from './utils/api';
import { initialData } from './utils/initialData';



function App() {
  const [allboard, setAllBoard] = useState(initialData);
  const [loaded, setLoaded] = useState(false);
  const activeBoardColor = allboard.boards?.[allboard.active]?.bgcolor || '#0079bf';

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const data = await fetchBoard();
        setAllBoard(data);
      } catch (error) {
        // If API is offline, app still works with local seed.
        console.error(error);
      } finally {
        setLoaded(true);
      }
    };
    loadBoard();
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    const timer = setTimeout(() => {
      saveBoard(allboard).catch(() => {});
    }, 250);
    return () => clearTimeout(timer);
  }, [allboard, loaded]);
  
  return (
    <div className='min-h-screen text-white' style={{ backgroundColor: activeBoardColor }}>
    <Header></Header>
    <BoardContext.Provider value={{allboard,setAllBoard}}>
      <div className='content flex h-[calc(100vh-3rem)]'>
        <Sidebar></Sidebar>
        <Main></Main>
      </div>
    </BoardContext.Provider>
    </div>
  )
}

export default App
