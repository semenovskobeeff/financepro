import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ModalContextType {
  isOpen: boolean;
  modalType: string | null;
  modalData: any;
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  const openModal = (type: string, data?: any) => {
    setModalType(type);
    setModalData(data);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalType(null);
    setModalData(null);
  };

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        modalType,
        modalData,
        openModal,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
