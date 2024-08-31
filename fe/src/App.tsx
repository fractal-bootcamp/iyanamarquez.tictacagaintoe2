import './App.css'
import { Link } from 'react-router-dom'

function App() {
  return (
    <div className='flex flex-col justify-center w-screen mt-10'>
      <h1 className='text-2xl font-bold underline'>Tic-Tac-Toe</h1>
      <div className='flex flex-col items-center gap-10 mt-24'>

        <Link to="/with-ai">
          <button className='bg-pink-100 text-black px-4 py-2 rounded-md transition-transform transform active:scale-95'>Play with AI</button>
        </Link>

        <Link to="/with-friend">
          <button className='bg-purple-500 text-white px-4 py-2 rounded-md transition-transform transform active:scale-95'>Play with Friend</button>
        </Link>
      </div>

    </div>

  )
}

export default App


// background thing
{/* <div
            className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-70"
            style={{
              clipPath:
                'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
            }}
          /> */}
{/* <div
          className="hidden lg:block absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
          aria-hidden="true"
        > */}
{/* <div
  className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-70 "
  style={{
    clipPath:
      'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
  }}
/>
        </div >
      </div > */}