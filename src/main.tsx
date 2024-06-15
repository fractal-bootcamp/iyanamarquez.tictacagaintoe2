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
import Modal from './Modal.tsx';

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
  {
    path: "/modal",
    element: <Modal />,
  },
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
    {/* <App /> */}
  </React.StrictMode>,
)
