
const Header = () => {
    return (
        <div className='h-12 px-4 bg-black/20 backdrop-blur-[1px] border-b border-white/20 flex items-center justify-between text-white'>
            <div className="flex items-center">
                <h3 className='font-semibold tracking-wide'>Trello Clone</h3>
            </div>
            <div className="flex items-center space-x-3">
                <span className='text-sm text-white/90'>Remote dev</span>
                <img className='rounded-full ring-1 ring-white/40' src="https://placehold.co/28x28/png" alt="" />
            </div>
        </div>
    );
}

export default Header;
