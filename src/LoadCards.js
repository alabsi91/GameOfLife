
export default function LoadCards(p) {
  return (
    <div className='loadCard' data-key={p.loadsKeys} onClick={p.loadHandle}>
      <img src={p.img} alt='loadimg'></img>
      <div className='loadInfos'>
        <p>Name : {p.name}</p>
        <p>
          Size : {p.width} x {p.height} Grid
        </p>
      </div>
      <button className='deleteSave' onClick={p.removeSaveHandle} title='Delete this from saved drawings'>
        <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='#D7D7D7'>
          <path d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z' />
        </svg>
      </button>
      <button className='exportSave' onClick={p.exportSaveHandle} title='Export this to JSON file'>
        <svg xmlns='http://www.w3.org/2000/svg' height='20px' viewBox='0 0 24 24' width='20px' fill='#D7D7D7'>
          <path d='M23 0v20h-8v-2h6v-16h-18v16h6v2h-8v-20h22zm-12 13h-4l5-6 5 6h-4v11h-2v-11z' />{' '}
        </svg>
      </button>
    </div>
  );
}
