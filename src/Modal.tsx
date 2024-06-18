import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'

export default function Modal(props: { message: string }) {
    const message = props.message
    const [open, setOpen] = useState(true)

    return (
        <Transition show={open}>
            <Dialog className="relative z-10" onClose={setOpen}>
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className=" flex justify-center items-center flex-col">
                                        <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                            {message}
                                        </DialogTitle>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">

                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                    {/* <iframe src="https://giphy.com/embed/MBZuMSqKlqHC4lDIci" width="480" height="322" class="giphy-embed" allowFullScreen></iframe> */}
                                    <div className='flex justify-center items-center mt-4 flex-col'>
                                        <img src="/fortnitevictorygif.gif" alt="thissss is a gif" width="250" className='text-center' />

                                        <button
                                            type="button"
                                            className="mt-3  justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={() => setOpen(false)}
                                            data-autofocus
                                        >
                                            Close
                                        </button>
                                    </div>


                                </div>

                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
