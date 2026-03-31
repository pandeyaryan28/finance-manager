"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type ModalType = "add-income" | "add-expense" | "add-credit-spend" | "add-budget" | "add-account" | "add-category" | "add-credit-card" | "add-credit-repayment" | "add-lending" | "add-repayment" | "add-loan" | "add-loan-payment" | "add-asset" | "edit-asset" | "settings" | null;

interface ModalContextType {
    activeModal: ModalType;
    modalData: any;
    openModal: (type: ModalType, data?: any) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [modalData, setModalData] = useState<any>(null);

    const openModal = (type: ModalType, data?: any) => {
        setModalData(data || null);
        setActiveModal(type);
    };
    const closeModal = () => {
        setActiveModal(null);
        setModalData(null);
    };

    return (
        <ModalContext.Provider value={{ activeModal, modalData, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}
