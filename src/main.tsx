import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Root from './routes/root.tsx';
import TicTacToe from './TicTacToe.tsx';


const router = createBrowserRouter([
  {
    path: "/fun",
    element: <Root />,
  },
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/game/:id",
    element: <TicTacToe />,
  },

]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />

  </React.StrictMode>,
)
