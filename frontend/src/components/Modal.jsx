import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          {/* backdrop */}
          <Transition.Child
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>
          {/* center container */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
          <Transition.Child
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left
                            align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title as="h3" className="text-lg font-medium mb-4">{title}</Dialog.Title>
              {children}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
